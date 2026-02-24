"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewProductPage() {
  const router = useRouter();
  const [makerId, setMakerId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("hot");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getMakerId() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("maker_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profile) setMakerId(profile.id);
    }
    getMakerId();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!makerId) return;
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("products").insert({
      maker_id: makerId,
      name,
      description: description || null,
      price: parseFloat(price),
      category,
      is_available: true,
      sort_order: 0,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/studio/products");
  }

  return (
    <main className="max-w-lg mx-auto px-5 py-10">
      <Link href="/studio/products" className="text-sm text-coffee-main no-underline hover:text-coffee-dark">
        ← Back to Products
      </Link>
      <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px] mt-2 mb-8">
        Add Product
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-bold text-coffee-dark mb-1.5">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Flat White"
            required
            className="w-full px-5 py-3.5 rounded-xl border-2 border-pattern-stroke bg-white text-text-dark outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-coffee-dark mb-1.5">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Flavor notes, ingredients..."
            rows={3}
            className="w-full px-5 py-3.5 rounded-xl border-2 border-pattern-stroke bg-white text-text-dark outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-coffee-dark mb-1.5">Price (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="4.50"
              required
              className="w-full px-5 py-3.5 rounded-xl border-2 border-pattern-stroke bg-white text-text-dark outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-coffee-dark mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl border-2 border-pattern-stroke bg-white text-text-dark outline-none focus:border-accent transition-colors"
            >
              <option value="hot">☕ Hot</option>
              <option value="cold">🧊 Cold</option>
              <option value="pastry">🥐 Pastry</option>
              <option value="snack">🍪 Snack</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-coffee-dark text-white font-[800] text-lg cursor-pointer hover:brightness-110 transition-all disabled:opacity-50 border-none mt-2"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </main>
  );
}
