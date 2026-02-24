"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { MakerProfile, Product, Review } from "@/types/database";

export default function MakerProfilePage() {
  const params = useParams();
  const makerId = params.id as string;

  const [maker, setMaker] = useState<MakerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadMaker();
  }, [makerId]);

  async function loadMaker() {
    const supabase = createClient();

    const [makerRes, productsRes, reviewsRes] = await Promise.all([
      supabase.from("maker_profiles").select("*").eq("id", makerId).single(),
      supabase
        .from("products")
        .select("*")
        .eq("maker_id", makerId)
        .eq("is_available", true)
        .order("sort_order"),
      supabase
        .from("reviews")
        .select("*")
        .eq("maker_id", makerId)
        .order("created_at", { ascending: false }),
    ]);

    if (makerRes.data) setMaker(makerRes.data as MakerProfile);
    if (productsRes.data) setProducts(productsRes.data as Product[]);
    if (reviewsRes.data) setReviews(reviewsRes.data as Review[]);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: sipperProfile } = await supabase
        .from("sipper_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (sipperProfile) {
        const { data: fav } = await supabase
          .from("favorites")
          .select("id")
          .eq("sipper_id", sipperProfile.id)
          .eq("maker_id", makerId)
          .single();
        setIsFavorite(!!fav);
      }
    }

    setLoading(false);
  }

  async function toggleFavorite() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: sipperProfile } = await supabase
      .from("sipper_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!sipperProfile) return;

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("sipper_id", sipperProfile.id)
        .eq("maker_id", makerId);
      setIsFavorite(false);
    } else {
      await supabase
        .from("favorites")
        .insert({ sipper_id: sipperProfile.id, maker_id: makerId });
      setIsFavorite(true);
    }
  }

  function renderStars(rating: number) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
      <span className="text-amber-500 text-xl">
        {"★".repeat(full)}
        {half && "½"}
        {"☆".repeat(5 - full - (half ? 1 : 0))}
      </span>
    );
  }

  function getDirectionsUrl() {
    if (!maker?.latitude || !maker?.longitude) return "#";
    return `https://www.google.com/maps/dir/?api=1&destination=${maker.latitude},${maker.longitude}`;
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-5 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-coffee-dark border-t-transparent rounded-full animate-spin" />
        <p className="text-coffee-main mt-4">Loading maker profile...</p>
      </main>
    );
  }

  if (!maker) {
    return (
      <main className="max-w-4xl mx-auto px-5 py-16 text-center">
        <p className="text-6xl mb-4">😕</p>
        <h2 className="text-2xl text-coffee-dark font-bold mb-2">Maker not found</h2>
        <Link href="/explore" className="text-accent font-bold no-underline">
          ← Back to Explore
        </Link>
      </main>
    );
  }

  const categoryGroups = products.reduce(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    },
    {} as Record<string, Product[]>
  );

  return (
    <main className="max-w-4xl mx-auto px-5 py-10">
      <div className="bg-bg-card backdrop-blur-sm rounded-[30px] border border-white/80 shadow-[0_12px_32px_rgba(62,39,35,0.08)] overflow-hidden mb-8">
        <div className="h-48 bg-gradient-to-br from-coffee-dark to-coffee-main relative">
          {maker.cover_image_url && (
            <img
              src={maker.cover_image_url}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
          {maker.is_live && (
            <span className="absolute top-4 right-4 flex items-center gap-2 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
              <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
              LIVE NOW
            </span>
          )}
        </div>

        <div className="p-8 -mt-12 relative">
          <div className="flex items-end gap-4 mb-6">
            {maker.logo_url ? (
              <img
                src={maker.logo_url}
                alt={maker.shop_name}
                className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl border-4 border-white bg-coffee-dark flex items-center justify-center text-4xl shadow-lg">
                ☕
              </div>
            )}
            <div className="flex-1">
              <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px]">
                {maker.shop_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {renderStars(maker.avg_rating)}
                <span className="text-coffee-main text-sm">
                  {maker.avg_rating.toFixed(1)} ({maker.total_ratings} reviews)
                </span>
              </div>
            </div>
            <button
              onClick={toggleFavorite}
              className="text-3xl cursor-pointer bg-transparent border-none hover:scale-110 transition-transform"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
          </div>

          {maker.bio && (
            <p className="text-coffee-main mb-4">{maker.bio}</p>
          )}

          {maker.location_label && (
            <p className="text-sm text-coffee-main/70 mb-4">
              📍 {maker.location_label}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-coffee-dark text-white rounded-xl font-bold no-underline hover:brightness-110 transition-all"
            >
              🧭 Get Me There
            </a>
            <Link
              href={`/maker/${makerId}/order`}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-accent text-coffee-dark rounded-xl font-bold no-underline hover:bg-accent hover:text-white transition-all"
            >
              🛒 Pre-Order
            </Link>
            <Link
              href={`/maker/${makerId}/review`}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-pattern-stroke text-coffee-main rounded-xl font-bold no-underline hover:border-coffee-dark hover:text-coffee-dark transition-all"
            >
              ⭐ Write Review
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-[800] text-2xl text-coffee-dark tracking-[-0.5px] mb-6">
          Menu ({products.length} items)
        </h2>

        {Object.entries(categoryGroups).map(([category, items]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-bold text-accent uppercase tracking-widest mb-3">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 bg-bg-card backdrop-blur-sm rounded-xl p-4 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.04)]"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-coffee-dark/10 flex items-center justify-center text-2xl flex-shrink-0">
                      ☕
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-coffee-dark text-sm truncate">
                      {product.name}
                    </h4>
                    {product.description && (
                      <p className="text-xs text-coffee-main/70 truncate">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <span className="font-[800] text-coffee-dark text-lg flex-shrink-0">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <p className="text-center text-coffee-main py-8">
            No items on the menu yet.
          </p>
        )}
      </div>

      <div>
        <h2 className="font-[800] text-2xl text-coffee-dark tracking-[-0.5px] mb-6">
          Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-center text-coffee-main py-8">
            No reviews yet. Be the first!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-bg-card backdrop-blur-sm rounded-xl p-5 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.04)]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-500">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                  <span className="text-xs text-coffee-main/50">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-coffee-main text-sm">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
