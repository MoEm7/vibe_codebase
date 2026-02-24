"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { MakerProfile, Order } from "@/types/database";

export default function StudioDashboard() {
  const router = useRouter();
  const [maker, setMaker] = useState<MakerProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("maker_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      router.push("/");
      return;
    }

    setMaker(profile as MakerProfile);

    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("maker_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (orders) setRecentOrders(orders as Order[]);
    setLoading(false);
  }

  async function toggleLive() {
    if (!maker) return;
    const supabase = createClient();
    const newStatus = !maker.is_live;

    await supabase
      .from("maker_profiles")
      .update({ is_live: newStatus })
      .eq("id", maker.id);

    setMaker({ ...maker, is_live: newStatus });
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-5 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-coffee-dark border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!maker) return null;

  return (
    <main className="max-w-5xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px]">
            Maker Studio
          </h1>
          <p className="text-coffee-main">Welcome back, {maker.shop_name}!</p>
        </div>
        <button
          onClick={toggleLive}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all border-none ${
            maker.is_live
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
        >
          <span
            className={`w-3 h-3 rounded-full ${
              maker.is_live ? "bg-white animate-pulse" : "bg-gray-400"
            }`}
          />
          {maker.is_live ? "LIVE" : "OFFLINE"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-card backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.04)] text-center">
          <p className="text-3xl font-[800] text-coffee-dark">{maker.total_products}</p>
          <p className="text-sm text-coffee-main">Products</p>
        </div>
        <div className="bg-bg-card backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.04)] text-center">
          <p className="text-3xl font-[800] text-coffee-dark">
            {maker.avg_rating.toFixed(1)}
          </p>
          <p className="text-sm text-coffee-main">Rating</p>
        </div>
        <div className="bg-bg-card backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.04)] text-center">
          <p className="text-3xl font-[800] text-coffee-dark">{maker.total_ratings}</p>
          <p className="text-sm text-coffee-main">Reviews</p>
        </div>
        <div className="bg-bg-card backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.04)] text-center">
          <p className="text-3xl font-[800] text-coffee-dark">{recentOrders.length}</p>
          <p className="text-sm text-coffee-main">Recent Orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link
          href="/studio/products"
          className="bg-bg-card backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-[0_8px_24px_rgba(62,39,35,0.06)] no-underline hover:shadow-[0_12px_32px_rgba(62,39,35,0.12)] transition-shadow"
        >
          <p className="text-3xl mb-3">🛍️</p>
          <h3 className="font-bold text-coffee-dark mb-1">Manage Products</h3>
          <p className="text-sm text-coffee-main">Add, edit, or remove menu items</p>
        </Link>
        <Link
          href="/studio/profile"
          className="bg-bg-card backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-[0_8px_24px_rgba(62,39,35,0.06)] no-underline hover:shadow-[0_12px_32px_rgba(62,39,35,0.12)] transition-shadow"
        >
          <p className="text-3xl mb-3">✏️</p>
          <h3 className="font-bold text-coffee-dark mb-1">Edit Profile</h3>
          <p className="text-sm text-coffee-main">Update shop name, bio, logo</p>
        </Link>
        <Link
          href="/studio/location"
          className="bg-bg-card backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-[0_8px_24px_rgba(62,39,35,0.06)] no-underline hover:shadow-[0_12px_32px_rgba(62,39,35,0.12)] transition-shadow"
        >
          <p className="text-3xl mb-3">📍</p>
          <h3 className="font-bold text-coffee-dark mb-1">Set Location</h3>
          <p className="text-sm text-coffee-main">Pin your spot on the map</p>
        </Link>
        <Link
          href="/studio/orders"
          className="bg-bg-card backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-[0_8px_24px_rgba(62,39,35,0.06)] no-underline hover:shadow-[0_12px_32px_rgba(62,39,35,0.12)] transition-shadow"
        >
          <p className="text-3xl mb-3">📋</p>
          <h3 className="font-bold text-coffee-dark mb-1">Incoming Orders</h3>
          <p className="text-sm text-coffee-main">View and manage pre-orders</p>
        </Link>
        <Link
          href="/studio/blog"
          className="bg-bg-card backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-[0_8px_24px_rgba(62,39,35,0.06)] no-underline hover:shadow-[0_12px_32px_rgba(62,39,35,0.12)] transition-shadow"
        >
          <p className="text-3xl mb-3">📝</p>
          <h3 className="font-bold text-coffee-dark mb-1">My Blog Posts</h3>
          <p className="text-sm text-coffee-main">Write and manage blog content</p>
        </Link>
      </div>

      {recentOrders.length > 0 && (
        <div>
          <h2 className="font-[800] text-xl text-coffee-dark mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between bg-bg-card backdrop-blur-sm rounded-xl p-4 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.04)]"
              >
                <div>
                  <p className="font-bold text-coffee-dark text-sm">
                    {order.order_number}
                  </p>
                  <p className="text-xs text-coffee-main">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-[800] text-coffee-dark">
                    ${order.total_amount.toFixed(2)}
                  </p>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : order.status === "ready"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
