import { createClient, createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const [
    { count: totalUsers },
    { count: totalMakers },
    { count: totalSippers },
    { count: pendingBlogs },
    { count: liveMakers },
    { data: recentUsers },
  ] = await Promise.all([
    admin.from("users").select("*", { count: "exact", head: true }),
    admin.from("users").select("*", { count: "exact", head: true }).eq("role", "maker"),
    admin.from("users").select("*", { count: "exact", head: true }).eq("role", "sipper"),
    admin.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
    admin.from("maker_profiles").select("*", { count: "exact", head: true }).eq("is_live", true),
    admin.from("users").select("id, display_name, email, role, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Total Users", value: totalUsers ?? 0, icon: "👥" },
    { label: "Makers", value: totalMakers ?? 0, icon: "🧑‍🍳" },
    { label: "Sippers", value: totalSippers ?? 0, icon: "☕" },
    { label: "Pending Posts", value: pendingBlogs ?? 0, icon: "📝", alert: (pendingBlogs ?? 0) > 0 },
    { label: "Live Now", value: liveMakers ?? 0, icon: "🟢" },
  ];

  return (
    <main className="max-w-5xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px]">Admin Dashboard</h1>
        <p className="text-coffee-main text-sm mt-1">Platform overview and controls</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {stats.map(({ label, value, icon, alert }) => (
          <div key={label} className={`bg-bg-card backdrop-blur-sm rounded-2xl p-5 border shadow-[0_4px_12px_rgba(62,39,35,0.04)] text-center ${alert ? "border-amber-300 bg-amber-50" : "border-white/80"}`}>
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-3xl font-[800] text-coffee-dark">{value}</p>
            <p className="text-xs text-coffee-main mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <Link href="/admin/blog" className="bg-bg-card backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-[0_8px_24px_rgba(62,39,35,0.06)] no-underline hover:shadow-[0_12px_32px_rgba(62,39,35,0.12)] transition-shadow">
          <p className="text-3xl mb-3">📝</p>
          <h3 className="font-bold text-coffee-dark mb-1">Blog Approval Queue</h3>
          <p className="text-sm text-coffee-main">Review and approve maker blog posts</p>
          {(pendingBlogs ?? 0) > 0 && (
            <span className="inline-block mt-3 text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
              {pendingBlogs} pending
            </span>
          )}
        </Link>
        <Link href="/admin/users" className="bg-bg-card backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-[0_8px_24px_rgba(62,39,35,0.06)] no-underline hover:shadow-[0_12px_32px_rgba(62,39,35,0.12)] transition-shadow">
          <p className="text-3xl mb-3">👥</p>
          <h3 className="font-bold text-coffee-dark mb-1">User Management</h3>
          <p className="text-sm text-coffee-main">Verify makers, manage accounts</p>
        </Link>
      </div>

      <div>
        <h2 className="font-bold text-coffee-dark mb-4">Recent Signups</h2>
        <div className="space-y-3">
          {recentUsers?.map((user: any) => (
            <div key={user.id} className="flex items-center justify-between bg-bg-card backdrop-blur-sm rounded-xl p-4 border border-white/80">
              <div>
                <p className="font-bold text-coffee-dark text-sm">{user.display_name || "—"}</p>
                <p className="text-xs text-coffee-main">{user.email}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.role === "maker" ? "bg-coffee-dark/10 text-coffee-dark" : "bg-accent/20 text-coffee-dark"}`}>
                  {user.role}
                </span>
                <p className="text-xs text-coffee-main mt-1">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
