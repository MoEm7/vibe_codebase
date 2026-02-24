"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { MakerProfile, Product } from "@/types/database";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function PreOrderPage() {
  const params = useParams();
  const makerId = params.id as string;
  const router = useRouter();

  const [maker, setMaker] = useState<MakerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [makerId]);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const [makerRes, productsRes] = await Promise.all([
      supabase.from("maker_profiles").select("id, shop_name, logo_url, is_live").eq("id", makerId).single(),
      supabase.from("products").select("*").eq("maker_id", makerId).eq("is_available", true).order("sort_order"),
    ]);

    if (makerRes.data) setMaker(makerRes.data as MakerProfile);
    if (productsRes.data) setProducts(productsRes.data as Product[]);
    setLoading(false);
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) => {
      const current = prev[productId] ?? 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  }

  const cartItems: CartItem[] = Object.entries(cart).map(([productId, quantity]) => {
    const p = products.find((pr) => pr.id === productId)!;
    return { productId, name: p.name, price: p.price, quantity };
  });
  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  async function handleSubmit() {
    if (!cartItems.length) { setError("Add at least one item to your order."); return; }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ makerId, items: cartItems.map(i => ({ productId: i.productId, quantity: i.quantity })), notes }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to place order."); setSubmitting(false); return; }
    router.push(`/dashboard/orders`);
  }

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-5 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-coffee-dark border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-5 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/maker/${makerId}`} className="text-coffee-main hover:text-coffee-dark transition-colors text-sm">
          ← Back
        </Link>
        <div>
          <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px]">Pre-Order</h1>
          {maker && <p className="text-coffee-main text-sm">from {maker.shop_name}</p>}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl mb-6">{error}</p>}

      <div className="space-y-3 mb-8">
        {products.length === 0 ? (
          <p className="text-center text-coffee-main py-12">No items available right now.</p>
        ) : (
          products.map((product) => {
            const qty = cart[product.id] ?? 0;
            return (
              <div key={product.id} className="flex items-center gap-4 bg-bg-card backdrop-blur-sm rounded-2xl p-4 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.04)]">
                <div className="w-12 h-12 rounded-xl bg-coffee-dark/10 flex items-center justify-center text-xl flex-shrink-0">
                  {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover rounded-xl" /> : "☕"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-coffee-dark text-sm truncate">{product.name}</p>
                  <p className="text-coffee-dark font-[800]">${product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(product.id, -1)} disabled={qty === 0} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-coffee-dark disabled:opacity-30 transition-all border-none cursor-pointer text-lg">−</button>
                  <span className="w-6 text-center font-bold text-coffee-dark">{qty}</span>
                  <button onClick={() => updateQty(product.id, 1)} className="w-8 h-8 rounded-full bg-coffee-dark text-white hover:brightness-110 font-bold transition-all border-none cursor-pointer text-lg">+</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="bg-bg-card backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-[0_8px_24px_rgba(62,39,35,0.06)]">
        <h3 className="font-bold text-coffee-dark mb-4">Special requests (optional)</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. extra hot, no sugar, oat milk..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-pattern-stroke bg-white/80 text-coffee-dark placeholder:text-coffee-main/50 text-sm focus:outline-none focus:border-accent transition-colors resize-none mb-4"
        />

        <div className="flex items-center justify-between pt-4 border-t border-pattern-stroke">
          <div>
            <p className="text-sm text-coffee-main">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
            <p className="font-[800] text-2xl text-coffee-dark">${total.toFixed(2)}</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || !cartItems.length}
            className="px-8 py-3 bg-coffee-dark text-white rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            {submitting ? "Placing..." : "Place Order"}
          </button>
        </div>
      </div>
    </main>
  );
}
