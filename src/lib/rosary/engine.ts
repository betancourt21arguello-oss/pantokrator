import type {
  RosarySnapshot,
  TransitionRequest,
  RosaryParticipant,
  RosaryPhase,
  StepType,
} from "@/lib/devotions/types";
import type { PrayerProgram, PrayerNode, PrayerStep, PrayerModule } from "@/lib/devotions/types";

export type SnapshotAction =
  | { type: "HOLD_END"; request: TransitionRequest }
  | { type: "HEARTBEAT"; participant: RosaryParticipant }
  | { type: "JOIN"; participant: RosaryParticipant }
  | { type: "LEAVE"; participantId: string }
  | { type: "ASSIGN_LEADER"; leaderId: string | null }
  | { type: "STEP_TIMEOUT"; serverNow: string }
  | { type: "REFLECTION_TIMEOUT"; serverNow: string };

export function createInitialSnapshot(params: {
  sessionId: string;
  programId: string;
  devotionId: string;
  startNode: PrayerNode;
  leaderId: string | null;
  participants: RosaryParticipant[];
}): RosarySnapshot {
  const now = new Date().toISOString();
  const { sessionId, programId, devotionId, startNode, leaderId, participants } = params;
  const step = startNode as PrayerStep;
  const repeatTotal = step.repeat ?? 1;
  const durationMs = step.durationMs ?? 60_000;

  return {
    sessionId,
    sessionVersion: 1,
    devotionId,
    sectionId: "root",
    stepId: startNode.id,
    stepInstanceId: crypto.randomUUID(),
    stepType: step.type ?? "prayer",
    repeatIteration: 1,
    repeatTotal,
    phase: "active",
    leaderParticipantId: leaderId,
    stepStartedAt: now,
    stepEndsAt: new Date(Date.now() + durationMs).toISOString(),
    reflectionEndsAt: null,
    status: "active",
    participants,
    programId,
  };
}

export function reduceSnapshot(snapshot: RosarySnapshot, action: SnapshotAction): RosarySnapshot {
  switch (action.type) {
    case "HOLD_END":
      return applyHoldEnd(snapshot, action.request);
    case "HEARTBEAT":
      return applyHeartbeat(snapshot, action.participant);
    case "JOIN":
      return applyJoin(snapshot, action.participant);
    case "LEAVE":
      return applyLeave(snapshot, action.participantId);
    case "ASSIGN_LEADER":
      return applyAssignLeader(snapshot, action.leaderId);
    case "STEP_TIMEOUT":
      return applyStepTimeout(snapshot, action.serverNow);
    case "REFLECTION_TIMEOUT":
      return applyReflectionTimeout(snapshot, action.serverNow);
    default:
      return snapshot;
  }
}

function applyHoldEnd(snapshot: RosarySnapshot, request: TransitionRequest): RosarySnapshot {
  if (snapshot.status === "completed") return snapshot;
  if (request.sessionVersion !== snapshot.sessionVersion) return snapshot;
  if (request.stepInstanceId !== snapshot.stepInstanceId) return snapshot;
  if (snapshot.phase !== "active") return snapshot;

  const participants = snapshot.participants.map((p) =>
    p.profileId === request.participantId ? { ...p, isResponding: true } : p
  );

  const eligible = participants.filter((p) => isEligible(p, snapshot));
  const responded = eligible.filter((p) => p.isResponding).length;

  if (!isQuorum(snapshot, responded)) {
    return { ...snapshot, participants };
  }

  if (snapshot.repeatIteration < snapshot.repeatTotal) {
    return {
      ...snapshot,
      participants,
      repeatIteration: snapshot.repeatIteration + 1,
      stepInstanceId: crypto.randomUUID(),
      sessionVersion: snapshot.sessionVersion + 1,
      stepStartedAt: new Date().toISOString(),
      stepEndsAt: new Date(Date.now() + 60_000).toISOString(),
    };
  }

  if (snapshot.stepType === "mystery") {
    return {
      ...snapshot,
      participants,
      phase: "reflection",
      status: "reflection",
      sessionVersion: snapshot.sessionVersion + 1,
      stepStartedAt: new Date().toISOString(),
      stepEndsAt: new Date(Date.now() + 60_000).toISOString(),
      reflectionEndsAt: new Date(Date.now() + 120_000).toISOString(),
    };
  }

  return {
    ...snapshot,
    participants,
    sessionVersion: snapshot.sessionVersion + 1,
    status: "completed",
    phase: "completed",
  };
}

function applyHeartbeat(snapshot: RosarySnapshot, participant: RosaryParticipant): RosarySnapshot {
  const participants = snapshot.participants.map((p) =>
    p.profileId === participant.profileId ? { ...p, lastHeartbeatAt: participant.lastHeartbeatAt } : p
  );

  if (snapshot.status !== "active" && snapshot.status !== "reflection") {
    return { ...snapshot, participants };
  }

  const leaderFresh = snapshot.leaderParticipantId
    ? participants.some((p) => p.profileId === snapshot.leaderParticipantId && isFresh(p))
    : false;

  if (!leaderFresh && participants.length > 0) {
    const newLeader = selectLeader(participants);
    return { ...snapshot, participants, leaderParticipantId: newLeader };
  }

  return { ...snapshot, participants };
}

function applyJoin(snapshot: RosarySnapshot, participant: RosaryParticipant): RosarySnapshot {
  const exists = snapshot.participants.some((p) => p.profileId === participant.profileId);
  if (exists) return snapshot;

  const participants = [...snapshot.participants, participant];
  const newLeader = snapshot.leaderParticipantId ?? selectLeader(participants);

  return {
    ...snapshot,
    participants,
    leaderParticipantId: newLeader,
    sessionVersion: snapshot.sessionVersion + 1,
    status: snapshot.status === "joining" ? "active" : snapshot.status,
  };
}

function applyLeave(snapshot: RosarySnapshot, participantId: string): RosarySnapshot {
  const participants = snapshot.participants.filter((p) => p.profileId !== participantId);
  let leaderId = snapshot.leaderParticipantId;

  if (leaderId === participantId) {
    leaderId = participants.length > 0 ? selectLeader(participants) : null;
  }

  return {
    ...snapshot,
    participants,
    leaderParticipantId: leaderId,
    sessionVersion: snapshot.sessionVersion + 1,
  };
}

function applyAssignLeader(snapshot: RosarySnapshot, leaderId: string | null): RosarySnapshot {
  return { ...snapshot, leaderParticipantId: leaderId };
}

function applyStepTimeout(snapshot: RosarySnapshot, serverNow: string): RosarySnapshot {
  if (snapshot.status !== "active" || snapshot.phase !== "active") return snapshot;
  if (new Date(serverNow) < new Date(snapshot.stepEndsAt)) return snapshot;

  if (snapshot.stepType === "mystery") {
    return {
      ...snapshot,
      phase: "reflection",
      status: "reflection",
      sessionVersion: snapshot.sessionVersion + 1,
      stepStartedAt: serverNow,
      stepEndsAt: new Date(Date.now() + 60_000).toISOString(),
      reflectionEndsAt: new Date(Date.now() + 120_000).toISOString(),
    };
  }

  return {
    ...snapshot,
    sessionVersion: snapshot.sessionVersion + 1,
    status: "completed",
    phase: "completed",
  };
}

function applyReflectionTimeout(snapshot: RosarySnapshot, serverNow: string): RosarySnapshot {
  if (snapshot.status !== "reflection") return snapshot;
  if (!snapshot.reflectionEndsAt || new Date(serverNow) < new Date(snapshot.reflectionEndsAt)) return snapshot;

  return {
    ...snapshot,
    phase: "active",
    status: "active",
    sessionVersion: snapshot.sessionVersion + 1,
    stepStartedAt: serverNow,
    stepEndsAt: new Date(Date.now() + 60_000).toISOString(),
    reflectionEndsAt: null,
  };
}

function isEligible(participant: RosaryParticipant, snapshot: RosarySnapshot): boolean {
  if (snapshot.phase !== "active") return false;
  const age = Date.now() - new Date(participant.lastHeartbeatAt).getTime();
  return age < 30_000;
}

function isFresh(participant: RosaryParticipant): boolean {
  return Date.now() - new Date(participant.lastHeartbeatAt).getTime() < 30_000;
}

function isQuorum(snapshot: RosarySnapshot, respondedCount: number): boolean {
  const eligible = snapshot.participants.filter((p) => isEligible(p, snapshot));
  if (eligible.length <= 1) return true;
  return respondedCount / eligible.length >= 0.7;
}

function selectLeader(participants: RosaryParticipant[]): string | null {
  if (participants.length === 0) return null;
  const fresh = participants
    .filter((p) => isFresh(p))
    .sort((a, b) => a.profileId.localeCompare(b.profileId));
  const pool = fresh.length > 0 ? fresh : participants;
  return pool[0].profileId;
}

export function advanceSnapshot(snapshot: RosarySnapshot, program: PrayerProgram): RosarySnapshot {
  const flat = flattenProgram(program.root);
  const idx = flat.findIndex((n) => n.id === snapshot.stepId);
  if (idx === -1) return snapshot;

  const nextIdx = (idx + 1) % flat.length;
  const next = flat[nextIdx];
  const now = new Date().toISOString();

  return {
    ...snapshot,
    stepId: next.id,
    stepInstanceId: crypto.randomUUID(),
    stepType: (next as PrayerStep).type ?? "prayer",
    repeatIteration: 1,
    repeatTotal: (next as PrayerStep).repeat ?? 1,
    sessionVersion: snapshot.sessionVersion + 1,
    stepStartedAt: now,
    stepEndsAt: new Date(Date.now() + ((next as PrayerStep).durationMs ?? 60_000)).toISOString(),
    reflectionEndsAt: null,
    phase: "active",
    status: "active",
    participants: snapshot.participants.map((p) => ({ ...p, isResponding: false })),
  };
}

function flattenProgram(node: PrayerNode): PrayerNode[] {
  const result: PrayerNode[] = [node];
  if ((node as PrayerModule).children) {
    for (const child of (node as PrayerModule).children) {
      result.push(...flattenProgram(child));
    }
  }
  return result;
}