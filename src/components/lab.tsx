"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AskLab } from "./ask-lab";
import { DecisionLab } from "./decision-lab";
import { SectionHeading } from "./ui";

const tabs = [
  { id: "ask", label: "Ask my portfolio", sub: "Hybrid retrieval + refusal gate" },
  { id: "decide", label: "Pick a threshold", sub: "Credit-risk decision rules" },
] as const;

export function Lab() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("ask");
  return (
    <section id="lab" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24" aria-labelledby="lab-title">
      <SectionHeading
        id="lab-title"
        index="02"
        kicker="Interactive lab"
        title={
          <>
            Don’t take my word for it. <span className="font-serif font-normal italic text-accent">Try it.</span>
          </>
        }
        lead="Two ideas from my projects, running live on this page. The first is a hybrid retriever over everything on this site, with a refusal gate, written from scratch in TypeScript. The second uses the real decision-rule results from my credit-risk model."
      />

      <div role="tablist" aria-label="Lab demos" className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`relative rounded-xl border px-4 py-2.5 text-left transition-colors ${
              tab === t.id ? "border-line-strong text-fg" : "border-line text-muted hover:text-fg"
            }`}
          >
            {tab === t.id && <motion.span layoutId="lab-tab" className="absolute inset-0 -z-10 rounded-xl bg-surface-strong" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="block text-sm font-medium">{t.label}</span>
            <span className="block font-mono text-[10.5px] text-faint">{t.sub}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "ask" ? <AskLab /> : <DecisionLab />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
