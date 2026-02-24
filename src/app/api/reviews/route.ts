import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sipper } = await supabase
    .from("sipper_profiles").select("id").eq("user_id", user.id).single();
  if (!sipper) return NextResponse.json({ error: "Only sippers can leave reviews" }, { status: 403 });

  const { makerId, rating, comment } = await req.json();
  if (!makerId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "makerId and rating (1-5) are required" }, { status: 400 });
  }

  const { data: existing } = await admin
    .from("reviews").select("id").eq("sipper_id", sipper.id).eq("maker_id", makerId).single();

  if (existing) {
    const { error } = await admin
      .from("reviews")
      .update({ rating, comment: comment || null })
      .eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await admin
      .from("reviews")
      .insert({ sipper_id: sipper.id, maker_id: makerId, rating, comment: comment || null });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
