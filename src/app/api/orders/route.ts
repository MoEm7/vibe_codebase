import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (userData?.role === "sipper") {
    const { data: sipper } = await supabase.from("sipper_profiles").select("id").eq("user_id", user.id).single();
    if (!sipper) return NextResponse.json([]);
    const { data } = await supabase.from("orders").select("*, order_items(*)").eq("sipper_id", sipper.id).order("created_at", { ascending: false });
    return NextResponse.json(data ?? []);
  }

  if (userData?.role === "maker") {
    const { data: maker } = await supabase.from("maker_profiles").select("id").eq("user_id", user.id).single();
    if (!maker) return NextResponse.json([]);
    const { data } = await supabase.from("orders").select("*, order_items(*)").eq("maker_id", maker.id).order("created_at", { ascending: false });
    return NextResponse.json(data ?? []);
  }

  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sipper } = await supabase.from("sipper_profiles").select("id").eq("user_id", user.id).single();
  if (!sipper) return NextResponse.json({ error: "Only sippers can place orders" }, { status: 403 });

  const { makerId, items, notes } = await req.json();
  if (!makerId || !items?.length) return NextResponse.json({ error: "makerId and items are required" }, { status: 400 });

  const productIds = items.map((i: any) => i.productId);
  const { data: products } = await admin.from("products").select("id, name, price").in("id", productIds);
  if (!products?.length) return NextResponse.json({ error: "Products not found" }, { status: 404 });

  const orderItems = items.map((i: any) => {
    const product = products.find((p) => p.id === i.productId)!;
    return { productId: product.id, name: product.name, price: product.price, quantity: i.quantity };
  });
  const totalAmount = orderItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
  const orderNumber = `CC-${Date.now()}`;

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({ order_number: orderNumber, sipper_id: sipper.id, maker_id: makerId, status: "pending", total_amount: totalAmount, notes: notes || null, payment_status: "unpaid" })
    .select()
    .single();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

  await admin.from("order_items").insert(
    orderItems.map((i: any) => ({
      order_id: order.id,
      product_id: i.productId,
      product_name: i.name,
      quantity: i.quantity,
      unit_price: i.price,
      subtotal: i.price * i.quantity,
    }))
  );

  return NextResponse.json(order, { status: 201 });
}
