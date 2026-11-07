const PILLARS = [
  { word: "Learn", note: "Curiosity is the starting point." },
  { word: "Think", note: "Ideas deserve room to form." },
  { word: "Innovate", note: "Turning a thought into a thing." },
  { word: "Scale", note: "Growing what works." },
];

export default function About() {
  return (
    <section id="about" className="py-20 lg:py-28 bg-white border-t border-ink/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-xs font-mono text-signal mb-4">ABOUT US</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-ink leading-tight">
              ThinkUp Innovation Services
            </h2>
            <p className="mt-6 text-ink/60 leading-relaxed">
              We exist to empower innovative minds, starting young. We build
              spaces where children and teens discover that their ideas
              matter, and that curiosity, nurtured well, can grow into
              real-world solutions.
            </p>
          </div>

          <div className="lg:col-span-7">
            <dl>
              {PILLARS.map((p, i) => (
                <div
                  key={p.word}
                  className="flex items-baseline gap-6 py-5 border-b border-ink/10 first:border-t"
                >
                  <dt className="font-mono text-sm text-ink/30 w-6 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </dt>
                  <dd className="flex-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <span className="font-display text-2xl text-ink">{p.word}</span>
                    <span className="text-sm text-ink/50">{p.note}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
