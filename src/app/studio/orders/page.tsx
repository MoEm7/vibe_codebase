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
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_FLOW = ["pending", "confirmed", "preparing", "ready", "completed"];
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  ready: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

export default function StudioOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdating(orderId);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    }
    setUpdating(null);
  }

  function getNextStatus(current: string) {
    const idx = STATUS_FLOW.indexOf(current);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-5 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-coffee-dark border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const activeOrders = orders.filter(o => !["completed", "cancelled"].includes(o.status));
  const pastOrders = orders.filter(o => ["completed", "cancelled"].includes(o.status));

  return (
    <main className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/studio" className="text-coffee-main hover:text-coffee-dark text-sm">← Studio</Link>
        <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px]">Incoming Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-coffee-main">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm mt-1">Orders from sippers will appear here</p>
        </div>
      ) : (
        <>
          {activeOrders.length > 0 && (
            <div className="mb-10">
              <h2 className="font-bold text-coffee-dark mb-4 text-lg">Active ({activeOrders.length})</h2>
              <div className="space-y-5">
                {activeOrders.map((order) => {
                  const nextStatus = getNextStatus(order.status);
                  return (
                    <div key={order.id} className="bg-bg-card backdrop-blur-sm rounded-2xl border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.06)] overflow-hidden">
                      <div className="flex items-center justify-between p-5 border-b border-pattern-stroke">
                        <div>
                          <p className="font-[800] text-coffee-dark">{order.order_number}</p>
                          <p className="text-xs text-coffee-main">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100"}`}>
                          {order.status.replace("_", " ").toUpperCase()}
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
                          <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mt-2">📝 {order.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between px-5 py-4 border-t border-pattern-stroke">
                        <p className="font-[800] text-xl text-coffee-dark">${order.total_amount.toFixed(2)}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(order.id, "cancelled")}
                            disabled={updating === order.id}
                            className="px-4 py-2 text-sm font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all cursor-pointer bg-transparent disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          {nextStatus && (
                            <button
                              onClick={() => updateStatus(order.id, nextStatus)}
                              disabled={updating === order.id}
                              className="px-4 py-2 text-sm font-bold bg-coffee-dark text-white rounded-xl hover:brightness-110 transition-all cursor-pointer border-none disabled:opacity-50"
                            >
                              {updating === order.id ? "..." : `→ ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {pastOrders.length > 0 && (
            <div>
              <h2 className="font-bold text-coffee-dark mb-4 text-lg">History ({pastOrders.length})</h2>
              <div className="space-y-3">
                {pastOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between bg-bg-card backdrop-blur-sm rounded-xl p-4 border border-white/80">
                    <div>
                      <p className="font-bold text-coffee-dark text-sm">{order.order_number}</p>
                      <p className="text-xs text-coffee-main">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-coffee-dark">${order.total_amount.toFixed(2)}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
