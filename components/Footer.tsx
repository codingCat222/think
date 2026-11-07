import Logo from "./Logo";
import { NAV_LINKS } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/15 mt-12 lg:mt-16 py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex flex-col sm:flex-row justify-between gap-10">
          <div>
            <Logo dark />
            <p className="mt-4 text-sm text-white/50 max-w-xs">
              Empowering innovative minds, starting young.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/60">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-white transition-colors focus-ring">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4 text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} ThinkUp Innovation Services. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms &amp; Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
