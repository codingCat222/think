import { Blocks, Clapperboard, Lightbulb, Laptop } from "lucide-react";
import { CATEGORIES } from "@/lib/content";

const ICONS = { Blocks, Clapperboard, Lightbulb, Laptop } as const;

export default function Categories() {
  return (
    <section id="categories" className="py-20 lg:py-28 bg-white border-t border-ink/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-mono text-signal mb-4">AGE CATEGORIES & PRIZES</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-ink leading-tight">
              Four ages. Four prizes.
            </h2>
          </div>
        </div>

        <div className="border-t border-ink">
          {CATEGORIES.map((c) => {
            const Icon = ICONS[c.icon as keyof typeof ICONS];
            return (
              <div
                key={c.range}
                className="group grid grid-cols-12 items-center py-6 border-b border-ink/15 hover:border-ink transition-colors"
              >
                <div className="col-span-3 sm:col-span-2 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full border border-ink/15 flex items-center justify-center shrink-0 group-hover:border-signal group-hover:text-signal transition-colors">
                    <Icon className="w-4 h-4" strokeWidth={2} />
                  </span>
                  <span className="font-mono text-sm text-ink/40">{c.range}</span>
                </div>
                <div className="col-span-9 sm:col-span-4">
                  <p className="font-display text-xl sm:text-2xl text-ink">{c.label}</p>
                  <p className="text-sm text-ink/50 mt-0.5">{c.perk}</p>
                  <p className="text-xs text-ink/40 mt-1">
                    Registration fee: <span className="font-semibold text-ink/60">₦{c.fee.toLocaleString()}</span>
                  </p>
                </div>
                <div className="col-span-12 sm:col-span-6 mt-3 sm:mt-0 text-left sm:text-right">
                  <span className="font-display text-3xl sm:text-4xl font-semibold text-signal">
                    {c.prize}
                  </span>
                  <span className="block text-xs text-ink/40 sm:text-right">prize</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
