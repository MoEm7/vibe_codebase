"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";

const MAKER_LINKS = [
  { href: "/studio", icon: "🎛️", label: "My Studio" },
  { href: "/studio/products", icon: "🛍️", label: "Products" },
  { href: "/studio/location", icon: "📍", label: "Set Location" },
  { href: "/studio/orders", icon: "📋", label: "Orders" },
];

const SIPPER_LINKS = [
  { href: "/explore", icon: "🗺️", label: "Explore" },
  { href: "/dashboard/orders", icon: "🛒", label: "My Orders" },
  { href: "/dashboard", icon: "💙", label: "Dashboard" },
  { href: "/blog", icon: "📝", label: "Blog" },
];

const ADMIN_LINKS = [
  { href: "/admin", icon: "🛡️", label: "Dashboard" },
  { href: "/admin/blog", icon: "📝", label: "Blog Queue" },
  { href: "/admin/users", icon: "👥", label: "Users" },
  { href: "/blog", icon: "🌐", label: "Public Blog" },
];

export default function Home() {
  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("users").select("role, display_name").eq("id", user.id).single();
        if (data) { setRole(data.role); setDisplayName(data.display_name || ""); }
        else { setRole(null); setDisplayName(""); }
      } else {
        setRole(null);
        setDisplayName("");
      }
      setLoading(false);
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setRole(null);
        setDisplayName("");
      } else {
        loadUser();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-coffee-dark border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (role === "maker" || role === "sipper" || role === "admin") {
    const links = role === "maker" ? MAKER_LINKS : role === "admin" ? ADMIN_LINKS : SIPPER_LINKS;
    const greeting = role === "maker" ? "Your coffee empire awaits ☕" : role === "admin" ? "Platform control center 🛡️" : "Find your next great cup ☕";
    return (
      <main className="min-h-[calc(100vh-100px)] flex items-center justify-center p-5">
        <div className="text-center max-w-[550px] w-full p-12 bg-bg-card backdrop-blur-[10px] rounded-[40px] shadow-[0_20px_50px_rgba(62,39,35,0.08)] border border-white/80">
          <div className="mb-6 flex justify-center">
            <Logo className="w-[90px] h-[90px]" />
          </div>
          <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1.5px] mb-1">
            Welcome back{displayName ? `, ${displayName}` : ""}!
          </h1>
          <p className="text-coffee-main mb-8 font-medium">{greeting}</p>
          <div className="grid grid-cols-2 gap-3">
            {links.map(({ href, icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/80 border border-pattern-stroke text-coffee-dark font-bold no-underline hover:border-accent hover:shadow-[0_4px_12px_rgba(62,39,35,0.08)] transition-all text-sm"
              >
                <span className="text-xl">{icon}</span> {label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-100px)] flex items-center justify-center p-5">
      <div className="text-center max-w-[550px] w-full p-15 bg-bg-card backdrop-blur-[10px] rounded-[40px] shadow-[0_20px_50px_rgba(62,39,35,0.08)] border border-white/80">
        <div className="mb-8 flex justify-center">
          <Logo className="w-[150px] h-[150px]" />
        </div>
        <h1 className="font-[800] text-5xl text-coffee-dark tracking-[-2px] m-0 mb-2">
          Coffee Carriers
        </h1>
        <p className="text-xl text-coffee-main mb-10 font-medium">
          Connecting coffee lovers with the nearest mobile coffee makers — fresh brews, just around the corner.
        </p>
        <div className="flex justify-center flex-wrap gap-5">
          <Link
            href="/register?role=maker"
            className="px-10 py-4.5 rounded-2xl text-xl font-[800] no-underline bg-coffee-dark text-white hover:scale-[1.02] hover:brightness-110 transition-all flex items-center gap-3"
          >
            ☕ I Make Coffee
          </Link>
          <Link
            href="/register?role=sipper"
            className="px-10 py-4.5 rounded-2xl text-xl font-[800] no-underline bg-transparent border-2 border-accent text-coffee-dark hover:scale-[1.02] hover:brightness-110 transition-all flex items-center gap-3"
          >
            🔍 I Need Coffee
          </Link>
        </div>
        <div className="mt-8 flex justify-center items-center gap-6">
          <Link href="/explore" className="text-coffee-main text-base font-bold no-underline hover:text-coffee-dark transition-colors">
            Guest Mode
          </Link>
          <Link href="/login" className="text-coffee-dark border-2 border-accent px-5 py-2 rounded-xl font-bold no-underline hover:bg-accent hover:text-white transition-all">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
