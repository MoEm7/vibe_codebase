export default function ContactPage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-[800] text-4xl text-coffee-dark tracking-[-1.5px] mb-2">Contact</h1>
      <p className="text-coffee-main mb-10">Have a question, idea, or just want to say hi? Reach out!</p>

      <div className="space-y-5">
        <div className="bg-bg-card backdrop-blur-sm rounded-2xl p-8 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.06)]">
          <h2 className="font-[800] text-xl text-coffee-dark mb-6">Get in touch</h2>

          <div className="flex flex-col gap-5">
            <a
              href="mailto:engmohem7@gmail.com"
              className="flex items-center gap-4 group no-underline"
            >
              <span className="w-12 h-12 rounded-xl bg-coffee-dark/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-coffee-dark/20 transition-colors">
                ✉️
              </span>
              <div>
                <p className="text-xs text-coffee-main font-semibold uppercase tracking-wider mb-0.5">Email</p>
                <p className="font-bold text-coffee-dark group-hover:text-accent transition-colors">engmohem7@gmail.com</p>
              </div>
            </a>

            <a
              href="https://www.linkedin.com/in/mohab-eb04269115"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 group no-underline"
            >
              <span className="w-12 h-12 rounded-xl bg-[#0077b5]/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-[#0077b5]/20 transition-colors">
                💼
              </span>
              <div>
                <p className="text-xs text-coffee-main font-semibold uppercase tracking-wider mb-0.5">LinkedIn</p>
                <p className="font-bold text-coffee-dark group-hover:text-accent transition-colors">Mohab Emad</p>
              </div>
            </a>
          </div>
        </div>

        <p className="text-center text-sm text-coffee-main py-4">Made with ☕ and a lot of passion.</p>
      </div>
    </main>
  );
}
