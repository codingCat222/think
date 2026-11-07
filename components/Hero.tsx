import Image from "next/image";
import flyerImg from "../public/flyer.jpg";

export default function Hero() {
  return (
    <section id="home" className="bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-0">
        <div className="flex items-center justify-between text-xs font-mono text-ink/50 pb-6 border-b border-ink/10">
          <span>HAPPY DECEMBER PROGRAMME</span>
          <span>SAT 12 DEC 2026 — IBADAN</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <h1 className="font-display leading-[0.95]">
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-black text-ink">
                Happy December.
              </span>
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-medium italic text-signal mt-1">
                Best Kids&rsquo; Apps Challenge.
              </span>
            </h1>

            <p className="mt-8 text-lg text-ink/70 leading-relaxed">
              A festive celebration of young innovation. Children build their
              boldest apps, present them live on stage with pride, and play hard
              while they&rsquo;re at it — hosted by ThinkUp Innovation Services.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#register"
                className="bg-signal hover:bg-signal-dark text-white font-semibold px-7 py-4 transition-colors focus-ring"
              >
                Register now
              </a>
              <a
                href="#challenge"
                className="border border-ink text-ink font-semibold px-7 py-4 hover:bg-ink hover:text-white transition-colors focus-ring"
              >
                Learn more
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-ink/15 p-2 bg-white shadow-sm">
              <Image
                src={flyerImg}
                alt="Happy December Best Kids' Apps Challenge Flyer"
                className="w-full h-auto block"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-ink/10">
          <div className="py-6 sm:pr-8">
            <p className="text-xs font-mono text-ink/40 mb-1">DATE</p>
            <p className="font-semibold text-ink">Saturday, December 12, 2026</p>
          </div>
          <div className="py-6 sm:px-8">
            <p className="text-xs font-mono text-ink/40 mb-1">TIME</p>
            <p className="font-semibold text-ink">10:00 AM &ndash; 5:00 PM</p>
          </div>
          <div className="py-6 sm:pl-8">
            <p className="text-xs font-mono text-ink/40 mb-1">VENUE</p>
            <p className="font-semibold text-ink">ThinkUp Innovation Hub, Ibadan</p>
          </div>
        </div>
      </div>
    </section>
  );
}
