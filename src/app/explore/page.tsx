"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { MakerProfile } from "@/types/database";

interface NearbyMaker extends MakerProfile {
  distance_km: number;
}

export default function ExplorePage() {
  const [makers, setMakers] = useState<NearbyMaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    }

    checkAuth();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setLocationError("Location access denied. Showing all makers.");
          loadAllMakers();
        }
      );
    } else {
      setLocationError("Geolocation not supported. Showing all makers.");
      loadAllMakers();
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadNearbyMakers(userLocation.lat, userLocation.lng);
    }
  }, [userLocation]);

  async function loadNearbyMakers(lat: number, lng: number) {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_nearby_makers", {
      user_lat: lat,
      user_lng: lng,
      radius_km: 50,
    });

    if (!error && data) {
      setMakers(data as NearbyMaker[]);
    }
    setLoading(false);
  }

  async function loadAllMakers() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("maker_profiles")
      .select("*")
      .not("latitude", "is", null)
      .order("avg_rating", { ascending: false })
      .limit(50);

    if (!error && data) {
      setMakers(data.map((m) => ({ ...m, distance_km: 0 })) as NearbyMaker[]);
    }
    setLoading(false);
  }

  function renderStars(rating: number) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
      <span className="text-amber-500">
        {"★".repeat(full)}
        {half && "½"}
        {"☆".repeat(5 - full - (half ? 1 : 0))}
      </span>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-5 py-10">
      <div className="text-center mb-10">
        <h1 className="font-[800] text-4xl text-coffee-dark tracking-[-1.5px] mb-3">
          Explore Nearby Makers
        </h1>
        <p className="text-coffee-main text-lg">
          Discover mobile coffee makers around you
        </p>
        {locationError && (
          <p className="text-sm text-amber-600 mt-2">{locationError}</p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-coffee-dark border-t-transparent rounded-full animate-spin" />
          <p className="text-coffee-main mt-4">Finding nearby makers...</p>
        </div>
      ) : makers.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">☕</p>
          <h2 className="text-2xl text-coffee-dark font-bold mb-2">
            No makers nearby yet
          </h2>
          <p className="text-coffee-main mb-6">
            Be the first to set up shop in your area!
          </p>
          <Link
            href="/register?role=maker"
            className="inline-block px-8 py-3 bg-coffee-dark text-white rounded-xl font-bold no-underline hover:brightness-110 transition-all"
          >
            Become a Maker
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {makers.map((maker) => (
            <div
              key={maker.id}
              className="bg-bg-card backdrop-blur-sm rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(62,39,35,0.06)] overflow-hidden hover:shadow-[0_12px_32px_rgba(62,39,35,0.12)] transition-shadow"
            >
              <div className="h-32 bg-gradient-to-br from-coffee-dark to-coffee-main relative">
                {maker.logo_url && (
                  <img
                    src={maker.logo_url}
                    alt={maker.shop_name}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 rounded-full border-4 border-white object-cover"
                  />
                )}
                {maker.is_live && (
                  <span className="absolute top-3 right-3 flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>

              <div className="p-5 pt-10 text-center">
                <h3 className="text-lg font-bold text-coffee-dark mb-1">
                  {maker.shop_name}
                </h3>

                <div className="flex items-center justify-center gap-2 mb-2">
                  {renderStars(maker.avg_rating)}
                  <span className="text-sm text-coffee-main">
                    ({maker.total_ratings})
                  </span>
                </div>

                {maker.distance_km > 0 && (
                  <p className="text-sm text-coffee-main mb-1">
                    📍 {maker.distance_km.toFixed(1)} km away
                  </p>
                )}

                {maker.location_label && (
                  <p className="text-xs text-coffee-main/70 mb-3">
                    {maker.location_label}
                  </p>
                )}

                <p className="text-sm text-coffee-main mb-4">
                  {maker.total_products} items on menu
                </p>

                {isAuthenticated ? (
                  <Link
                    href={`/maker/${maker.id}`}
                    className="inline-block px-6 py-2.5 bg-coffee-dark text-white rounded-xl font-bold text-sm no-underline hover:brightness-110 transition-all"
                  >
                    View Menu & Details
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="inline-block px-6 py-2.5 border-2 border-accent text-coffee-dark rounded-xl font-bold text-sm no-underline hover:bg-accent hover:text-white transition-all"
                  >
                    Register to See More
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
