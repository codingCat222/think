"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FAQS } from "@/lib/content";

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-20 lg:py-28 bg-white border-t border-ink/10">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <p className="text-xs font-mono text-signal mb-4">FAQ</p>
        <h2 className="font-display text-4xl sm:text-5xl font-semibold text-ink leading-tight mb-12">
          Questions, answered.
        </h2>

        <div className="border-t border-ink">
          {FAQS.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={f.q} className="border-b border-ink/15">
                <button
                  className="w-full flex items-center justify-between gap-4 py-5 text-left focus-ring"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-ink">{f.q}</span>
                  <Plus
                    className={`w-5 h-5 text-signal shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="pb-5 text-sm text-ink/60 leading-relaxed max-w-xl">{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
