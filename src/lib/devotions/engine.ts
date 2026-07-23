import type {
  PrayerProgram,
  PrayerNode,
  PrayerStep,
  PrayerModule,
  PrayerSessionState,
  PrayerParticipant,
  PrayerRole,
  PrayerAction,
  PrayerTransition,
  PrayerRealtimeBroadcast,
  RoleType,
} from "./types";

export interface PrayerEngine {
  program: PrayerProgram;
  session: PrayerSessionState;
}

export function loadProgram(program: PrayerProgram): PrayerEngine {
  return { program, session: initializeSession(program) };
}

export interface FlattenedNode {
  id: string;
  node: PrayerNode;
  depth: number;
  path: string[];
}

export function flattenProgram(program: PrayerProgram): FlattenedNode[] {
  const result: FlattenedNode[] = [];

  function walk(node: PrayerNode, depth: number, path: string[]) {
    const currentPath = [...path, node.id];
    result.push({ id: node.id, node, depth, path: currentPath });

    if (node.type === "sequence" || node.type === "choice") {
      node.children.forEach((child) => walk(child, depth + 1, currentPath));
    }
  }

  walk(program.root, 0, []);
  return result;
}

export function getNodeById(
  program: PrayerProgram,
  nodeId: string,
): PrayerNode | undefined {
  return flattenProgram(program).find((n) => n.id === nodeId)?.node;
}

export function initializeSession(program: PrayerProgram): PrayerSessionState {
  const flat = flattenProgram(program);
  const firstStep = flat.find((n) => isStep(n.node));
  const target = firstStep ?? flat[0] ?? { id: program.root.id };

  return {
    programId: program.id,
    currentNodeId: target.id,
    currentNodeType: isStep(target.node) ? "step" : "module",
    repeatCount: 0,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readerProfileId: null,
    readerTimeoutAt: null,
    isPaused: false,
  };
}

export function getCurrentNode(
  program: PrayerProgram,
  session: PrayerSessionState,
): PrayerNode | undefined {
  return getNodeById(program, session.currentNodeId);
}

export function getCurrentStep(
  program: PrayerProgram,
  session: PrayerSessionState,
): PrayerStep | undefined {
  const node = getCurrentNode(program, session);
  if (!node || node.type === "sequence" || node.type === "repeat" || node.type === "choice" || node.type === "pause") {
    return undefined;
  }
  return node as PrayerStep;
}

export function advanceSession(
  program: PrayerProgram,
  session: PrayerSessionState,
): PrayerSessionState {
  const currentNode = getCurrentNode(program, session);
  if (!currentNode) return session;

  const now = new Date().toISOString();

  if (currentNode.type === "repeat") {
    const repeatModule = currentNode as PrayerModule & { repeat?: number };
    const maxRepeats = repeatModule.repeat ?? 1;
    if (session.repeatCount + 1 < maxRepeats) {
      return {
        ...session,
        repeatCount: session.repeatCount + 1,
        currentNodeId: currentNode.children[0]?.id ?? currentNode.id,
        currentNodeType: currentNode.children[0] ? (isStep(currentNode.children[0]) ? "step" : "module") : "module",
        updatedAt: now,
      };
    }
  }

  const flat = flattenProgram(program);
  const currentIndex = flat.findIndex((n) => n.id === session.currentNodeId);
  if (currentIndex === -1) {
    return { ...session, updatedAt: now, isPaused: true };
  }

  const nextIndex = (currentIndex + 1) % flat.length;
  const next = flat[nextIndex];
  return {
    ...session,
    currentNodeId: next.id,
    currentNodeType: isStep(next.node) ? "step" : "module",
    repeatCount: 0,
    updatedAt: now,
  };
}

export function evaluateTransition(
  program: PrayerProgram,
  session: PrayerSessionState,
  trigger: PrayerTransition["trigger"],
  payload?: Record<string, unknown>,
): PrayerSessionState | null {
  const currentNode = getCurrentNode(program, session);
  if (!currentNode || isStep(currentNode)) return null;

  const mod = currentNode as PrayerModule;
  const transition = mod.children
    .flatMap((child) => child.type !== "sequence" && child.type !== "repeat" && child.type !== "choice" && child.type !== "pause" ? [] : (child as PrayerModule).transitions ?? [])
    .find((t) => t.trigger === trigger);

  if (!transition) return null;
  if (transition.action) {
    executeAction(program, session, transition.action, payload);
  }
  return advanceSession(program, session);
}

export function executeAction(
  program: PrayerProgram,
  session: PrayerSessionState,
  action: { type: PrayerAction["type"]; payload?: Record<string, unknown> },
  payload?: Record<string, unknown>,
): void {
  switch (action.type) {
    case "emit_broadcast":
      const message: PrayerRealtimeBroadcast = {
        type: "node_advance",
        nodeId: session.currentNodeId,
        repeatCount: session.repeatCount,
      };
      console.log("[PrayerEngine] Broadcast:", message);
      break;
    case "assign_leader":
      console.log("[PrayerEngine] Assign leader:", payload?.profileId ?? "auto");
      break;
    case "release_leader":
      console.log("[PrayerEngine] Release leader");
      break;
    case "open_chat":
      console.log("[PrayerEngine] Open chat");
      break;
    case "close_chat":
      console.log("[PrayerEngine] Close chat");
      break;
    case "play_audio":
      console.log("[PrayerEngine] Play audio:", action.payload?.url ?? payload?.url);
      break;
    case "show_image":
      console.log("[PrayerEngine] Show image:", action.payload?.url ?? payload?.url);
      break;
    default:
      break;
  }
}

export function assignRole(
  step: PrayerStep,
  participants: PrayerParticipant[],
  repeatCount: number = 0,
): Map<RoleType, PrayerParticipant[]> {
  const roles = new Map<RoleType, PrayerParticipant[]>();

  for (const role of step.roles ?? [{ type: "everyone" }]) {
    roles.set(role.type, []);
  }

  if (!step.roles || step.roles.length === 0) {
    roles.set("everyone", participants);
    return roles;
  }

  for (const role of step.roles) {
    switch (role.type) {
      case "leader":
        if (participants.length > 0) {
          roles.get("leader")?.push(participants[0]);
        }
        break;
      case "assembly":
        roles.set("assembly", participants.slice(1));
        break;
      case "everyone":
        roles.set("everyone", participants);
        break;
      case "silent":
        roles.set("silent", []);
        break;
      case "automatic":
        if (participants.length > 0) {
          const idx = repeatCount % participants.length;
          roles.get("automatic")?.push(participants[idx]);
        }
        break;
    }
  }

  return roles;
}

export function isStep(node: PrayerNode): node is PrayerStep {
  return node.type !== "sequence" && node.type !== "repeat" && node.type !== "choice" && node.type !== "pause";
}

export function isModule(node: PrayerNode): node is PrayerModule {
  return !isStep(node);
}
