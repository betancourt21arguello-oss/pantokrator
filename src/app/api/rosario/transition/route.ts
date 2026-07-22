import { NextResponse } from "next/server";
import { getSupabaseBrowser } from "@/lib/supabase";
import { reduceSnapshot } from "@/lib/rosary/engine";
import type { TransitionRequest, RosarySnapshot } from "@/lib/devotions/types";

export async function POST(request: Request) {
  try {
    const body = await request.json() as TransitionRequest;
    const { sessionId, eventId, sessionVersion, stepInstanceId, eventType, participantId } = body;

    if (!sessionId || !eventId || !eventType) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }

    // Idempotencia
    const { data: existing } = await supabase
      .from("rosary_transitions")
      .select("*")
      .eq("event_id", eventId)
      .single();

    if (existing) {
      const snapshot = await loadSnapshot(supabase, sessionId);
      if (snapshot) return NextResponse.json({ snapshot });
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // Cargar snapshot
    const snapshot = await loadSnapshot(supabase, sessionId);
    if (!snapshot) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (sessionVersion !== snapshot.sessionVersion) {
      return NextResponse.json({ snapshot });
    }

    if (stepInstanceId && stepInstanceId !== snapshot.stepInstanceId) {
      return NextResponse.json({ snapshot });
    }

    // Construir acción del engine
    const action: any = eventType === "HOLD_END"
      ? {
          type: "HOLD_END",
          request: {
            sessionId,
            eventId,
            sessionVersion,
            stepInstanceId,
            eventType,
            participantId,
          },
        }
      : { type: "HEARTBEAT", participant: { profileId: participantId, lastHeartbeatAt: new Date().toISOString() } };

    // Aplicar transición
    const next = reduceSnapshot(snapshot, action);

    // Persistir (escritura diferida simple por ahora)
    await supabase.from("rosary_transitions").insert({ event_id: eventId, session_id: sessionId });
    await supabase
      .from("rosary_sessions")
      .update({
        repeat_iteration: next.repeatIteration,
        repeat_total: next.repeatTotal,
        phase: next.phase,
        status: next.status,
        current_step_id: next.stepId,
        current_step_instance_id: next.stepInstanceId,
        current_step_type: next.stepType,
        leader_participant_id: next.leaderParticipantId,
        step_started_at: next.stepStartedAt,
        step_ends_at: next.stepEndsAt,
        reflection_ends_at: next.reflectionEndsAt,
        session_version: next.sessionVersion,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    return NextResponse.json({ snapshot: next });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

async function loadSnapshot(supabase: ReturnType<typeof getSupabaseBrowser>, sessionId: string): Promise<RosarySnapshot | null> {
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
