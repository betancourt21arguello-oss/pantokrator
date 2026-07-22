-- ===========================================================================
-- CAMINO · Rosario Perpetuo — Tablas de estado compartido (schema actualizado)
-- ===========================================================================
-- IDs como TEXT para compatibilidad con perfiles anónimos y deviceId.
-- Incluye tabla de transiciones para idempotencia y tablas faltantes de la app.

-- ---------------------------------------------------------------------------
-- Tabla: profiles (necesaria para FKs de intentions_wall y otros)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_anonymous boolean NOT NULL DEFAULT true,
  email text UNIQUE,
  display_name text,
  avatar_seed text,
  device_id text,
  streak_days integer NOT NULL DEFAULT 0,
  last_active_date date,
  seeds_faith integer NOT NULL DEFAULT 0,
  seeds_hope integer NOT NULL DEFAULT 0,
  seeds_charity integer NOT NULL DEFAULT 0,
  candles_lit integer NOT NULL DEFAULT 0,
  prayers_count integer NOT NULL DEFAULT 0,
  intentions_count integer NOT NULL DEFAULT 0,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Tabla: intentions_wall (Velas e Intenciones comunitarias)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.intentions_wall (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  intensity_level integer NOT NULL DEFAULT 1,
  transformed_to_seed boolean NOT NULL DEFAULT false,
  supporters jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS intentions_wall_expires_idx ON public.intentions_wall (expires_at);
CREATE INDEX IF NOT EXISTS intentions_wall_user_idx ON public.intentions_wall (user_id);

-- ---------------------------------------------------------------------------
-- Tabla: spiritual_inventory (Jardín del Alma)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.spiritual_inventory (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  seeds_rosary integer NOT NULL DEFAULT 0,
  seeds_mercy integer NOT NULL DEFAULT 0,
  seeds_jose integer NOT NULL DEFAULT 0,
  seeds_guadalupe integer NOT NULL DEFAULT 0,
  seeds_requiem integer NOT NULL DEFAULT 0,
  seeds_journey integer NOT NULL DEFAULT 0,
  water_drops integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Tabla: rosary_sessions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rosary_sessions (
  id text PRIMARY KEY,
  program_id text NOT NULL DEFAULT 'rosario-misterios-dolorosos',
  program_slug text NOT NULL DEFAULT 'misterios-dolorosos',
  current_node_id text NOT NULL,
  current_node_type text NOT NULL DEFAULT 'step',
  repeat_count integer NOT NULL DEFAULT 0,
  reader_profile_id text,
  reader_timeout_at timestamptz,
  reader_assigned_at timestamptz,
  total_participants integer NOT NULL DEFAULT 0,
  total_responses integer NOT NULL DEFAULT 0,
  is_paused boolean NOT NULL DEFAULT FALSE,
  status text NOT NULL DEFAULT 'joining',
  session_version integer NOT NULL DEFAULT 1,
  devotion_id text NOT NULL DEFAULT 'rosary',
  section_id text NOT NULL DEFAULT 'root',
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
  program_ref text NOT NULL DEFAULT 'rosario-misterios-dolorosos',
  started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_active_program UNIQUE (program_id)
);

CREATE INDEX IF NOT EXISTS idx_rosary_sessions_program
  ON public.rosary_sessions (program_id);

-- ---------------------------------------------------------------------------
-- Tabla: rosary_participants
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rosary_participants (
  session_id text NOT NULL REFERENCES public.rosary_sessions(id) ON DELETE CASCADE,
  profile_id text NOT NULL,
  display_name text NOT NULL,
  is_responding boolean NOT NULL DEFAULT FALSE,
  last_heartbeat_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (session_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_rosary_participants_session
  ON public.rosary_participants (session_id);

CREATE INDEX IF NOT EXISTS idx_rosary_participants_profile
  ON public.rosary_participants (profile_id);

-- ---------------------------------------------------------------------------
-- Tabla: rosary_chat
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rosary_chat (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id text NOT NULL REFERENCES public.rosary_sessions(id) ON DELETE CASCADE,
  profile_id text NOT NULL,
  display_name text NOT NULL,
  text text NOT NULL CHECK (char_length(text) <= 120),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rosary_chat_session_created
  ON public.rosary_chat (session_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Tabla: rosary_transitions (idempotencia)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rosary_transitions (
  event_id text PRIMARY KEY,
  session_id text NOT NULL REFERENCES public.rosary_sessions(id) ON DELETE CASCADE,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rosary_transitions_session
  ON public.rosary_transitions (session_id);

-- ---------------------------------------------------------------------------
-- Tabla: prayer_programs (programas JSON de devoción)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prayer_programs (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  accent_color text NOT NULL DEFAULT '#C6A15B',
  root_json jsonb NOT NULL,
  metadata jsonb,
  is_active boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prayer_programs_slug
  ON public.prayer_programs (slug);

-- ---------------------------------------------------------------------------
-- RLS Policies
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentions_wall ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiritual_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rosary_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rosary_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rosary_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "service_write_profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "public_read_intentions" ON public.intentions_wall FOR SELECT USING (true);
CREATE POLICY "service_write_intentions" ON public.intentions_wall FOR ALL USING (true);

CREATE POLICY "public_read_inventory" ON public.spiritual_inventory FOR SELECT USING (true);
CREATE POLICY "service_write_inventory" ON public.spiritual_inventory FOR ALL USING (true);

CREATE POLICY "public_read_sessions" ON public.rosary_sessions FOR SELECT USING (true);
CREATE POLICY "public_read_participants" ON public.rosary_participants FOR SELECT USING (true);
CREATE POLICY "public_read_chat" ON public.rosary_chat FOR SELECT USING (true);
CREATE POLICY "public_read_programs" ON public.prayer_programs FOR SELECT USING (true);

CREATE POLICY "service_write_sessions" ON public.rosary_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "service_write_participants" ON public.rosary_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "service_write_chat" ON public.rosary_chat FOR INSERT WITH CHECK (true);
CREATE POLICY "service_write_programs" ON public.prayer_programs FOR INSERT WITH CHECK (true);

CREATE POLICY "service_update_sessions" ON public.rosary_sessions FOR UPDATE USING (true);
CREATE POLICY "service_update_programs" ON public.prayer_programs FOR UPDATE USING (true);

-- ---------------------------------------------------------------------------
-- Seed inicial
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rosary_sessions' AND column_name = 'program_slug') THEN
    ALTER TABLE public.rosary_sessions ADD COLUMN program_slug text NOT NULL DEFAULT 'misterios-dolorosos';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rosary_sessions' AND column_name = 'current_node_id') THEN
    ALTER TABLE public.rosary_sessions ADD COLUMN current_node_id text NOT NULL DEFAULT 'step-signo-cruz';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rosary_sessions' AND column_name = 'current_node_type') THEN
    ALTER TABLE public.rosary_sessions ADD COLUMN current_node_type text NOT NULL DEFAULT 'step';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rosary_sessions' AND column_name = 'repeat_count') THEN
    ALTER TABLE public.rosary_sessions ADD COLUMN repeat_count integer NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rosary_sessions' AND column_name = 'reader_profile_id') THEN
    ALTER TABLE public.rosary_sessions ADD COLUMN reader_profile_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rosary_sessions' AND column_name = 'reader_timeout_at') THEN
    ALTER TABLE public.rosary_sessions ADD COLUMN reader_timeout_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rosary_sessions' AND column_name = 'reader_assigned_at') THEN
    ALTER TABLE public.rosary_sessions ADD COLUMN reader_assigned_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rosary_sessions' AND column_name = 'total_participants') THEN
    ALTER TABLE public.rosary_sessions ADD COLUMN total_participants integer NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rosary_sessions' AND column_name = 'total_responses') THEN
    ALTER TABLE public.rosary_sessions ADD COLUMN total_responses integer NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rosary_sessions' AND column_name = 'is_paused') THEN
    ALTER TABLE public.rosary_sessions ADD COLUMN is_paused boolean NOT NULL DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rosary_sessions' AND column_name = 'started_at') THEN
    ALTER TABLE public.rosary_sessions ADD COLUMN started_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

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
  id, program_id, program_slug, current_node_id, current_node_type,
  repeat_count, started_at, current_step_id, current_step_instance_id
) VALUES (
  'rosario-misterios-dolorosos',
  'rosario-misterios-dolorosos',
  'misterios-dolorosos',
  'step-signo-cruz',
  'step',
  0,
  now(),
  'step-signo-cruz',
  'initial-instance'
) ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
BEGIN;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END
  $$;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.rosary_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rosary_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rosary_chat;
