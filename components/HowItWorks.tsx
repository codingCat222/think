import { STEPS } from "@/lib/content";

export default function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 bg-signal text-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <p className="text-xs font-mono text-white/70 mb-4">HOW IT WORKS</p>
        <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight mb-14 max-w-lg">
          Three steps to the stage.
        </h2>

        <div className="grid sm:grid-cols-3 gap-10 sm:gap-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="border-t-2 border-white pt-5">
              <span className="font-display text-5xl italic font-medium block mb-4">
                {i + 1}
              </span>
              <p className="font-semibold text-lg mb-2">{s.title}</p>
              <p className="text-sm text-white/80 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
