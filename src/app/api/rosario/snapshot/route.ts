import { NextResponse } from "next/server";
import { getSupabaseBrowser } from "@/lib/supabase";

export async function GET() {
  try {
    const sessionId = "rosario-misterios-dolorosos";

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("rosary_sessions")
      .select("*")
      .eq("program_id", sessionId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const { data: participants, error: pError } = await supabase
      .from("rosary_participants")
      .select("*")
      .eq("session_id", data.id);

    if (pError) {
      return NextResponse.json({ error: "participants_error" }, { status: 500 });
    }

    return NextResponse.json({
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
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
