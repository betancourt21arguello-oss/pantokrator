import { Hono } from "hono";
import { getSupabaseBrowser } from "@/lib/supabase";

export interface Env {
  CAMINO_QUEUE: Fetcher;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export type Fetcher = {
  send: (message: any) => Promise<any>;
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/health", (c) => {
  return c.json({ status: "ok", service: "camino-api" });
});

app.post("/rosario/heartbeat", async (c) => {
  try {
    const body = await c.req.json();
    const { profileId, displayName } = body ?? {};

    if (!profileId || !displayName) {
      return c.json({ ok: false, error: "profileId y displayName son requeridos" }, 400);
    }

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      return c.json({ ok: true });
    }

    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id ?? profileId;

    await supabase.from("rosary_participants").upsert(
      {
        profile_id: profileId,
        display_name: displayName,
        last_heartbeat_at: new Date().toISOString(),
      },
      { onConflict: "profile_id" }
    );

    return c.json({ ok: true });
  } catch {
    return c.json({ ok: true });
  }
});

app.get("/rosario/snapshot", async (c) => {
  try {
    const programId = c.req.query("programId") || "rosario-misterios-dolorosos";

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      return c.json({ error: "not_configured" }, 503);
    }

    const { data, error } = await supabase
      .from("rosary_sessions")
      .select("*")
      .eq("program_id", programId)
      .single();

    if (error || !data) {
      return c.json({ error: "not_found" }, 404);
    }

    const { data: participants, error: pError } = await supabase
      .from("rosary_participants")
      .select("*")
      .eq("session_id", data.id);

    if (pError) {
      return c.json({ error: "participants_error" }, 500);
    }

    return c.json({
      sessionId: data.id,
      sessionVersion: data.session_version,
      devotionId: data.devotion_id,
      sectionId: data.section_id,
      stepId: data.current_step_id,
      stepInstanceId: data.current_step_instance_id,
      stepType: data.current_step_type,
      repeatIteration: data.repeat_iteration,
      repeatTotal: data.repeat_total,
      phase: data.phase,
      leaderParticipantId: data.leader_participant_id,
      stepStartedAt: data.step_started_at,
      stepEndsAt: data.step_ends_at,
      reflectionEndsAt: data.reflection_ends_at,
      status: data.status,
      participants: participants ?? [],
      programId: data.program_ref,
    });
  } catch {
    return c.json({ error: "server_error" }, 500);
  }
});

app.post("/rosario/transition", async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, eventId, sessionVersion, stepInstanceId, eventType, participantId } = body;

    if (!sessionId || !eventId || !eventType) {
      return c.json({ error: "invalid_request" }, 400);
    }

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      return c.json({ error: "not_configured" }, 503);
    }

    const { data: existing } = await supabase
      .from("rosary_transitions")
      .select("*")
      .eq("event_id", eventId)
      .single();

    if (existing) {
      const snapshot = await loadSnapshot(supabase, sessionId);
      if (snapshot) return c.json({ snapshot });
      return c.json({ error: "not_found" }, 404);
    }

    const snapshot = await loadSnapshot(supabase, sessionId);
    if (!snapshot) {
      return c.json({ error: "not_found" }, 404);
    }

    if (sessionVersion !== snapshot.sessionVersion) {
      return c.json({ snapshot });
    }

    if (stepInstanceId && stepInstanceId !== snapshot.stepInstanceId) {
      return c.json({ snapshot });
    }

    const snapshotData = snapshot;
    await supabase.from("rosary_transitions").insert({ event_id: eventId, session_id: sessionId });

    let updated = { ...snapshotData };
    if (eventType === "HOLD_END") {
      updated = {
        ...snapshotData,
        repeatIteration: Math.min(snapshotData.repeatIteration + 1, snapshotData.repeatTotal),
        sessionVersion: snapshotData.sessionVersion + 1,
        stepInstanceId: crypto.randomUUID(),
        stepStartedAt: new Date().toISOString(),
        stepEndsAt: new Date(Date.now() + 60_000).toISOString(),
      };
    }

    await supabase
      .from("rosary_sessions")
      .update({
        repeat_iteration: updated.repeatIteration,
        repeat_total: updated.repeatTotal,
        phase: updated.phase,
        status: updated.status,
        current_step_id: updated.stepId,
        current_step_instance_id: updated.stepInstanceId,
        current_step_type: updated.stepType,
        leader_participant_id: updated.leaderParticipantId,
        step_started_at: updated.stepStartedAt,
        step_ends_at: updated.stepEndsAt,
        reflection_ends_at: updated.reflectionEndsAt,
        session_version: updated.sessionVersion,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    return c.json({ snapshot: updated });
  } catch {
    return c.json({ error: "server_error" }, 500);
  }
});

async function loadSnapshot(supabase: ReturnType<typeof getSupabaseBrowser>, sessionId: string) {
  if (!supabase) return null;
  const { data } = await supabase
    .from("rosary_sessions")
    .select("*")
    .eq("program_id", sessionId)
    .single();

  if (!data) return null;

  const { data: participants } = await supabase
    .from("rosary_participants")
    .select("*")
    .eq("session_id", data.id);

  return {
    sessionId: data.id,
    sessionVersion: data.session_version,
    devotionId: data.devotion_id,
    sectionId: data.section_id,
    stepId: data.current_step_id,
    stepInstanceId: data.current_step_instance_id,
    stepType: data.current_step_type,
    repeatIteration: data.repeat_iteration,
    repeatTotal: data.repeat_total,
    phase: data.phase,
    leaderParticipantId: data.leader_participant_id,
    stepStartedAt: data.step_started_at,
    stepEndsAt: data.step_ends_at,
    reflectionEndsAt: data.reflection_ends_at,
    status: data.status,
    participants: (participants ?? []).map((p: any) => ({
      profileId: p.profile_id,
      displayName: p.display_name,
      isResponding: p.is_responding,
      lastHeartbeatAt: p.last_heartbeat_at,
      joinedAt: p.joined_at,
    })),
    programId: data.program_ref,
  };
}

const worker = {
  fetch: (request: Request, env: Env) => app.fetch(request, env),
};
export default worker;
