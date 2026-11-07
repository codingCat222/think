"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { NAV_LINKS } from "@/lib/content";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="#home" className="focus-ring">
          <Logo />
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-ink/70 hover:text-ink transition-colors focus-ring"
            >
              <span className="text-signal font-mono text-[11px] mr-1.5 align-middle">
                {String(i + 1).padStart(2, "0")}
              </span>
              {l.label}
            </a>
          ))}
          <a
            href="#register"
            className="bg-ink hover:bg-signal text-white text-sm font-semibold px-5 py-2.5 transition-colors focus-ring"
          >
            Register now
          </a>
        </nav>

        <button
          className="lg:hidden text-ink focus-ring"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-ink/10 px-5 py-5 flex flex-col gap-4 bg-white">
          {NAV_LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-ink/80 focus-ring"
            >
              <span className="text-signal font-mono text-xs mr-2">
                {String(i + 1).padStart(2, "0")}
              </span>
              {l.label}
            </a>
          ))}
          <a
            href="#register"
            onClick={() => setOpen(false)}
            className="bg-signal text-white font-semibold px-5 py-3 text-center focus-ring"
          >
            Register now
          </a>
        </div>
      )}
    </header>
  );
}
