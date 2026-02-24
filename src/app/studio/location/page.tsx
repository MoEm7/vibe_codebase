"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LocationPage() {
  const router = useRouter();
  const [makerId, setMakerId] = useState<string | null>(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLocation();
  }, []);

  async function loadLocation() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profile } = await supabase
      .from("maker_profiles")
      .select("id, latitude, longitude, location_label, is_live")
      .eq("user_id", user.id)
      .single();

    if (!profile) { router.push("/"); return; }

    setMakerId(profile.id);
    if (profile.latitude) setLatitude(String(profile.latitude));
    if (profile.longitude) setLongitude(String(profile.longitude));
    if (profile.location_label) setLocationLabel(profile.location_label);
    setIsLive(profile.is_live);
    setLoading(false);
  }

  async function detectLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }

    setError(null);
    setMessage("Detecting your location...");

    const onSuccess = (position: GeolocationPosition) => {
      setLatitude(String(position.coords.latitude));
      setLongitude(String(position.coords.longitude));
      setMessage("✅ Location detected! Click Save to confirm.");
    };

    const onError = (err: GeolocationPositionError) => {
      setMessage(null);
      if (err.code === 1) {
        setError("Permission denied. Click the 🔒 lock icon in your browser address bar → set Location to Allow, then try again.");
      } else if (err.code === 2) {
        setError("Location signal unavailable. Trying again with lower accuracy...");
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          (fallbackErr) => {
            setError("Still couldn't detect location. On Windows, go to Settings → Privacy → Location and make sure it's On. Or enter coordinates manually below.");
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
        );
      } else if (err.code === 3) {
        setError("Timed out. Retrying with lower accuracy...");
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          () => setError("Location timed out. Try entering coordinates manually, or use Google Maps to find your lat/lng."),
          { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
        );
      } else {
        setError("Could not detect location: " + err.message);
      }
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: true, timeout: 10000 });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!makerId) return;
    setError(null);
    setMessage(null);
    setSaving(true);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("maker_profiles")
      .update({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        location_label: locationLabel || null,
        is_live: isLive,
      })
      .eq("id", makerId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Location saved successfully! ✅");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-5 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-coffee-dark border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-5 py-10">
      <Link href="/studio" className="text-sm text-coffee-main no-underline hover:text-coffee-dark">
        ← Back to Studio
      </Link>
      <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px] mt-2 mb-2">
        Set Location
      </h1>
      <p className="text-coffee-main mb-8">
        Pin your spot so sippers can find you!
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
          {message}
        </div>
      )}

      <button
        type="button"
        onClick={detectLocation}
        className="w-full py-4 rounded-xl bg-accent text-coffee-dark font-[800] text-lg cursor-pointer hover:brightness-110 transition-all border-none mb-6"
      >
        📍 Auto-Detect My Location
      </button>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-coffee-dark mb-1.5">Latitude</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g. 40.7128"
              required
              className="w-full px-5 py-3.5 rounded-xl border-2 border-pattern-stroke bg-white text-text-dark outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-coffee-dark mb-1.5">Longitude</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g. -74.0060"
              required
              className="w-full px-5 py-3.5 rounded-xl border-2 border-pattern-stroke bg-white text-text-dark outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-coffee-dark mb-1.5">
            Location Name (optional)
          </label>
          <input
            type="text"
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            placeholder="e.g. Near Central Park, Times Square"
            className="w-full px-5 py-3.5 rounded-xl border-2 border-pattern-stroke bg-white text-text-dark outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex items-center gap-4 bg-bg-card rounded-xl p-4 border border-white/80">
          <button
            type="button"
            onClick={() => setIsLive(!isLive)}
            className={`relative w-14 h-7 rounded-full cursor-pointer transition-colors border-none ${
              isLive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow ${
                isLive ? "left-7" : "left-0.5"
              }`}
            />
          </button>
          <div>
            <p className="font-bold text-coffee-dark text-sm">
              {isLive ? "🟢 You're LIVE" : "⚫ You're OFFLINE"}
            </p>
            <p className="text-xs text-coffee-main">
              {isLive
                ? "Sippers can see you on the map"
                : "Toggle on when you're ready to serve"}
            </p>
          </div>
        </div>

        {latitude && longitude && (
          <div className="bg-bg-card rounded-xl p-4 border border-white/80 text-center">
            <p className="text-sm text-coffee-main mb-2">Preview on Google Maps:</p>
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent font-bold text-sm no-underline hover:underline"
            >
              📍 View {latitude}, {longitude} →
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-xl bg-coffee-dark text-white font-[800] text-lg cursor-pointer hover:brightness-110 transition-all disabled:opacity-50 border-none"
        >
          {saving ? "Saving..." : "Save Location"}
        </button>
      </form>
    </main>
  );
}
