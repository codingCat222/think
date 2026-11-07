import { VENUE_ADDRESS } from "@/lib/content";

export default function EventDetails() {
  const mapsQuery = encodeURIComponent(
    "Purpose Mall, 23 Awolowo Avenue, Old Bodija, Ibadan"
  );

  return (
    <section id="event" className="py-20 lg:py-28 bg-white border-t border-ink/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="text-xs font-mono text-signal mb-4">EVENT DETAILS</p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-ink leading-tight mb-10">
            Mark the date.
          </h2>

          <dl className="space-y-6">
            <div className="flex justify-between border-b border-ink/10 pb-4">
              <dt className="text-ink/50 text-sm">Date</dt>
              <dd className="font-semibold text-ink text-right">Saturday, December 12, 2026</dd>
            </div>
            <div className="flex justify-between border-b border-ink/10 pb-4">
              <dt className="text-ink/50 text-sm">Time</dt>
              <dd className="font-semibold text-ink text-right">10:00 AM &ndash; 5:00 PM</dd>
            </div>
            <div className="flex justify-between border-b border-ink/10 pb-4">
              <dt className="text-ink/50 text-sm">Venue</dt>
              <dd className="font-semibold text-ink text-right">ThinkUp Innovation Hub</dd>
            </div>
            <div className="pb-2">
              <dt className="text-ink/50 text-sm mb-1">Address</dt>
              <dd className="text-ink text-sm leading-relaxed">{VENUE_ADDRESS}</dd>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 text-sm font-semibold text-signal hover:underline focus-ring"
              >
                Open in Google Maps
              </a>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-7 h-80 lg:h-auto border border-ink/10">
          <iframe
            title="Event location map"
            className="w-full h-full grayscale-[20%]"
            loading="lazy"
            src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
          />
        </div>
      </div>
    </section>
  );
}
