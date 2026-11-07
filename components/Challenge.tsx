export default function Challenge() {
  return (
    <section id="challenge" className="py-20 lg:py-28 bg-ink text-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <p className="text-xs font-mono text-signal mb-4">THE CHALLENGE</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
              A stage for young innovators.
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <p className="text-white/70 leading-relaxed text-lg">
              The Happy December Best Kids&rsquo; Apps Challenge invites
              children and teens to build an app that solves a real
              problem and present it live on stage to a room that&rsquo;s
              cheering them on.
            </p>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6 pt-4">
              <div>
                <p className="font-display text-xl italic text-signal mb-1">Who can join</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Children and teens aged 2&ndash;19, grouped into four
                  categories &mdash; see Age Categories below.
                </p>
              </div>
              <div>
                <p className="font-display text-xl italic text-signal mb-1">Present live</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Participants build their apps and showcase them live on
                  stage in front of judges and a cheering audience.
                </p>
              </div>
              <div>
                <p className="font-display text-xl italic text-signal mb-1">Why join in</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Prizes, play, and a festive atmosphere that builds
                  confidence and a love for building things.
                </p>
              </div>
              <div>
                <p className="font-display text-xl italic text-signal mb-1">What it costs</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Registration ranges from ₦10,000 to ₦25,000 by age group.
                  Limited slots available &mdash; register early to secure a spot.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
