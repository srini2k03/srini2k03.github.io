"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { useUi } from "./providers";
import { Close, Command, FileText, Menu, Moon, Sun } from "./icons";
import { resumePdf } from "@/lib/site";

export const sections = [
  { id: "work", label: "Work" },
  { id: "lab", label: "Lab" },
  { id: "principles", label: "Approach" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [enabled]);
  return enabled ? active : null;
}

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const active = useActiveSection(isHome);
  const { theme, toggleTheme, setPaletteOpen } = useUi();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 480 && y > prev && !menuOpen);
  });

  const href = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -96 : 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4"
      >
        <nav
          aria-label="Primary"
          className={`flex w-full max-w-5xl items-center gap-2 rounded-2xl border px-2 py-2 transition-colors duration-300 ${
            scrolled ? "border-line bg-elev/75 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl" : "border-transparent bg-transparent"
          }`}
        >
          <Link href="/" className="group flex items-center gap-2 rounded-xl px-2 py-1.5" aria-label="Home">
            <span className="grid size-8 place-items-center rounded-lg bg-fg font-mono text-[13px] font-semibold text-bg transition-transform duration-300 group-hover:rotate-[-8deg]">
              SB
            </span>
            <span className="hidden text-sm font-medium tracking-tight text-fg sm:block">Srinivasan B.</span>
          </Link>

          <ul className="mx-auto hidden items-center gap-0.5 md:flex">
            {sections.map((s) => (
              <li key={s.id} className="relative">
                <Link
                  href={href(s.id)}
                  className={`relative z-10 block rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                    active === s.id ? "text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {s.label}
                </Link>
                {active === s.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-surface-strong"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-line-strong hover:text-fg sm:flex"
              aria-label="Open command palette"
            >
              <Command width={12} height={12} /> K
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-strong hover:text-fg"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? <Sun /> : <Moon />}
                </motion.span>
              </AnimatePresence>
            </button>
            <a
              href={resumePdf}
              className="hidden items-center gap-1.5 rounded-lg bg-fg px-3 py-1.5 text-[13px] font-medium text-bg transition-transform hover:-translate-y-px sm:flex"
            >
              <FileText width={14} height={14} /> Résumé
            </a>
            <button
              type="button"
              className="grid size-9 place-items-center rounded-lg text-fg md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <Close width={18} height={18} /> : <Menu width={18} height={18} />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-3 top-[4.5rem] z-40 rounded-2xl border border-line bg-elev/95 p-2 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <ul className="grid">
              {sections.map((s, i) => (
                <motion.li key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link href={href(s.id)} onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-3 text-base text-fg hover:bg-surface-strong">
                    {s.label}
                  </Link>
                </motion.li>
              ))}
              <li className="mt-1 border-t border-line pt-2">
                <a href={resumePdf} className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-accent">
                  <FileText /> Download résumé (PDF)
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
