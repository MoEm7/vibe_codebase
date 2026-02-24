"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types/database";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [makerId, setMakerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profile } = await supabase
      .from("maker_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) { router.push("/"); return; }
    setMakerId(profile.id);

    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("maker_id", profile.id)
      .order("sort_order");

    if (data) setProducts(data as Product[]);
    setLoading(false);
  }

  async function toggleAvailability(product: Product) {
    const supabase = createClient();
    await supabase
      .from("products")
      .update({ is_available: !product.is_available })
      .eq("id", product.id);

    setProducts(
      products.map((p) =>
        p.id === product.id ? { ...p, is_available: !p.is_available } : p
      )
    );
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-5 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-coffee-dark border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/studio" className="text-sm text-coffee-main no-underline hover:text-coffee-dark">
            ← Back to Studio
          </Link>
          <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px] mt-2">
            My Products
          </h1>
        </div>
        <Link
          href="/studio/products/new"
          className="px-6 py-3 bg-coffee-dark text-white rounded-xl font-bold no-underline hover:brightness-110 transition-all"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🛍️</p>
          <h2 className="text-xl text-coffee-dark font-bold mb-2">No products yet</h2>
          <p className="text-coffee-main mb-6">Add your first menu item to get started!</p>
          <Link
            href="/studio/products/new"
            className="inline-block px-8 py-3 bg-coffee-dark text-white rounded-xl font-bold no-underline"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`flex items-center gap-4 bg-bg-card backdrop-blur-sm rounded-xl p-4 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.04)] ${
                !product.is_available ? "opacity-50" : ""
              }`}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-coffee-dark/10 flex items-center justify-center text-2xl flex-shrink-0">
                  ☕
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-coffee-dark truncate">{product.name}</h3>
                <p className="text-xs text-coffee-main">
                  {product.category} · ${product.price.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleAvailability(product)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border-none ${
                    product.is_available
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {product.is_available ? "Available" : "Hidden"}
                </button>
                <Link
                  href={`/studio/products/${product.id}/edit`}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 no-underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-700 cursor-pointer border-none"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
