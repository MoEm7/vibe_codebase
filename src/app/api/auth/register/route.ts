import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, displayName, role } = body;

  if (!email || !password || !displayName || !role) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!["maker", "sipper"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName, role },
    });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const userId = authData.user.id;

  const { error: userError } = await supabaseAdmin.from("users").insert({
    id: userId,
    email,
    role,
    display_name: displayName,
    is_verified: false,
    is_active: true,
    preferred_language: "en",
  });

  if (userError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  if (role === "maker") {
    const { error: makerError } = await supabaseAdmin
      .from("maker_profiles")
      .insert({
        user_id: userId,
        shop_name: displayName,
        is_live: false,
        avg_rating: 0,
        total_ratings: 0,
        total_products: 0,
      });

    if (makerError) {
      await supabaseAdmin.from("users").delete().eq("id", userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: makerError.message }, { status: 500 });
    }
  } else {
    const { error: sipperError } = await supabaseAdmin
      .from("sipper_profiles")
      .insert({
        user_id: userId,
        preferred_radius_km: 5,
      });

    if (sipperError) {
      await supabaseAdmin.from("users").delete().eq("id", userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: sipperError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    userId,
    role,
  });
}
