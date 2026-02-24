"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { MakerProfile, Order } from "@/types/database";

interface FavoriteMaker extends MakerProfile {
  favorite_id: string;
}

export default function SipperDashboard() {
  const router = useRouter();
  const [sipperName, setSipperName] = useState("");
  const [favorites, setFavorites] = useState<FavoriteMaker[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: userData } = await supabase
      .from("users")
      .select("display_name")
      .eq("id", user.id)
      .single();
    if (userData) setSipperName(userData.display_name);

    const { data: sipperProfile } = await supabase
      .from("sipper_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!sipperProfile) { router.push("/"); return; }

    const { data: favs } = await supabase
      .from("favorites")
      .select("id, maker_id, maker_profiles(*)")
      .eq("sipper_id", sipperProfile.id)
      .limit(6);

    if (favs) {
      setFavorites(
        favs.map((f: Record<string, unknown>) => ({
          ...(f.maker_profiles as MakerProfile),
          favorite_id: f.id as string,
        }))
      );
    }

    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("sipper_id", sipperProfile.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (orders) setRecentOrders(orders as Order[]);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-5 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-coffee-dark border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px]">
          Hey, {sipperName}! ☕
        </h1>
        <p className="text-coffee-main">Ready to find your next brew?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/explore"
          className="bg-coffee-dark text-white rounded-2xl p-6 no-underline hover:brightness-110 transition-all"
        >
          <p className="text-3xl mb-3">🗺️</p>
          <h3 className="font-bold text-lg mb-1">Explore Nearby</h3>
          <p className="text-sm opacity-80">Find coffee makers around you</p>
        </Link>
        <Link
          href="/dashboard/favorites"
          className="bg-bg-card backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-[0_8px_24px_rgba(62,39,35,0.06)] no-underline hover:shadow-[0_12px_32px_rgba(62,39,35,0.12)] transition-shadow"
        >
          <p className="text-3xl mb-3">❤️</p>
          <h3 className="font-bold text-coffee-dark text-lg mb-1">My Favorites</h3>
          <p className="text-sm text-coffee-main">{favorites.length} saved makers</p>
        </Link>
        <Link
          href="/dashboard/orders"
          className="bg-bg-card backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-[0_8px_24px_rgba(62,39,35,0.06)] no-underline hover:shadow-[0_12px_32px_rgba(62,39,35,0.12)] transition-shadow"
        >
          <p className="text-3xl mb-3">📋</p>
          <h3 className="font-bold text-coffee-dark text-lg mb-1">My Orders</h3>
          <p className="text-sm text-coffee-main">{recentOrders.length} recent orders</p>
        </Link>
      </div>

      {favorites.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[800] text-xl text-coffee-dark">Favorite Makers</h2>
            <Link href="/dashboard/favorites" className="text-sm text-accent font-bold no-underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((maker) => (
              <Link
                key={maker.id}
                href={`/maker/${maker.id}`}
                className="flex items-center gap-4 bg-bg-card backdrop-blur-sm rounded-xl p-4 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.04)] no-underline hover:shadow-[0_8px_20px_rgba(62,39,35,0.1)] transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-coffee-dark flex items-center justify-center text-xl flex-shrink-0">
                  ☕
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-coffee-dark text-sm truncate">
                    {maker.shop_name}
                  </h4>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500 text-xs">
                      {"★".repeat(Math.floor(maker.avg_rating))}
                    </span>
                    <span className="text-xs text-coffee-main">
                      ({maker.total_ratings})
                    </span>
                    {maker.is_live && (
                      <span className="ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[800] text-xl text-coffee-dark">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-sm text-accent font-bold no-underline">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between bg-bg-card backdrop-blur-sm rounded-xl p-4 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.04)]"
              >
                <div>
                  <p className="font-bold text-coffee-dark text-sm">{order.order_number}</p>
                  <p className="text-xs text-coffee-main">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-[800] text-coffee-dark">${order.total_amount.toFixed(2)}</p>
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
