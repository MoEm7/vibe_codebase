import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Home() {
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
          Connecting coffee lovers with the nearest mobile coffee makers — fresh
          brews, just around the corner.
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
          <Link
            href="/explore"
            className="text-coffee-main text-base font-bold no-underline hover:text-coffee-dark transition-colors"
          >
            Guest Mode
          </Link>
          <Link
            href="/login"
            className="text-coffee-dark border-2 border-accent px-5 py-2 rounded-xl font-bold no-underline hover:bg-accent hover:text-white transition-all"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
