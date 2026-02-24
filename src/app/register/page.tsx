"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/ui/Logo";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get("role") as "maker" | "sipper" | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"maker" | "sipper">(preselectedRole || "sipper");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.push(role === "maker" ? "/studio" : "/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-[calc(100vh-100px)] flex items-center justify-center p-5">
      <div className="text-center max-w-[450px] w-full p-10 bg-bg-card backdrop-blur-[10px] rounded-[40px] shadow-[0_20px_50px_rgba(62,39,35,0.08)] border border-white/80">
        <div className="mb-6 flex justify-center">
          <Logo className="w-20 h-20" />
        </div>

        <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px] mb-2">
          Join Coffee Carriers
        </h1>
        <p className="text-coffee-main mb-8">Create your account</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-3 justify-center mb-2">
            <button
              type="button"
              onClick={() => setRole("sipper")}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer border-2 ${
                role === "sipper"
                  ? "bg-accent text-coffee-dark border-accent"
                  : "bg-transparent text-coffee-main border-pattern-stroke"
              }`}
            >
              🔍 I Need Coffee
            </button>
            <button
              type="button"
              onClick={() => setRole("maker")}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer border-2 ${
                role === "maker"
                  ? "bg-coffee-dark text-white border-coffee-dark"
                  : "bg-transparent text-coffee-main border-pattern-stroke"
              }`}
            >
              ☕ I Make Coffee
            </button>
          </div>

          <input
            type="text"
            placeholder={role === "maker" ? "Shop Name" : "Display Name"}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-5 py-3.5 rounded-xl border-2 border-pattern-stroke bg-white text-text-dark text-base outline-none focus:border-accent transition-colors"
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-5 py-3.5 rounded-xl border-2 border-pattern-stroke bg-white text-text-dark text-base outline-none focus:border-accent transition-colors"
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-5 py-3.5 rounded-xl border-2 border-pattern-stroke bg-white text-text-dark text-base outline-none focus:border-accent transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-coffee-dark text-white font-[800] text-lg cursor-pointer hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-coffee-main text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-coffee-dark font-bold no-underline hover:text-accent">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
}
