# =============================================================================
# CAMINO · Rosario Perpetuo — Guía de implementación paso a paso
# =============================================================================
# Este documento contiene las instrucciones exactas para completar la
# arquitectura del Rosario Perpetuo: motor de oración en árbol, esquema Supabase,
# Worker Hono, API Routes, integración con R2 y testing.
# =============================================================================

## Índice
1. Estructura de carpetas objetivo
2. Esquema Supabase (SQL exacto)
3. Motor de oración en árbol (engine)
4. Worker Hono (loop, timeout, heartbeat)
5. API Routes (session, chat, heartbeat proxy)
6. Integración con Cloudflare R2
7. Testing (unit + integración)
8. Configuraciones manuales en Supabase
9. Deploy y Producción

---

## 1. Estructura de carpetas objetivo

Crea estas carpetas y archivos nuevos en el proyecto:

```
src/
├── lib/
│   ├── devotions/
│   │   ├── types.ts                  # Tipos del motor universal
│   │   ├── engine.ts                 # Motor genérico de oración
│   │   ├── programs/
│   │   │   └── rosary-misterios-dolorosos.json
│   │   └── supabase-realtime.ts      # Helper de Realtime
│   ├── rosario/
│   │   └── schema.ts                 # Schema Drizzle para Worker
│   └── r2.ts                         # Helper de Cloudflare R2
├── worker/
│   └── index.ts                      # Worker Hono principal (Cloudflare)
├── app/
│   ├── rosario/
│   │   ├── page.tsx                  # Rosario individual
│   │   └── en-vivo/
│   │       └── page.tsx              # Rosario comunitario
│   └── api/
│       └── rosario/
│           ├── session/route.ts      # GET/POST sesión
│           ├── chat/route.ts         # GET/POST chat
│           └── heartbeat/route.ts    # POST heartbeat
├── components/
│   └── rosario/
│       ├── RosaryCommunitySVG.tsx
│       ├── CommunityTreeSVG.tsx
│       └── LivePrayerScreen.tsx
├── hooks/
│   ├── usePrayerExperience.ts
│   └── useRosarioSync.ts
└── types/
    └── speech.d.ts

tests/
├── unit/
│   ├── rosario-engine.test.ts
│   └── RosaryCommunitySVG.test.tsx
└── integration/
    └── rosario-realtime.test.ts
```

---

## 2. Esquema Supabase (SQL exacto)

### 2.1. Crear tablas

Ejecuta este script en el **SQL Editor** de Supabase:

```sql
-- ===========================================================================
-- CAMINO · Rosario Perpetuo — Tablas de estado compartido
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Tabla: rosary_sessions
-- Representa UNA sesión global de un programa de devoción (ej: Rosario).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rosary_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  program_id TEXT NOT NULL,
  program_slug TEXT NOT NULL,

  current_node_id TEXT NOT NULL,
  current_node_type TEXT NOT NULL DEFAULT 'step',
  repeat_count INTEGER NOT NULL DEFAULT 0,

  reader_profile_id UUID,
  reader_timeout_at TIMESTAMPTZ,
  reader_assigned_at TIMESTAMPTZ,

  total_participants INTEGER NOT NULL DEFAULT 0,
  total_responses INTEGER NOT NULL DEFAULT 0,

  is_paused BOOLEAN NOT NULL DEFAULT FALSE,

  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_active_program UNIQUE (program_id)
);

CREATE INDEX IF NOT EXISTS idx_rosary_sessions_program
  ON public.rosary_sessions (program_id);

CREATE INDEX IF NOT EXISTS idx_rosary_sessions_reader_timeout
  ON public.rosary_sessions (reader_timeout_at)
  WHERE reader_profile_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Tabla: rosary_participants
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rosary_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  session_id UUID NOT NULL REFERENCES public.rosary_sessions(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  display_name TEXT NOT NULL,
  country_code TEXT,
  avatar_seed TEXT,

  is_responding BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_participant_per_session UNIQUE (session_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_rosary_participants_session
  ON public.rosary_participants (session_id);

CREATE INDEX IF NOT EXISTS idx_rosary_participants_profile
  ON public.rosary_participants (profile_id);

CREATE INDEX IF NOT EXISTS idx_rosary_participants_last_seen
  ON public.rosary_participants (last_seen_at);

-- ---------------------------------------------------------------------------
-- Tabla: rosary_chat
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rosary_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  session_id UUID NOT NULL REFERENCES public.rosary_sessions(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  display_name TEXT NOT NULL,
  text TEXT NOT NULL CHECK (char_length(text) <= 120),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rosary_chat_session_created
  ON public.rosary_chat (session_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Tabla: prayer_programs
-- Almacena los programas JSON de devoción
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prayer_programs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  accent_color TEXT NOT NULL DEFAULT '#C6A15B',
  root_json JSONB NOT NULL,
  metadata JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prayer_programs_slug
  ON public.prayer_programs (slug);
```

### 2.2. Habilitar Realtime en Supabase

**Paso 1:** Ve a **Database → Replication** en la Supabase Console.

**Paso 2:** Habilita Realtime para estas tablas:
- `rosary_sessions`
- `rosary_participants`
- `rosary_chat`

### 2.3. RLS Policies (Row Level Security)

Ejecuta este SQL:

```sql
ALTER TABLE public.rosary_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rosary_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rosary_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_programs ENABLE ROW LEVEL SECURITY;

-- Lectura pública para sesiones y participantes
CREATE POLICY "public_read_sessions"
  ON public.rosary_sessions FOR SELECT USING (true);

CREATE POLICY "public_read_participants"
  ON public.rosary_participants FOR SELECT USING (true);

CREATE POLICY "public_read_chat"
  ON public.rosary_chat FOR SELECT USING (true);

CREATE POLICY "public_read_programs"
  ON public.prayer_programs FOR SELECT USING (true);

-- Escritura desde el backend (service_role)
CREATE POLICY "service_write_sessions"
  ON public.rosary_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "service_write_participants"
  ON public.rosary_participants FOR INSERT WITH CHECK (true);

CREATE POLICY "service_write_chat"
  ON public.rosary_chat FOR INSERT WITH CHECK (true);

CREATE POLICY "service_write_programs"
  ON public.prayer_programs FOR INSERT WITH CHECK (true);

CREATE POLICY "service_update_sessions"
  ON public.rosary_sessions FOR UPDATE USING (true);

CREATE POLICY "service_update_programs"
  ON public.prayer_programs FOR UPDATE USING (true);
```

> Nota: para producción estricta, reemplaza `USING (true)` por validación de `auth.uid()`.

### 2.4. Seed inicial

```sql
INSERT INTO public.prayer_programs (
  id, slug, title, description, accent_color, root_json
) VALUES (
  'rosario-misterios-dolorosos',
  'misterios-dolorosos',
  'Misterios Dolorosos',
  'Rosario Perpetuo — Misterios Dolorosos',
  '#C6A15B',
  '{"id":"root","type":"sequence","children":[]}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rosary_sessions (
  program_id, program_slug, current_node_id, current_node_type,
  repeat_count, started_at
) VALUES (
  'rosario-misterios-dolorosos',
  'misterios-dolorosos',
  'step-signo-cruz',
  'step',
  0,
  now()
) ON CONFLICT (program_id) DO NOTHING;
```

---

## 3. Motor de oración en árbol

### 3.1. Tipos (`src/lib/devotions/types.ts`)

```ts
export type StepType =
  | "prayer" | "reading" | "mystery" | "reflection" | "music"
  | "silence" | "leader_prayer" | "community_response"
  | "repeated_prayer" | "chat" | "voice_note" | "image"
  | "final_prayer" | "animation" | "meditation" | "intro" | "closing";

export type ModuleType = "sequence" | "repeat" | "choice" | "pause";
export type RoleType = "leader" | "assembly" | "everyone" | "silent" | "automatic";
export type ActionType =
  | "respond" | "advance" | "repeat" | "pause"
  | "play_audio" | "show_image" | "open_chat" | "close_chat"
  | "assign_leader" | "release_leader" | "emit_broadcast" | "update_session";

export type TransitionTrigger =
  | "on_complete" | "on_timeout" | "on_response"
  | "on_leader_timeout" | "on_join";

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
```

### 3.2. Engine (`src/lib/devotions/engine.ts`)

```ts
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

export interface FlattenedNode {
  id: string;
  node: PrayerNode;
  depth: number;
  path: string[];
}

export function loadProgram(program: PrayerProgram): PrayerEngine {
  return { program, session: initializeSession(program) };
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
  if (!node || isModule(node)) return undefined;
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

  const module = currentNode as PrayerModule;
  const transition = module.children
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
```

### 3.3. JSON del Rosario (`src/lib/devotions/programs/rosary-misterios-dolorosos.json`)

```json
{
  "id": "rosario-misterios-dolorosos",
  "slug": "misterios-dolorosos",
  "title": "Misterios Dolorosos",
  "description": "Rosario Perpetuo — Misterios Dolorosos",
  "accentColor": "#C6A15B",
  "root": {
    "id": "root",
    "type": "sequence",
    "title": "Rosario Completo",
    "children": [
      {
        "id": "module-intro",
        "type": "sequence",
        "title": "Introducción",
        "children": [
          {
            "id": "step-signo-cruz",
            "type": "prayer",
            "title": "Por la señal de la Santa Cruz",
            "subtitle": "En el nombre del Padre, del Hijo y del Espíritu Santo. Amén.",
            "text": "En el nombre del Padre, del Hijo y del Espíritu Santo. Amén.",
            "durationMs": 4000,
            "requiresResponse": false,
            "roles": [{ "type": "everyone" }],
            "actions": [{ "type": "advance" }]
          },
          {
            "id": "step-acto-contricion",
            "type": "prayer",
            "title": "Acto de Contrición",
            "text": "Señor mío Jesucristo, porque me amas, me pesa de todo corazón haber ofendido...",
            "durationMs": 8000,
            "requiresResponse": true,
            "roles": [{ "type": "leader" }, { "type": "assembly" }],
            "actions": [{ "type": "advance" }]
          },
          {
            "id": "step-credo",
            "type": "prayer",
            "title": "Credo",
            "subtitle": "Credo de los Apóstoles",
            "text": "Creo en Dios, Padre todopoderoso, Creador del cielo y de la tierra...",
            "durationMs": 12000,
            "requiresResponse": true,
            "roles": [{ "type": "leader" }, { "type": "assembly" }],
            "actions": [{ "type": "advance" }]
          },
          {
            "id": "step-padrenuestro",
            "type": "prayer",
            "title": "Padre Nuestro",
            "text": "Padre nuestro, que estás en el cielo, santificado sea tu Nombre...",
            "durationMs": 8000,
            "requiresResponse": true,
            "roles": [{ "type": "leader" }, { "type": "assembly" }],
            "actions": [{ "type": "advance" }]
          },
          {
            "id": "step-ave-maria-x3",
            "type": "repeated_prayer",
            "title": "Ave María",
            "subtitle": "3 Avemarías por las virtudes teologales",
            "text": "Dios te salve, María, llena eres de gracia, el Señor es contigo...",
            "repeat": 3,
            "durationMs": 6000,
            "requiresResponse": true,
            "roles": [{ "type": "leader" }, { "type": "assembly" }],
            "actions": [{ "type": "advance" }]
          },
          {
            "id": "step-gloria",
            "type": "prayer",
            "title": "Gloria al Padre",
            "text": "Gloria al Padre, y al Hijo, y al Espíritu Santo...",
            "durationMs": 5000,
            "requiresResponse": true,
            "roles": [{ "type": "everyone" }],
            "actions": [{ "type": "advance" }]
          }
        ]
      },
      {
        "id": "module-ciclo-misterios",
        "type": "repeat",
        "title": "Ciclo de Misterios",
        "repeat": 5,
        "children": [
          {
            "id": "module-misterio",
            "type": "sequence",
            "title": "Misterio",
            "children": [
              {
                "id": "step-misterio",
                "type": "mystery",
                "title": "Misterio Doloroso",
                "subtitle": "La Oración en el Huerto",
                "text": "Mi alma está triste hasta el morir; quedaos aquí y velad conmigo. (Mt 26, 38)",
                "image": "https://...",
                "durationMs": 30000,
                "requiresResponse": false,
                "roles": [{ "type": "silent" }],
                "actions": [
                  { "type": "show_image" },
                  { "type": "play_audio", "payload": { "url": "https://..." } },
                  { "type": "advance" }
                ]
              },
              {
                "id": "step-padrenuestro-misterio",
                "type": "prayer",
                "title": "Padre Nuestro",
                "text": "Padre nuestro, que estás en el cielo...",
                "durationMs": 8000,
                "requiresResponse": true,
                "roles": [{ "type": "leader" }, { "type": "assembly" }],
                "actions": [{ "type": "advance" }]
              },
              {
                "id": "step-ave-maria-x10",
                "type": "repeated_prayer",
                "title": "Ave María",
                "subtitle": "10 Avemarías",
                "text": "Dios te salve, María...",
                "repeat": 10,
                "durationMs": 6000,
                "requiresResponse": true,
                "roles": [{ "type": "leader" }, { "type": "assembly" }],
                "actions": [{ "type": "advance" }]
              },
              {
                "id": "step-gloria-misterio",
                "type": "prayer",
                "title": "Gloria",
                "text": "Gloria al Padre...",
                "durationMs": 5000,
                "requiresResponse": true,
                "roles": [{ "type": "everyone" }],
                "actions": [{ "type": "advance" }]
              },
              {
                "id": "step-maria-madre-gracia",
                "type": "prayer",
                "title": "María Madre de Gracia",
                "text": "María, madre de gracia y misericordia...",
                "durationMs": 5000,
                "requiresResponse": true,
                "roles": [{ "type": "everyone" }],
                "actions": [{ "type": "advance" }]
              },
              {
                "id": "step-oh-jesus",
                "type": "prayer",
                "title": "Oh Jesús mío",
                "text": "Oh Jesús mío, perdónanos nuestros pecados...",
                "durationMs": 5000,
                "requiresResponse": true,
                "roles": [{ "type": "everyone" }],
                "actions": [{ "type": "advance" }]
              },
              {
                "id": "step-reflexion",
                "type": "reflection",
                "title": "Reflexión",
                "text": "Medita en el misterio...",
                "durationMs": 120000,
                "requiresResponse": false,
                "roles": [{ "type": "silent" }],
                "actions": [
                  { "type": "open_chat" },
                  { "type": "play_audio", "payload": { "url": "https://..." } },
                  { "type": "advance" }
                ],
                "transitions": [
                  { "trigger": "on_complete", "target": "step-gloria-misterio", "action": { "type": "close_chat" } }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "module-clausura",
        "type": "sequence",
        "title": "Clausura",
        "children": [
          {
            "id": "step-salve",
            "type": "final_prayer",
            "title": "Salve",
            "text": "Dios te salve, Reina y Madre de misericordia...",
            "durationMs": 15000,
            "requiresResponse": true,
            "roles": [{ "type": "leader" }, { "type": "assembly" }],
            "actions": [{ "type": "advance" }]
          },
          {
            "id": "step-oracion-final",
            "type": "final_prayer",
            "title": "Oración Final",
            "subtitle": "Oh Dios, cuyo Unigénito Hijo...",
            "text": "Oh Dios, cuyo Unigénito Hijo...",
            "durationMs": 10000,
            "requiresResponse": false,
            "roles": [{ "type": "everyone" }],
            "actions": [{ "type": "advance" }]
          }
        ]
      }
    ]
  },
  "metadata": {
    "totalMysteries": 5,
    "mysteryType": "dolorosos",
    "languages": ["es"],
    "estimatedDurationMs": 5400000
  }
}
```

---

## 4. Worker Hono

### 4.1. Schema Drizzle (`src/lib/rosario/schema.ts`)

```ts
import { pgTable, uuid, text, boolean, integer, timestamp, index, sql } from "drizzle-orm/pg-core";

export const rosarySessions = pgTable("rosary_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: text("program_id").notNull(),
  programSlug: text("program_slug").notNull(),
  currentNodeId: text("current_node_id").notNull(),
  currentNodeType: text("current_node_type").notNull().default("step"),
  repeatCount: integer("repeat_count").notNull().default(0),
  readerProfileId: uuid("reader_profile_id"),
  readerTimeoutAt: timestamp("reader_timeout_at", { withTimezone: true }),
  readerAssignedAt: timestamp("reader_assigned_at", { withTimezone: true }),
  totalParticipants: integer("total_participants").notNull().default(0),
  totalResponses: integer("total_responses").notNull().default(0),
  isPaused: boolean("is_paused").notNull().default(false),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
}, (t) => [
  index("idx_rosary_sessions_program").on(t.programId),
]);

export const rosaryParticipants = pgTable("rosary_participants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull().references(() => rosarySessions.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  countryCode: text("country_code"),
  avatarSeed: text("avatar_seed"),
  isResponding: boolean("is_responding").notNull().default(false),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().default(sql`now()`),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().default(sql`now()`),
}, (t) => [
  index("idx_rosary_participants_session").on(t.sessionId),
  index("idx_rosary_participants_profile").on(t.profileId),
  index("idx_rosary_participants_last_seen").on(t.lastSeenAt),
]);

export const rosaryChat = pgTable("rosary_chat", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull().references(() => rosarySessions.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "set null" }),
  displayName: text("display_name").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
}, (t) => [
  index("idx_rosary_chat_session_created").on(t.sessionId, t.createdAt),
]);
```

### 4.2. Worker principal (`src/worker/index.ts`)

```ts
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, sql } from "drizzle-orm";

import { profiles } from "../../src/db/schema";
import { rosarySessions, rosaryParticipants, rosaryChat } from "../lib/rosario/schema";

const DB_URL = process.env.SUPABASE_DB_URL!;
const pool = new Pool({ connectionString: DB_URL, max: 5 });
const db = drizzle(pool);

const app = new Hono();

async function getRosarioSession() {
  const [session] = await db
    .select()
    .from(rosarySessions)
    .where(eq(rosarySessions.programId, "rosario-misterios-dolorosos"))
    .limit(1);

  if (!session) {
    const [created] = await db
      .insert(rosarySessions)
      .values({
        programId: "rosario-misterios-dolorosos",
        programSlug: "misterios-dolorosos",
        currentNodeId: "step-signo-cruz",
        currentNodeType: "step",
        repeatCount: 0,
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  return session;
}

app.get("/cron/rosario/advance", async (c) => {
  const cronSecret = c.req.header("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return c.json({ error: "unauthorized" }, 403);
  }

  const session = await getRosarioSession();
  const now = new Date();

  if (
    session.readerProfileId &&
    session.readerTimeoutAt &&
    new Date(session.readerTimeoutAt) < now
  ) {
    await db.update(rosarySessions)
      .set({ readerProfileId: null, readerTimeoutAt: null, readerAssignedAt: null, updatedAt: now })
      .where(eq(rosarySessions.id, session.id));
  }

  const zombieThreshold = new Date(now.getTime() - 30_000);
  await db.delete(rosaryParticipants)
    .where(eq(rosaryParticipants.sessionId, session.id))
    .where(sql`${rosaryParticipants.lastSeenAt} < ${zombieThreshold}`);

  const [{ count: totalParticipants }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rosaryParticipants)
    .where(eq(rosaryParticipants.sessionId, session.id));

  const [{ count: totalResponses }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rosaryParticipants)
    .where(sql`${rosaryParticipants.sessionId} = ${session.id} AND ${rosaryParticipants.isResponding} = true`);

  const stepDef = ROSARIO_STEPS[session.currentNodeId];
  if (
    !session.readerProfileId &&
    stepDef?.requiresResponse &&
    (totalParticipants ?? 0) > 0
  ) {
    const [nextReader] = await db.select()
      .from(rosaryParticipants)
      .where(eq(rosaryParticipants.sessionId, session.id))
      .orderBy(sql`${rosaryParticipants.joinedAt} ASC`)
      .limit(1);

    if (nextReader) {
      await db.update(rosarySessions)
        .set({
          readerProfileId: nextReader.profileId,
          readerAssignedAt: now,
          readerTimeoutAt: new Date(now.getTime() + 6_000),
          updatedAt: now,
        })
        .where(eq(rosarySessions.id, session.id));
    }
  }

  await db.update(rosarySessions)
    .set({ totalParticipants: totalParticipants ?? 0, totalResponses: totalResponses ?? 0, updatedAt: now })
    .where(eq(rosarySessions.id, session.id));

  return c.json({ ok: true, nodeId: session.currentNodeId });
});

app.post("/rosario/join", async (c) => {
  const body = await c.req.json<{
    profileId: string;
    displayName: string;
    countryCode?: string;
    avatarSeed?: string;
  }>();

  const session = await getRosarioSession();

  await db.insert(rosaryParticipants).values({
    sessionId: session.id,
    profileId: body.profileId,
    displayName: body.displayName,
    countryCode: body.countryCode,
    avatarSeed: body.avatarSeed,
    lastSeenAt: new Date(),
    joinedAt: new Date(),
  }).onConflictDoUpdate({
    target: [rosaryParticipants.sessionId, rosaryParticipants.profileId],
    set: { displayName: body.displayName, countryCode: body.countryCode, avatarSeed: body.avatarSeed, lastSeenAt: new Date() },
  });

  return c.json({ ok: true });
});

app.post("/rosario/respond", async (c) => {
  const { profileId } = await c.req.json<{ profileId: string }>();
  const session = await getRosarioSession();

  await db.insert(rosaryParticipants).values({
    sessionId: session.id,
    profileId,
    displayName: "Peregrino",
    lastSeenAt: new Date(),
    joinedAt: new Date(),
  }).onConflictDoUpdate({
    target: [rosaryParticipants.sessionId, rosaryParticipants.profileId],
    set: { isResponding: true, lastSeenAt: new Date() },
  });

  return c.json({ ok: true });
});

app.post("/rosario/unrespond", async (c) => {
  const { profileId } = await c.req.json<{ profileId: string }>();
  const session = await getRosarioSession();

  await db.update(rosaryParticipants)
    .set({ isResponding: false, lastSeenAt: new Date() })
    .where(eq(rosaryParticipants.sessionId, session.id))
    .where(eq(rosaryParticipants.profileId, profileId));

  return c.json({ ok: true });
});

app.post("/rosario/chat", async (c) => {
  const body = await c.req.json<{
    profileId: string;
    displayName: string;
    text: string;
  }>();

  if (!body.text || body.text.length > 120) {
    return c.json({ error: "invalid_text" }, 400);
  }

  const session = await getRosarioSession();

  await db.insert(rosaryChat).values({
    sessionId: session.id,
    profileId: body.profileId || null,
    displayName: body.displayName,
    text: body.text.trim(),
    createdAt: new Date(),
  });

  return c.json({ ok: true });
});

app.get("/rosario/chat/history", async (c) => {
  const session = await getRosarioSession();
  const messages = await db.select()
    .from(rosaryChat)
    .where(eq(rosaryChat.sessionId, session.id))
    .orderBy(sql`${rosaryChat.createdAt} DESC`)
    .limit(50);

  return c.json({ messages: messages.reverse() });
});

export default app;
```

> Nota: crea `src/worker/steps.ts` exportando el mapa `ROSARIO_STEPS` desde el JSON parseado para que el Worker sepa qué pasos requieren respuesta.

### 4.3. Wrangler (`wrangler.toml`)

```toml
name = "camino-api"
main = "src/worker/index.ts"
compatibility_date = "2026-01-01"
compatibility_flags = ["nodejs_compat"]

workers_dev = true
minify = true

[vars]
SUPABASE_URL = "https://qmuootexudvmczvpwouu.supabase.co"
ENVIRONMENT = "production"

[triggers]
crons = ["*/10 * * * *"]
```

Secrets:

```bash
wrangler secret put SUPABASE_DB_URL
wrangler secret put CRON_SECRET
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

---

## 5. API Routes

### 5.1. `/api/rosario/session`

```ts
import { NextResponse } from "next/server";
import { getSupabaseBrowser } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getSessionId() {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error("supabase_not_configured");

  const { data } = await supabase.from("rosary_sessions")
    .select("id")
    .eq("program_id", "rosario-misterios-dolorosos")
    .single();

  if (!data?.id) throw new Error("session_not_found");
  return data.id;
}

export async function GET() {
  const supabase = getSupabaseBrowser();
  if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });

  const { data, error } = await supabase.from("rosary_sessions")
    .select("*")
    .eq("program_id", "rosario-misterios-dolorosos")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data });
}

export async function POST(request: Request) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });

  const body = await request.json();
  const { action, profileId, displayName, countryCode, avatarSeed } = body;

  if (!["join", "respond", "unrespond"].includes(action)) {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  const sessionId = await getSessionId();

  if (action === "join") {
    const { data, error } = await supabase.from("rosary_participants")
      .upsert({
        session_id: sessionId,
        profile_id: profileId,
        display_name: displayName,
        country_code: countryCode,
        avatar_seed: avatarSeed,
        last_seen_at: new Date().toISOString(),
      }, { onConflict: ["session_id", "profile_id"] })
      .select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ participant: data });
  }

  if (action === "respond") {
    await supabase.from("rosary_participants")
      .update({ is_responding: true, last_seen_at: new Date().toISOString() })
      .eq("session_id", sessionId).eq("profile_id", profileId);
    return NextResponse.json({ ok: true });
  }

  if (action === "unrespond") {
    await supabase.from("rosary_participants")
      .update({ is_responding: false, last_seen_at: new Date().toISOString() })
      .eq("session_id", sessionId).eq("profile_id", profileId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "invalid_action" }, { status: 400 });
}
```

### 5.2. `/api/rosario/chat`

```ts
import { NextResponse } from "next/server";
import { getSupabaseBrowser } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getSessionId() {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error("supabase_not_configured");

  const { data } = await supabase.from("rosary_sessions")
    .select("id")
    .eq("program_id", "rosario-misterios-dolorosos")
    .single();

  if (!data?.id) throw new Error("session_not_found");
  return data.id;
}

export async function POST(request: Request) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });

  const body = await request.json();
  const { displayName, text, profileId } = body;

  if (!text || text.length > 120) {
    return NextResponse.json({ error: "invalid_text" }, { status: 400 });
  }

  const sessionId = await getSessionId();

  const { data: message, error } = await supabase.from("rosary_chat")
    .insert({
      session_id: sessionId,
      profile_id: profileId || null,
      display_name: displayName || "Peregrino",
      text: text.trim(),
    })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message }, { status: 201 });
}

export async function GET(request: Request) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const sessionId = await getSessionId();

  const { data: messages, error } = await supabase.from("rosary_chat")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: messages.reverse() });
}
```

### 5.3. Heartbeat (`/api/rosario/heartbeat`)

```ts
import { NextResponse } from "next/server";
import { getSupabaseBrowser } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });

  const body = await request.json();
  const { profileId, displayName, countryCode, avatarSeed } = body;

  if (!profileId) return NextResponse.json({ error: "profileId_required" }, { status: 400 });

  const { data: session } = await supabase.from("rosary_sessions")
    .select("id")
    .eq("program_id", "rosario-misterios-dolorosos")
    .single();

  if (!session) return NextResponse.json({ error: "session_not_found" }, { status: 500 });

  const { error } = await supabase.from("rosary_participants")
    .upsert(
      {
        session_id: session.id,
        profile_id: profileId,
        display_name: displayName || "Peregrino",
        country_code: countryCode,
        avatar_seed: avatarSeed,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: ["session_id", "profile_id"] }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, timestamp: Date.now() });
}
```

---

## 6. Integración con Cloudflare R2

### 6.1. Variables

```env
NEXT_PUBLIC_R2_BUCKET_NAME=camino-media
NEXT_PUBLIC_R2_PUBLIC_URL=https://56566e9b25f5574dc20103ba3ac9d85c.r2.cloudflarestorage.com
```

### 6.2. Helper (`src/lib/r2.ts`)

```ts
export function getR2PublicUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-xxxx.r2.dev";
  return `${base}/${key}`;
}

export function getRosarioMysteryImage(mysteryIndex: number): string {
  return getR2PublicUrl(`rosario/misterio${mysteryIndex}-doloroso.jpg`);
}

export function getRosarioMeditationAudio(interludeIndex: number): string {
  return getR2PublicUrl(`rosario/interludio/meditation-${interludeIndex}.mp3`);
}
```

---

## 7. Testing

### 7.1. Dependencias

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom @supabase/supabase-js
```

### 7.2. Configuración (`vitest.config.ts`)

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

`tests/setup.ts`:
```ts
import "@testing-library/jest-dom";
```

### 7.3. Tests unitarios

`tests/unit/rosario-engine.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { loadProgram, initializeSession, advanceSession, flattenProgram, getCurrentStep, getCurrentNode, isStep, isModule } from "@/lib/devotions/engine";

const mockProgram = { ... };

describe("Prayer Engine", () => {
  it("loads program and initializes session", () => { ... });
  it("advances through nodes", () => { ... });
  it("flattens module hierarchy", () => { ... });
  it("identifies step vs module", () => { ... });
  it("distinguishes step from module", () => { ... });
});
```

### 7.4. Ejecutar tests

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration"
  }
}
```

---

## 8. Configuraciones manuales en Supabase

Debes ejecutar estos pasos en la **Supabase Console** antes de levantar la app.

### 8.1. Ejecutar SQL de esquema

1. Ve a **SQL Editor** → **New query**.
2. Copia y ejecuta el script de la sección 2.1 completo.
3. Ejecuta el seed inicial de la sección 2.4.

### 8.2. Habilitar Realtime

1. Ve a **Database → Replication**.
2. Habilita Realtime para:
   - `rosary_sessions`
   - `rosary_participants`
   - `rosary_chat`
   - `prayer_programs`

### 8.3. Configurar RLS policies

Las policies de la sección 2.3 ya están configuradas para desarrollo.

Para producción estricta, ejecuta:

```sql
-- Revocar acceso público
REVOKE ALL ON public.rosary_sessions FROM anon, authenticated;
REVOKE ALL ON public.rosary_participants FROM anon, authenticated;
REVOKE ALL ON public.rosary_chat FROM anon, authenticated;
REVOKE ALL ON public.prayer_programs FROM anon, authenticated;

-- Crear policies restrictivas por usuario
CREATE POLICY "users_read_own_participant"
  ON public.rosary_participants FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "users_update_own_participant"
  ON public.rosary_participants FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "users_insert_own_participant"
  ON public.rosary_participants FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "users_read_public_chat"
  ON public.rosary_chat FOR SELECT
  USING (true);

CREATE POLICY "users_insert_own_chat"
  ON public.rosary_chat FOR INSERT
  WITH CHECK (auth.uid() = profile_id);
```

### 8.4. Configurar Auth

1. Ve a **Authentication → Providers**.
2. Habilita **Email** y configura:
   - **Confirm email**: deshabilita para acceso anónimo inicial
   - **Redirect URLs**: agrega tu dominio
3. En **Authentication → URL Configuration**:
   - Site URL: `https://camino.app`
   - Redirect URLs: `https://camino.app/**`

---

## 9. Deploy y Producción

### 9.1. Variables de entorno producción

Next.js (Vercel / CF Pages):
```env
NEXT_PUBLIC_SUPABASE_URL=https://qmuootexudvmczvpwouu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://camino.app
NODE_ENV=production
```

Worker (wrangler secret put):
```bash
wrangler secret put SUPABASE_DB_URL
wrangler secret put CRON_SECRET
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

### 9.2. Seguridad

- Nunca commitees `.env.local` o archivos con secrets
- Usa `wrangler secret put` para el Worker
- Rota los secrets periódicamente
- Configura CORS si el frontend está en otro dominio

### 9.3. Monitoreo

```bash
wrangler tail
```

---

## 10. Módulo La Llama y Jardín del Alma (Configuraciones Manuales)

### 10.1. Migración SQL en Supabase Editor

Ejecuta el archivo de migración ubicado en `supabase/migrations/0002_intention_to_seed.sql` en el **SQL Editor** de Supabase:

```sql
-- ============================================================================
-- 0002_intention_to_seed.sql
-- ============================================================================

create or replace function fn_expire_intention_to_seed()
returns trigger as $$
begin
  if new.transformed_to_seed = true and old.transformed_to_seed = false and new.user_id is not null then
    insert into spiritual_inventory (profile_id, seeds_journey, updated_at)
    values (new.user_id, 1, now())
    on conflict (profile_id)
    do update set seeds_journey = spiritual_inventory.seeds_journey + 1,
                  updated_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_intention_to_seed on intentions_wall;
create trigger trg_intention_to_seed
after update of transformed_to_seed on intentions_wall
for each row execute function fn_expire_intention_to_seed();
```

### 10.2. Configuración de Cron para Barrido de Velas Expiradas

El sistema dispone de la ruta API Handler `GET /api/cron/sweep` para ejecutar el barrido de intenciones expiradas cada hora.

1. **En Vercel Dashboard:**
   Ve a **Settings → Cron Jobs** o asegúrate de que `vercel.json` o tu plan active invocaciones periódicas a `/api/cron/sweep`.
2. **Variable de entorno:**
   Si configuras `CRON_SECRET` en tus variables de entorno, la petición HTTP debe incluir la cabecera `Authorization: Bearer <CRON_SECRET>`.


El motor ahora funciona con árbol de composición. Para agregar nuevas devociones (Coronillas, Novenas, Vía Crucis):

1. Copia `src/lib/devotions/programs/rosary-misterios-dolorosos.json`
2. Modifica el árbol de módulos y steps
3. Insertar el JSON en `prayer_programs` en Supabase
4. El frontend carga el programa dinámicamente

No necesitas modificar el motor. Solo el JSON.
