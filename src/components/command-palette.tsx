"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useUi } from "./providers";
import { sections } from "./nav";
import { featuredProjects } from "@/content/projects";
import { profile } from "@/content/profile";
import { resumePdf } from "@/lib/site";
import { ArrowRight, Search } from "./icons";

interface Item {
  id: string;
  group: string;
  label: string;
  hint?: string;
  run: () => void;
}

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, toggleTheme } = useUi();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: Item[] = useMemo(() => {
    const go = (hash: string) => () => {
      if (pathname === "/") document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      else router.push(`/#${hash}`);
    };
    return [
      ...sections.map((s) => ({ id: `s-${s.id}`, group: "Jump to", label: s.label, run: go(s.id) })),
      ...featuredProjects.map((p) => ({ id: `p-${p.slug}`, group: "Case studies", label: p.title, hint: String(p.year), run: () => router.push(`/projects/${p.slug}/`) })),
      { id: "ask", group: "Try", label: "Ask my portfolio (in-browser hybrid retrieval)", run: go("lab") },
      {
        id: "copy-email",
        group: "Actions",
        label: `Copy email: ${profile.email}`,
        run: () => {
          navigator.clipboard?.writeText(profile.email).then(() => setToast("Email copied"), () => setToast("Copy failed: select it manually"));
        },
      },
      { id: "resume", group: "Actions", label: "Download résumé (PDF)", run: () => (window.location.href = resumePdf) },
      { id: "github", group: "Actions", label: "Open GitHub profile", hint: "github.com/srini2k03", run: () => window.open(profile.github, "_blank", "noopener") },
      { id: "theme", group: "Actions", label: "Toggle light / dark theme", run: toggleTheme },
    ];
  }, [pathname, router, toggleTheme]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((i) => `${i.group} ${i.label} ${i.hint ?? ""}`.toLowerCase().includes(needle));
  }, [items, q]);

  useEffect(() => {
    if (!paletteOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [paletteOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const close = () => {
    setPaletteOpen(false);
    setQ("");
    setIdx(0);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const item = filtered[idx];
      if (item) {
        close();
        item.run();
      }
    }
  };

  let lastGroup = "";

  return (
    <>
      <AnimatePresence>
        {paletteOpen && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 px-4 pt-[14vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => e.target === e.currentTarget && close()}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-line-strong bg-elev shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
              onKeyDown={onKeyDown}
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                <Search className="text-muted" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setIdx(0);
                  }}
                  placeholder="Jump to a section, open a case study, copy my email…"
                  className="h-14 w-full bg-transparent text-[15px] text-fg outline-none placeholder:text-faint"
                  aria-label="Search commands"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="palette-list"
                  aria-activedescendant={filtered[idx]?.id}
                />
                <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint">ESC</kbd>
              </div>
              <ul id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
                {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No matches</li>}
                {filtered.map((item, i) => {
                  const showGroup = item.group !== lastGroup;
                  lastGroup = item.group;
                  return (
                    <li key={item.id} role="presentation">
                      {showGroup && <div className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">{item.group}</div>}
                      <button
                        id={item.id}
                        role="option"
                        aria-selected={i === idx}
                        onMouseEnter={() => setIdx(i)}
                        onClick={() => {
                          close();
                          item.run();
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          i === idx ? "bg-surface-strong text-fg" : "text-fg-soft"
                        }`}
                      >
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.hint && <span className="font-mono text-[11px] text-faint">{item.hint}</span>}
                        <ArrowRight className={i === idx ? "text-accent" : "opacity-0"} width={14} height={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-center gap-4 border-t border-line px-4 py-2 font-mono text-[10px] text-faint">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
                <span className="ml-auto">⌘K / Ctrl+K anywhere</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full border border-line-strong bg-elev px-4 py-2 text-sm text-fg shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
