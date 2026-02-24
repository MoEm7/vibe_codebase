"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/ui/Logo";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (redirect) {
        router.push(redirect);
      } else if (userData?.role === "maker") {
        router.push("/studio");
      } else if (userData?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
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
          Welcome Back
        </h1>
        <p className="text-coffee-main mb-8">Log in to your account</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-5 py-3.5 rounded-xl border-2 border-pattern-stroke bg-white text-text-dark text-base outline-none focus:border-accent transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-coffee-dark text-white font-[800] text-lg cursor-pointer hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-coffee-main text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-coffee-dark font-bold no-underline hover:text-accent">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
