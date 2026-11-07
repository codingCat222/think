import { Phone, MessageCircle, Instagram } from "lucide-react";
import { PHONE_1, WHATSAPP_LINK, INSTAGRAM_LINK, TIKTOK_LINK, SOCIAL_HANDLE } from "@/lib/content";

export default function Contact() {
  return (
    <section id="contact" className="py-24 lg:py-32 my-10 lg:my-16 bg-ink text-white border-y border-white/10">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 py-2">
            <p className="text-xs font-mono text-signal mb-4">CONTACT</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
              Talk to us.
            </h2>
          </div>

          <div className="lg:col-span-7">
            <div className="divide-y divide-white/10 border-y border-white/10">
              <a
                href={`tel:${PHONE_1.replace(/\s/g, "")}`}
                className="flex items-center justify-between py-5 group focus-ring"
              >
                <span className="flex items-center gap-3 text-lg">
                  <Phone className="w-4 h-4 text-signal" /> {PHONE_1}
                </span>
                <span className="text-xs text-white/40 group-hover:text-white transition-colors">CALL</span>
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between py-5 group focus-ring"
              >
                <span className="flex items-center gap-3 text-lg">
                  <MessageCircle className="w-4 h-4 text-signal" /> WhatsApp
                </span>
                <span className="text-xs text-white/40 group-hover:text-white transition-colors">CHAT</span>
              </a>
              <a
                href={INSTAGRAM_LINK}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between py-5 group focus-ring"
              >
                <span className="flex items-center gap-3 text-lg">
                  <Instagram className="w-4 h-4 text-signal" /> Instagram (@{SOCIAL_HANDLE})
                </span>
                <span className="text-xs text-white/40 group-hover:text-white transition-colors">FOLLOW</span>
              </a>
              <a
                href={TIKTOK_LINK}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between py-5 group focus-ring"
              >
                <span className="text-lg">TikTok (@{SOCIAL_HANDLE})</span>
                <span className="text-xs text-white/40 group-hover:text-white transition-colors">FOLLOW</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
