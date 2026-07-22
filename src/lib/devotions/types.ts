export type StepType =
  | "prayer"
  | "reading"
  | "mystery"
  | "reflection"
  | "music"
  | "silence"
  | "leader_prayer"
  | "community_response"
  | "repeated_prayer"
  | "chat"
  | "voice_note"
  | "image"
  | "final_prayer"
  | "animation"
  | "meditation"
  | "intro"
  | "closing";

export type ModuleType = "sequence" | "repeat" | "choice" | "pause";

export type RoleType = "leader" | "assembly" | "everyone" | "silent" | "automatic";

export type ActionType =
  | "respond"
  | "advance"
  | "repeat"
  | "pause"
  | "play_audio"
  | "show_image"
  | "open_chat"
  | "close_chat"
  | "assign_leader"
  | "release_leader"
  | "emit_broadcast"
  | "update_session";

export type TransitionTrigger =
  | "on_complete"
  | "on_timeout"
  | "on_response"
  | "on_leader_timeout"
  | "on_join";

export interface PrayerRole {
  type: RoleType;
  count?: number;
  autoAssign?: boolean;
}

export interface PrayerAction {
  type: ActionType;
  payload?: Record<string, unknown>;
}

export interface PrayerTransition {
  trigger: TransitionTrigger;
  target: string;
  action?: PrayerAction;
}

export interface PrayerStep {
  id: string;
  type: StepType;
  title: string;
  subtitle?: string;
  text?: string;
  audio?: string;
  image?: string;
  durationMs?: number;
  requiresLeader?: boolean;
  requiresResponse?: boolean;
  repeat?: number;
  roles?: PrayerRole[];
  actions?: PrayerAction[];
  transitions?: PrayerTransition[];
}

export interface PrayerModule {
  id: string;
  type: ModuleType;
  title?: string;
  children: PrayerNode[];
  repeat?: number;
  choice?: string;
  pauseMs?: number;
  transitions?: PrayerTransition[];
}

export type PrayerNode = PrayerStep | PrayerModule;

export interface PrayerProgram {
  id: string;
  slug: string;
  title: string;
  description: string;
  accentColor: string;
  root: PrayerModule;
  metadata?: Record<string, unknown>;
}

export interface PrayerSessionState {
  programId: string;
  currentNodeId: string;
  currentNodeType: "step" | "module";
  repeatCount: number;
  startedAt: string;
  updatedAt: string;
  readerProfileId: string | null;
  readerTimeoutAt: string | null;
  isPaused: boolean;
}

export interface PrayerParticipant {
  profileId: string;
  displayName: string;
  countryCode?: string;
  lastSeenAt: string;
  isResponding: boolean;
  joinedAt: string;
}

export interface PrayerChatMessage {
  id: string;
  profileId: string;
  displayName: string;
  text: string;
  createdAt: string;
}

export type PrayerRealtimeBroadcast =
  | { type: "response"; profileId: string; nodeId: string }
  | { type: "chat"; message: PrayerChatMessage }
  | { type: "join"; participant: PrayerParticipant }
  | { type: "leave"; profileId: string }
  | { type: "reader_timeout" }
  | { type: "node_advance"; nodeId: string; repeatCount: number };

export interface RosaryParticipant {
  profileId: string;
  displayName: string;
  isResponding: boolean;
  lastHeartbeatAt: string;
  joinedAt: string;
}

export interface RosarySnapshot {
  sessionId: string;
  sessionVersion: number;
  devotionId: string;
  sectionId: string;
  stepId: string;
  stepInstanceId: string;
  stepType: StepType;
  repeatIteration: number;
  repeatTotal: number;
  phase: RosaryPhase;
  leaderParticipantId: string | null;
  stepStartedAt: string;
  stepEndsAt: string;
  reflectionEndsAt: string | null;
  status: "joining" | "active" | "reflection" | "completed" | "error";
  participants: RosaryParticipant[];
  programId: string;
}

export interface TransitionRequest {
  sessionId: string;
  eventId: string;
  sessionVersion: number;
  stepInstanceId: string;
  eventType: "HOLD_END" | "HEARTBEAT" | "JOIN" | "LEAVE" | "PAUSE_REQUEST" | "RESUME_REQUEST";
  participantId: string;
  payload?: Record<string, unknown>;
}

export interface RosarySyncReturn {
  participants: RosaryParticipant[];
  currentStepIndex: number;
  isConnected: boolean;
  connectionState: ConnectionState;
  sendResponse: () => void;
  sendChatMessage: (text: string) => void;
  repeatIteration: number;
  repeatTotal: number;
}

export type RosaryPhase = "joining" | "active" | "reflection" | "completed" | "error";
export type ConnectionState = "connecting" | "connected" | "reconnecting" | "stale" | "offline" | "fatal";
