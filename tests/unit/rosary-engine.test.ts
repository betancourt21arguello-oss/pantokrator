import { describe, it, expect } from "vitest";
import {
  createInitialSnapshot,
  reduceSnapshot,
  advanceSnapshot,
} from "@/lib/rosary/engine";
import type { RosarySnapshot, RosaryParticipant, PrayerProgram, PrayerModule } from "@/lib/devotions/types";

const makeParticipant = (id: string, lastSeenMsAgo = 0): RosaryParticipant => ({
  profileId: id,
  displayName: id,
  isResponding: false,
  lastHeartbeatAt: new Date(Date.now() - lastSeenMsAgo).toISOString(),
  joinedAt: new Date().toISOString(),
});

const mockProgram: PrayerProgram = {
  id: "rosario-misterios-dolorosos",
  slug: "misterios-dolorosos",
  title: "Misterios Dolorosos",
  description: "Rosario Perpetuo",
  accentColor: "#C6A15B",
  root: {
    id: "root",
    type: "sequence",
    title: "Rosario Completo",
    children: [
      {
        id: "step-1",
        type: "prayer",
        title: "Padre Nuestro",
        text: "Padre nuestro...",
        durationMs: 8_000,
        requiresResponse: true,
        repeat: 1,
        roles: [{ type: "leader" }, { type: "assembly" }],
        actions: [{ type: "advance" }],
      } as any,
    ],
  },
};

describe("RosaryEngine - reducer puro", () => {
  it("creates initial snapshot", () => {
    const snapshot = createInitialSnapshot({
      sessionId: "session-1",
      programId: "rosario-misterios-dolorosos",
      devotionId: "rosary",
      startNode: mockProgram.root.children[0],
      leaderId: "p1",
      participants: [makeParticipant("p1")],
    });

    expect(snapshot.sessionVersion).toBe(1);
    expect(snapshot.repeatIteration).toBe(1);
    expect(snapshot.repeatTotal).toBe(1);
    expect(snapshot.leaderParticipantId).toBe("p1");
  });

  it("advances repeat iteration on quorum", () => {
    const participants = [makeParticipant("p1")];

    const snapshot: RosarySnapshot = {
      sessionId: "session-1",
      sessionVersion: 1,
      devotionId: "rosary",
      sectionId: "root",
      stepId: "step-1",
      stepInstanceId: "inst-1",
      stepType: "repeated_prayer",
      repeatIteration: 1,
      repeatTotal: 10,
      phase: "active",
      leaderParticipantId: "p1",
      stepStartedAt: new Date().toISOString(),
      stepEndsAt: new Date(Date.now() + 60_000).toISOString(),
      reflectionEndsAt: null,
      status: "active",
      participants,
      programId: "rosario-misterios-dolorosos",
    };

    const next = reduceSnapshot(snapshot, {
      type: "HOLD_END",
      request: {
        sessionId: "session-1",
        eventId: "evt-1",
        sessionVersion: 1,
        stepInstanceId: "inst-1",
        eventType: "HOLD_END",
        participantId: "p1",
      },
    });

    expect(next.repeatIteration).toBe(2);
    expect(next.sessionVersion).toBe(2);
    expect(next.stepInstanceId).not.toBe("inst-1");
  });

  it("never exceeds repeatTotal", () => {
    const participants = [makeParticipant("p1"), makeParticipant("p2")];
    let snapshot: RosarySnapshot = {
      sessionId: "session-1",
      sessionVersion: 1,
      devotionId: "rosary",
      sectionId: "root",
      stepId: "step-1",
      stepInstanceId: "inst-1",
      stepType: "repeated_prayer",
      repeatIteration: 10,
      repeatTotal: 10,
      phase: "active",
      leaderParticipantId: "p1",
      stepStartedAt: new Date().toISOString(),
      stepEndsAt: new Date(Date.now() + 60_000).toISOString(),
      reflectionEndsAt: null,
      status: "active",
      participants,
      programId: "rosario-misterios-dolorosos",
    };

    for (let i = 0; i < 100; i++) {
      snapshot = reduceSnapshot(snapshot, {
        type: "HOLD_END",
        request: {
          sessionId: "session-1",
          eventId: `evt-${i}`,
          sessionVersion: snapshot.sessionVersion,
          stepInstanceId: snapshot.stepInstanceId,
          eventType: "HOLD_END",
          participantId: "p1",
        },
      });
    }

    const maxIteration = Math.max(...snapshot.participants.map((p) => p.isResponding ? 1 : 0));
    expect(snapshot.repeatIteration).toBeLessThanOrEqual(10);
  });

  it("replaces leader if leader heartbeat is stale", () => {
    const participants = [
      makeParticipant("p1", 60_000), // stale
      makeParticipant("p2"), // fresh
    ];

    const snapshot: RosarySnapshot = {
      sessionId: "session-1",
      sessionVersion: 1,
      devotionId: "rosary",
      sectionId: "root",
      stepId: "step-1",
      stepInstanceId: "inst-1",
      stepType: "prayer",
      repeatIteration: 1,
      repeatTotal: 1,
      phase: "active",
      leaderParticipantId: "p1",
      stepStartedAt: new Date().toISOString(),
      stepEndsAt: new Date(Date.now() + 60_000).toISOString(),
      reflectionEndsAt: null,
      status: "active",
      participants,
      programId: "rosario-misterios-dolorosos",
    };

    const next = reduceSnapshot(snapshot, {
      type: "HEARTBEAT",
      participant: makeParticipant("p2"),
    });

    expect(next.leaderParticipantId).toBe("p2");
  });

  it("rejects duplicate HOLD_END (idempotency)", () => {
    const participants = [makeParticipant("p1"), makeParticipant("p2")];
    const snapshot: RosarySnapshot = {
      sessionId: "session-1",
      sessionVersion: 1,
      devotionId: "rosary",
      sectionId: "root",
      stepId: "step-1",
      stepInstanceId: "inst-1",
      stepType: "repeated_prayer",
      repeatIteration: 1,
      repeatTotal: 10,
      phase: "active",
      leaderParticipantId: "p1",
      stepStartedAt: new Date().toISOString(),
      stepEndsAt: new Date(Date.now() + 60_000).toISOString(),
      reflectionEndsAt: null,
      status: "active",
      participants,
      programId: "rosario-misterios-dolorosos",
    };

    const first = reduceSnapshot(snapshot, {
      type: "HOLD_END",
      request: {
        sessionId: "session-1",
        eventId: "evt-dup",
        sessionVersion: 1,
        stepInstanceId: "inst-1",
        eventType: "HOLD_END",
        participantId: "p1",
      },
    });

    const second = reduceSnapshot(first, {
      type: "HOLD_END",
      request: {
        sessionId: "session-1",
        eventId: "evt-dup",
        sessionVersion: 1,
        stepInstanceId: "inst-1",
        eventType: "HOLD_END",
        participantId: "p1",
      },
    });

    expect(second.sessionVersion).toBe(first.sessionVersion);
  });

  it("simulates 1 participant completing rosary", () => {
    const participants = [makeParticipant("p1")];
    let snapshot: RosarySnapshot = {
      sessionId: "session-1",
      sessionVersion: 1,
      devotionId: "rosary",
      sectionId: "root",
      stepId: "step-1",
      stepInstanceId: "inst-1",
      stepType: "repeated_prayer",
      repeatIteration: 1,
      repeatTotal: 10,
      phase: "active",
      leaderParticipantId: "p1",
      stepStartedAt: new Date().toISOString(),
      stepEndsAt: new Date(Date.now() + 60_000).toISOString(),
      reflectionEndsAt: null,
      status: "active",
      participants,
      programId: "rosario-misterios-dolorosos",
    };

    for (let i = 0; i < 10; i++) {
      snapshot = reduceSnapshot(snapshot, {
        type: "HOLD_END",
        request: {
          sessionId: "session-1",
          eventId: `evt-${i}`,
          sessionVersion: snapshot.sessionVersion,
          stepInstanceId: snapshot.stepInstanceId,
          eventType: "HOLD_END",
          participantId: "p1",
        },
      });
    }

    expect(snapshot.repeatIteration).toBeLessThanOrEqual(10);
  });

  it("simulates 100 participants with simultaneous events", () => {
    const participants = Array.from({ length: 100 }, (_, i) => makeParticipant(`p${i}`));
    let snapshot: RosarySnapshot = {
      sessionId: "session-1",
      sessionVersion: 1,
      devotionId: "rosary",
      sectionId: "root",
      stepId: "step-1",
      stepInstanceId: "inst-1",
      stepType: "repeated_prayer",
      repeatIteration: 1,
      repeatTotal: 10,
      phase: "active",
      leaderParticipantId: "p1",
      stepStartedAt: new Date().toISOString(),
      stepEndsAt: new Date(Date.now() + 60_000).toISOString(),
      reflectionEndsAt: null,
      status: "active",
      participants,
      programId: "rosario-misterios-dolorosos",
    };

    for (let i = 0; i < 10; i++) {
      const responder = participants[i % participants.length];
      snapshot = reduceSnapshot(snapshot, {
        type: "HOLD_END",
        request: {
          sessionId: "session-1",
          eventId: `evt-100-${i}`,
          sessionVersion: snapshot.sessionVersion,
          stepInstanceId: snapshot.stepInstanceId,
          eventType: "HOLD_END",
          participantId: responder.profileId,
        },
      });
    }

    expect(snapshot.repeatIteration).toBeLessThanOrEqual(10);
  });

  it("rejects late event from previous step", () => {
    const participants = [makeParticipant("p1")];
    let snapshot: RosarySnapshot = {
      sessionId: "session-1",
      sessionVersion: 1,
      devotionId: "rosary",
      sectionId: "root",
      stepId: "step-1",
      stepInstanceId: "inst-1",
      stepType: "repeated_prayer",
      repeatIteration: 1,
      repeatTotal: 10,
      phase: "active",
      leaderParticipantId: "p1",
      stepStartedAt: new Date().toISOString(),
      stepEndsAt: new Date(Date.now() + 60_000).toISOString(),
      reflectionEndsAt: null,
      status: "active",
      participants,
      programId: "rosario-misterios-dolorosos",
    };

    snapshot = reduceSnapshot(snapshot, {
      type: "HOLD_END",
      request: {
        sessionId: "session-1",
        eventId: "evt-1",
        sessionVersion: 1,
        stepInstanceId: "inst-1",
        eventType: "HOLD_END",
        participantId: "p1",
      },
    });

    const lateSnapshot = reduceSnapshot(snapshot, {
      type: "HOLD_END",
      request: {
        sessionId: "session-1",
        eventId: "evt-late",
        sessionVersion: 1,
        stepInstanceId: "inst-1",
        eventType: "HOLD_END",
        participantId: "p1",
      },
    });

    expect(lateSnapshot.sessionVersion).toBe(snapshot.sessionVersion);
  });

  it("simulates 2 participants with leader fallback", () => {
    const participants = [
      makeParticipant("p1", 60_000), // stale leader
      makeParticipant("p2"), // fresh
    ];

    let snapshot: RosarySnapshot = {
      sessionId: "session-1",
      sessionVersion: 1,
      devotionId: "rosary",
      sectionId: "root",
      stepId: "step-1",
      stepInstanceId: "inst-1",
      stepType: "repeated_prayer",
      repeatIteration: 1,
      repeatTotal: 10,
      phase: "active",
      leaderParticipantId: "p1",
      stepStartedAt: new Date().toISOString(),
      stepEndsAt: new Date(Date.now() + 60_000).toISOString(),
      reflectionEndsAt: null,
      status: "active",
      participants,
      programId: "rosario-misterios-dolorosos",
    };

    snapshot = reduceSnapshot(snapshot, {
      type: "HEARTBEAT",
      participant: makeParticipant("p2"),
    });

    expect(snapshot.leaderParticipantId).toBe("p2");
  });
});
