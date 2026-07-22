import { NextResponse } from "next/server";
import { getSupabaseBrowser } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, displayName } = body ?? {};

    if (!profileId || !displayName) {
      return NextResponse.json({ ok: false, error: "profileId y displayName son requeridos" }, { status: 400 });
    }

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      return NextResponse.json({ ok: true });
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

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
