"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Stage } from "@/content/projects";

/** Compact pipeline: stages light up in sequence, like a request moving through the system. */
export function PipelineStrip({ stages, color = "var(--accent)" }: { stages: Stage[]; color?: string }) {
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const reduced = useReducedMotion();
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!inView || reduced) return;
    const id = setInterval(() => setActive((a) => (a + 1) % (stages.length + 2)), 700);
    return () => clearInterval(id);
  }, [inView, reduced, stages.length]);

  return (
    <ol ref={ref} className="flex flex-wrap items-center gap-y-2" aria-label="Pipeline stages">
      {stages.map((s, i) => {
        const on = i === active;
        const done = i < active;
        return (
          <li key={s.name} className="flex items-center" title={s.detail}>
            <span
              className="rounded-md border px-2 py-1 font-mono text-[10.5px] transition-all duration-300"
              style={{
                borderColor: on ? color : "var(--border)",
                color: on || done ? "var(--fg)" : "var(--muted)",
                background: on ? `color-mix(in srgb, ${color} 14%, transparent)` : "transparent",
                boxShadow: on ? `0 0 18px -4px ${color}` : "none",
              }}
            >
              {s.name}
            </span>
            {i < stages.length - 1 && (
              <span aria-hidden className="mx-1 text-[10px] transition-colors duration-300" style={{ color: done ? color : "var(--faint)" }}>
                →
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Full vertical pipeline for case-study pages; the rail fills as you scroll. */
export function PipelineTimeline({ stages, color = "var(--accent)" }: { stages: Stage[]; color?: string }) {
  return (
    <ol className="relative ml-3 border-l border-line">
      {stages.map((s, i) => (
        <motion.li
          key={s.name}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
          className="relative pb-8 pl-8 last:pb-0"
        >
          <motion.span
            aria-hidden
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.04 * i + 0.1 }}
            className="absolute -left-[7px] top-1 size-3.5 rounded-full border-2 bg-bg"
            style={{ borderColor: color }}
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Stage {String(i + 1).padStart(2, "0")}</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-fg">{s.name}</h3>
          <p className="mt-1 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted">{s.detail}</p>
        </motion.li>
      ))}
    </ol>
  );
}
