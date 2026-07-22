-- ============================================================================
-- CAMINO · Migración: tablas del Rosario en vivo
-- ============================================================================
-- Reversible: DROP TABLE rosary_chat, rosary_participants, rosary_sessions;

-- rosary_sessions
CREATE TABLE IF NOT EXISTS rosary_sessions (
  id text PRIMARY KEY,
  program_id text NOT NULL DEFAULT 'rosario-misterios-dolorosos',
  status text NOT NULL DEFAULT 'joining',
  current_step_id text NOT NULL,
  current_step_instance_id text NOT NULL,
  current_step_type text NOT NULL DEFAULT 'prayer',
  repeat_iteration integer NOT NULL DEFAULT 1,
  repeat_total integer NOT NULL DEFAULT 10,
  phase text NOT NULL DEFAULT 'active',
  leader_participant_id text,
  step_started_at timestamptz NOT NULL DEFAULT now(),
  step_ends_at timestamptz NOT NULL DEFAULT now(),
  reflection_ends_at timestamptz,
  session_version integer NOT NULL DEFAULT 1,
  devotion_id text NOT NULL DEFAULT 'rosary',
  section_id text NOT NULL DEFAULT 'root',
  program_ref text NOT NULL DEFAULT 'rosario-misterios-dolorosos',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- rosary_participants
CREATE TABLE IF NOT EXISTS rosary_participants (
  session_id text NOT NULL REFERENCES rosary_sessions(id) ON DELETE CASCADE,
  profile_id text NOT NULL,
  display_name text NOT NULL,
  is_responding boolean NOT NULL DEFAULT false,
  last_heartbeat_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, profile_id)
);

-- rosary_chat
CREATE TABLE IF NOT EXISTS rosary_chat (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id text NOT NULL REFERENCES rosary_sessions(id) ON DELETE CASCADE,
  profile_id text NOT NULL,
  display_name text NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Transiciones para idempotencia
CREATE TABLE IF NOT EXISTS rosary_transitions (
  event_id text PRIMARY KEY,
  session_id text NOT NULL REFERENCES rosary_sessions(id) ON DELETE CASCADE,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rosary_sessions_status_idx ON rosary_sessions(status);
CREATE INDEX IF NOT EXISTS rosary_participants_session_idx ON rosary_participants(session_id);
CREATE INDEX IF NOT EXISTS rosary_chat_session_idx ON rosary_chat(session_id, created_at);
CREATE INDEX IF NOT EXISTS rosary_transitions_session_idx ON rosary_transitions(session_id);
