import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full py-8 flex justify-center gap-10 relative z-10">
      <Link
        href="/about"
        className="no-underline text-coffee-dark font-bold text-sm uppercase tracking-[1.5px] hover:text-accent hover:-translate-y-0.5 transition-all"
      >
        About Us
      </Link>
      <Link
        href="/contact"
        className="no-underline text-coffee-dark font-bold text-sm uppercase tracking-[1.5px] hover:text-accent hover:-translate-y-0.5 transition-all"
      >
        Contact
      </Link>
      <Link
        href="/explore"
        className="no-underline text-coffee-dark font-bold text-sm uppercase tracking-[1.5px] hover:text-accent hover:-translate-y-0.5 transition-all"
      >
        Explore
      </Link>
      <Link
        href="/blog"
        className="no-underline text-coffee-dark font-bold text-sm uppercase tracking-[1.5px] hover:text-accent hover:-translate-y-0.5 transition-all"
      >
        Blogs
      </Link>
      <Link
        href="/how-it-works"
        className="no-underline text-coffee-dark font-bold text-sm uppercase tracking-[1.5px] hover:text-accent hover:-translate-y-0.5 transition-all"
      >
        How It Works
      </Link>
    </nav>
  );
}
