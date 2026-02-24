import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: "📝",
    title: "Sign Up",
    description: "Choose your role — Maker or Sipper. Create your profile in seconds.",
  },
  {
    number: "02",
    icon: "📍",
    title: "Set Your Location",
    description: "Makers drop a pin on the map. Sippers share their location to find nearby brews.",
  },
  {
    number: "03",
    icon: "☕",
    title: "List Your Menu",
    description: "Makers add products with prices, photos, and categories. Go live when you're ready!",
  },
  {
    number: "04",
    icon: "🔍",
    title: "Discover & Order",
    description: "Sippers browse nearby makers, check menus, ratings, and pre-order their favorite drinks.",
  },
  {
    number: "05",
    icon: "🧭",
    title: "Get Me There",
    description: "Tap the button and get directions straight to your chosen maker. Fresh coffee awaits!",
  },
];

const features = [
  { icon: "🟢", title: "Live Status", desc: "See who's serving right now" },
  { icon: "⭐", title: "Ratings & Reviews", desc: "Trust the community" },
  { icon: "📱", title: "Mobile First", desc: "Works beautifully on any device" },
  { icon: "🔔", title: "Real-time Updates", desc: "Order status in real-time" },
  { icon: "❤️", title: "Favorites", desc: "Save your go-to makers" },
  { icon: "📸", title: "QR Codes", desc: "Scan to see any maker's menu" },
];

export default function HowItWorksPage() {
  return (
    <main className="max-w-4xl mx-auto px-5 py-16">
      <div className="text-center mb-16">
        <h1 className="font-[800] text-5xl text-coffee-dark tracking-[-2px] mb-4">
          How It Works
        </h1>
        <p className="text-xl text-coffee-main max-w-lg mx-auto">
          From sign-up to sipping — here&apos;s how Coffee Carriers connects makers and sippers.
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-pattern-stroke hidden md:block" />

        <div className="space-y-12">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-coffee-dark text-white rounded-2xl flex items-center justify-center text-2xl font-[800] relative z-10">
                {step.icon}
              </div>
              <div className="bg-bg-card backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-[0_8px_24px_rgba(62,39,35,0.06)] flex-1">
                <span className="text-xs font-bold text-accent uppercase tracking-widest">
                  Step {step.number}
                </span>
                <h3 className="text-xl font-bold text-coffee-dark mt-1 mb-2">
                  {step.title}
                </h3>
                <p className="text-coffee-main">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20">
        <h2 className="font-[800] text-3xl text-coffee-dark tracking-[-1px] text-center mb-10">
          Why Coffee Carriers?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-bg-card backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.04)] text-center"
            >
              <p className="text-3xl mb-2">{f.icon}</p>
              <h4 className="font-bold text-coffee-dark text-sm mb-1">{f.title}</h4>
              <p className="text-xs text-coffee-main">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center">
        <div className="bg-bg-card backdrop-blur-sm rounded-[30px] p-10 border border-white/80 shadow-[0_12px_32px_rgba(62,39,35,0.08)]">
          <h2 className="font-[800] text-3xl text-coffee-dark tracking-[-1px] mb-4">
            Ready to get started?
          </h2>
          <p className="text-coffee-main mb-8 text-lg">
            Join the Coffee Carriers community today.
          </p>
          <div className="flex justify-center flex-wrap gap-4">
            <Link
              href="/register?role=maker"
              className="px-8 py-3.5 bg-coffee-dark text-white rounded-xl font-[800] no-underline hover:brightness-110 transition-all"
            >
              ☕ I Make Coffee
            </Link>
            <Link
              href="/register?role=sipper"
              className="px-8 py-3.5 border-2 border-accent text-coffee-dark rounded-xl font-[800] no-underline hover:bg-accent hover:text-white transition-all"
            >
              🔍 I Need Coffee
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
