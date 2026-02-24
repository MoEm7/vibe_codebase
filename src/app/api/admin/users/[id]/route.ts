import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userData?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const allowedFields = ["is_verified", "is_active"];
  const updates: Record<string, boolean> = {};

  for (const field of allowedFields) {
    if (typeof body[field] === "boolean") updates[field] = body[field];
  }

  if (!Object.keys(updates).length) return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });

  const { error } = await admin.from("users").update(updates).eq("id", id).neq("role", "admin");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
