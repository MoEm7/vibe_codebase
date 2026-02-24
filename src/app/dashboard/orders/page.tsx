"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  maker_id: string;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  estimated_ready_at: string | null;
  order_items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  ready: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_ICONS: Record<string, string> = {
  pending: "⏳",
  confirmed: "✅",
  preparing: "👨‍🍳",
  ready: "🎉",
  completed: "☕",
  cancelled: "❌",
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl border-none bg-transparent cursor-pointer p-0 leading-none transition-transform hover:scale-110"
        >
          {star <= (hovered || value) ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ makerId, onDone }: { makerId: string; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!rating) return;
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ makerId, rating, comment }),
    });
    if (res.ok) { setDone(true); onDone(); }
    setSubmitting(false);
  }

  if (done) return <p className="text-green-700 font-bold text-sm text-center py-2">⭐ Thanks for your review!</p>;

  return (
    <div className="px-5 py-4 bg-amber-50 border-t border-amber-100">
      <p className="text-sm font-bold text-coffee-dark mb-3">⭐ Rate your experience</p>
      <StarRating value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment (optional)..."
        rows={2}
        className="w-full mt-3 px-3 py-2 rounded-xl border border-pattern-stroke bg-white text-sm text-coffee-dark placeholder:text-coffee-main/50 focus:outline-none focus:border-accent resize-none"
      />
      <button
        onClick={submit}
        disabled={!rating || submitting}
        className="mt-2 px-5 py-2 bg-coffee-dark text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}

export default function SipperOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
    setLoading(false);
  }

  function markReviewed(makerId: string) {
    setReviewed((prev) => new Set([...prev, makerId]));
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
        <Link href="/dashboard" className="text-coffee-main hover:text-coffee-dark text-sm">← Dashboard</Link>
        <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px]">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-coffee-main">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-lg font-medium mb-2">No orders yet</p>
          <Link href="/explore" className="inline-block mt-4 px-6 py-3 bg-coffee-dark text-white rounded-xl font-bold text-sm no-underline hover:brightness-110">
            Find a Maker
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const canReview = (order.status === "ready" || order.status === "completed") && !reviewed.has(order.maker_id);
            return (
              <div key={order.id} className="bg-bg-card backdrop-blur-sm rounded-2xl border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.06)] overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-pattern-stroke">
                  <div>
                    <p className="font-[800] text-coffee-dark">{order.order_number}</p>
                    <p className="text-xs text-coffee-main">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_ICONS[order.status]} {order.status.replace("_", " ")}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-coffee-main">{item.quantity}× {item.product_name}</span>
                      <span className="font-bold text-coffee-dark">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                  {order.notes && (
                    <p className="text-xs text-coffee-main/70 mt-2 italic">Note: {order.notes}</p>
                  )}
                </div>

                <div className="flex items-center justify-between px-5 py-4 bg-coffee-dark/5 border-t border-pattern-stroke">
                  <p className="text-sm text-coffee-main">Total</p>
                  <p className="font-[800] text-xl text-coffee-dark">${order.total_amount.toFixed(2)}</p>
                </div>

                {order.status === "ready" && (
                  <div className="px-5 py-3 bg-green-50 border-t border-green-100 text-center">
                    <p className="text-green-700 font-bold text-sm">🎉 Your order is ready for pickup!</p>
                  </div>
                )}

                {canReview && (
                  <ReviewForm makerId={order.maker_id} onDone={() => markReviewed(order.maker_id)} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
