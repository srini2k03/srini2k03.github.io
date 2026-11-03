"use client";

import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

interface UiState {
  theme: Theme;
  toggleTheme: () => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
}

const UiContext = createContext<UiState | null>(null);

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside <Providers>");
  return ctx;
}

function subscribeTheme(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}
const readTheme = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

/** Theme as an external store: the <html data-theme> attribute is the source of truth. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, readTheme, () => "dark");
}

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const toggleTheme = useCallback(() => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable: the choice lasts for this page view */
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme, paletteOpen, setPaletteOpen }), [theme, toggleTheme, paletteOpen]);

  return (
    <UiContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </UiContext.Provider>
  );
}
