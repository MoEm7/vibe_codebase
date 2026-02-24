export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="font-[800] text-4xl text-coffee-dark tracking-[-1.5px] mb-2">About Us</h1>
      <p className="text-coffee-main mb-10">The story behind Coffee Carriers.</p>

      <div className="space-y-8">

        <section className="bg-bg-card backdrop-blur-sm rounded-2xl p-8 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.06)]">
          <h2 className="font-[800] text-2xl text-coffee-dark mb-4">☕ What is Coffee Carriers?</h2>
          <p className="text-coffee-main leading-relaxed">
            Coffee Carriers is a platform built to connect independent mobile coffee makers with coffee lovers in their area.
            Whether you run a coffee cart on the corner or you're just craving a great flat white nearby — this is your place.
          </p>
        </section>

        <section className="bg-bg-card backdrop-blur-sm rounded-2xl p-8 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.06)]">
          <h2 className="font-[800] text-2xl text-coffee-dark mb-4">🛠️ Built by</h2>
          <p className="text-coffee-main leading-relaxed mb-3">
            This website was created through <strong className="text-coffee-dark">vibe coding</strong> — building fast, iterating live, and shipping ideas into reality.
          </p>
          <p className="text-coffee-main leading-relaxed mb-3">
            Built by <strong className="text-coffee-dark">Mohab</strong> —{" "}
            <a href="mailto:engmohem7@gmail.com" className="text-accent font-bold no-underline hover:underline">
              engmohem7@gmail.com
            </a>
          </p>
          <p className="text-coffee-main leading-relaxed">
            All tips, guidance, and inspiration credits go to{" "}
            <strong className="text-coffee-dark">Zack Wilson</strong>{" "}
            (<a href="https://learn.dataexpert.io" target="_blank" rel="noopener noreferrer" className="text-accent font-bold no-underline hover:underline">learn.dataexpert.io</a>)
            {" "}and{" "}
            <strong className="text-coffee-dark">Li Yin</strong>{" "}
            (creator of the amazing AI tool{" "}
            <a href="https://sylph.ai" target="_blank" rel="noopener noreferrer" className="text-accent font-bold no-underline hover:underline">
              Sylph.AI
            </a>
            ) — thank you for the knowledge and the push to build.
          </p>
        </section>

        <section className="bg-bg-card backdrop-blur-sm rounded-2xl p-8 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.06)]">
          <h2 className="font-[800] text-2xl text-coffee-dark mb-4">🚀 Future Work</h2>
          <p className="text-coffee-main mb-5 leading-relaxed">
            I welcome developing this idea further — whether it's contributions, partnerships, or just great feedback. Here's what's on the horizon:
          </p>
          <ol className="space-y-3">
            {[
              { n: "1", title: "Multi-language support", desc: "Arabic, French, and German — making Coffee Carriers accessible to more communities." },
              { n: "2", title: "Online payment", desc: "Integrated payments so sippers can pay before pickup — seamless and secure." },
              { n: "3", title: "Paid blogging service", desc: "Premium tools for makers to grow their audience and monetize their coffee story." },
              { n: "4", title: "Advanced analytics & data mining", desc: "Deeper insights for makers — peak hours, popular drinks, customer patterns, and growth trends." },
            ].map(({ n, title, desc }) => (
              <li key={n} className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-coffee-dark text-white flex items-center justify-center font-[800] text-sm flex-shrink-0">{n}</span>
                <div>
                  <p className="font-bold text-coffee-dark">{title}</p>
                  <p className="text-sm text-coffee-main mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="text-center py-6">
          <p className="text-coffee-main text-sm">Made with ☕ and a lot of passion.</p>
        </section>

      </div>
    </main>
  );
}
