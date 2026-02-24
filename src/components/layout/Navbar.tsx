"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/ui/Logo";

const NAV_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/explore", label: "Explore" },
  { href: "/blog", label: "Blogs" },
  { href: "/how-it-works", label: "How It Works" },
];

const linkClass =
  "no-underline text-coffee-dark font-bold text-sm uppercase tracking-[1.5px] hover:text-accent hover:-translate-y-0.5 transition-all";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <nav className="w-full py-8 flex items-center justify-center gap-10 relative z-10">
      <Link href="/" className="flex items-center gap-2 mr-4 hover:-translate-y-0.5 transition-all">
        <Logo className="w-7 h-7" />
        <span className="text-coffee-dark font-[800] text-sm uppercase tracking-[1.5px]">Home</span>
      </Link>

      {NAV_LINKS.map(({ href, label }) => (
        <Link key={href} href={href} className={linkClass}>
          {label}
        </Link>
      ))}

      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="text-coffee-dark font-bold text-sm uppercase tracking-[1.5px] hover:text-accent hover:-translate-y-0.5 transition-all bg-transparent border-none cursor-pointer"
        >
          Logout
        </button>
      ) : (
        <Link href="/login" className={linkClass}>
          Login
        </Link>
      )}
    </nav>
  );
}
