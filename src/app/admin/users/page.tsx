"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  display_name: string;
  email: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "maker" | "sipper">("all");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  async function toggleVerified(userId: string, current: boolean) {
    setActing(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_verified: !current }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_verified: !current } : u));
    setActing(null);
  }

  async function toggleActive(userId: string, current: boolean) {
    setActing(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: !current } : u));
    setActing(null);
  }

  const filtered = filter === "all" ? users : users.filter((u) => u.role === filter);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-5 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-coffee-dark border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-coffee-main hover:text-coffee-dark text-sm">← Admin</Link>
        <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px]">User Management</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {(["all", "maker", "sipper"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer border-none transition-all ${filter === f ? "bg-coffee-dark text-white" : "bg-white/80 text-coffee-main border border-pattern-stroke hover:border-coffee-dark"}`}>
            {f === "all" ? "All" : f === "maker" ? "🧑‍🍳 Makers" : "☕ Sippers"}
          </button>
        ))}
        <span className="ml-auto text-sm text-coffee-main self-center">{filtered.length} users</span>
      </div>

      <div className="space-y-3">
        {filtered.map((user) => (
          <div key={user.id} className={`bg-bg-card backdrop-blur-sm rounded-2xl p-5 border shadow-[0_4px_12px_rgba(62,39,35,0.04)] ${!user.is_active ? "opacity-60 border-red-200" : "border-white/80"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-coffee-dark">{user.display_name || "—"}</p>
                  {user.is_verified && <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">✅ Verified</span>}
                  {!user.is_active && <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">🚫 Banned</span>}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.role === "maker" ? "bg-coffee-dark/10 text-coffee-dark" : user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-accent/20 text-coffee-dark"}`}>
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-coffee-main mt-0.5">{user.email}</p>
                <p className="text-xs text-coffee-main/60 mt-1">Joined {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              {user.role !== "admin" && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleVerified(user.id, user.is_verified)}
                    disabled={acting === user.id}
                    title={user.is_verified ? "Remove verification" : "Verify user"}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer border-none transition-all disabled:opacity-50 ${user.is_verified ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700"}`}
                  >
                    {user.is_verified ? "✅ Verified" : "Verify"}
                  </button>
                  <button
                    onClick={() => toggleActive(user.id, user.is_active)}
                    disabled={acting === user.id}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer border-none transition-all disabled:opacity-50 ${user.is_active ? "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700" : "bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700"}`}
                  >
                    {user.is_active ? "Ban" : "Unban"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
