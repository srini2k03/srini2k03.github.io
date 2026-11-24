"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export function ChartCard({
  title,
  subtitle,
  source,
  children,
  table,
}: {
  title: string;
  subtitle?: string;
  source: string;
  children: React.ReactNode;
  table?: { head: string[]; rows: (string | number)[][] };
}) {
  return (
    <figure className="min-w-0 rounded-2xl border border-line bg-[var(--chart-surface)] p-5 sm:p-6">
      <figcaption className="mb-5">
        <p className="text-[15px] font-semibold text-fg">{title}</p>
        {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
      </figcaption>
      {children}
      <div className="mt-5 flex flex-wrap items-start justify-between gap-3 border-t border-line pt-3">
        <p className="font-mono text-[10.5px] leading-snug text-faint">Source: {source}</p>
        {table && (
          <details className="w-full text-[12px] text-muted sm:w-auto">
            <summary className="cursor-pointer select-none text-right text-fg-soft">View as table</summary>
            <table className="mt-2 w-full text-left tabular">
              <thead className="text-faint">
                <tr>
                  {table.head.map((h) => (
                    <th key={h} className="py-1 pr-3 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono text-fg-soft">
                {table.rows.map((r, i) => (
                  <tr key={i} className="border-t border-line">
                    {r.map((c, j) => (
                      <td key={j} className="py-1 pr-3">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        )}
      </div>
    </figure>
  );
}

/** Horizontal bars, single series. Baseline rows use the muted colour. Value at the bar tip. */
export function BarList({
  data,
  format,
  max,
  color = "var(--series-1)",
}: {
  data: { label: string; value: number; baseline?: boolean }[];
  format: (v: number) => string;
  max?: number;
  color?: string;
}) {
  const top = max ?? Math.max(...data.map((d) => d.value));
  const [hover, setHover] = useState<number | null>(null);
  return (
    <ul className="grid gap-1.5" role="list">
      {data.map((d, i) => (
        <li
          key={d.label}
          className="grid grid-cols-[minmax(7rem,38%)_1fr] items-center gap-3 rounded-md py-0.5 text-[12.5px]"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <span className={`truncate text-right ${hover === i ? "text-fg" : "text-fg-soft"}`} title={d.label}>
            {d.label}
          </span>
          <span className="flex items-center gap-2">
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: `${(d.value / top) * 82}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.04, ease }}
              className="block h-[18px] rounded-r-[4px]"
              style={{ background: d.baseline ? "var(--series-muted)" : color, opacity: hover === null || hover === i ? 1 : 0.55 }}
            />
            <span className="font-mono text-[11.5px] text-fg tabular">{format(d.value)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Two-series paired bars with legend (customer share vs revenue share). */
export function PairedBars({
  data,
  aLabel,
  bLabel,
  format,
}: {
  data: { label: string; a: number; b: number }[];
  aLabel: string;
  bLabel: string;
  format: (v: number) => string;
}) {
  const top = Math.max(...data.flatMap((d) => [d.a, d.b]));
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-[12px] text-fg-soft">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[var(--series-1)]" /> {aLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[var(--series-2)]" /> {bLabel}
        </span>
      </div>
      <ul className="grid gap-3">
        {data.map((d, i) => (
          <li key={d.label} className="grid grid-cols-[minmax(7rem,36%)_1fr] items-center gap-3 text-[12.5px]">
            <span className="text-right leading-tight text-fg-soft">{d.label}</span>
            <span className="grid gap-[2px]">
              {[
                { v: d.a, c: "var(--series-1)", n: aLabel },
                { v: d.b, c: "var(--series-2)", n: bLabel },
              ].map((bar) => (
                <span key={bar.n} className="flex items-center gap-2" title={`${d.label} · ${bar.n}: ${format(bar.v)}`}>
                  <motion.span
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(bar.v / top) * 80}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.06, ease }}
                    className="block h-3.5 rounded-r-[4px]"
                    style={{ background: bar.c }}
                  />
                  <span className="font-mono text-[11px] text-fg-soft tabular">{format(bar.v)}</span>
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Line chart on a log-x axis with a reference line and hover crosshair. */
export function LogLine({
  data,
  refY,
  refLabel,
  xLabel,
  format,
}: {
  data: { x: number; y: number }[];
  refY: number;
  refLabel: string;
  xLabel: string;
  format: (v: number) => string;
}) {
  const W = 560;
  const H = 240;
  const pad = { l: 44, r: 56, t: 16, b: 34 };
  const xs = data.map((d) => Math.log10(d.x));
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const yMax = Math.ceil((Math.max(...data.map((d) => d.y)) * 1.1) / 0.05) * 0.05;
  const sx = (x: number) => pad.l + ((Math.log10(x) - x0) / (x1 - x0)) * (W - pad.l - pad.r);
  const sy = (y: number) => H - pad.b - (y / yMax) * (H - pad.t - pad.b);
  const path = data.map((d, i) => `${i ? "L" : "M"}${sx(d.x)},${sy(d.y)}`).join(" ");
  const area = `${path} L${sx(data[data.length - 1]!.x)},${sy(0)} L${sx(data[0]!.x)},${sy(0)} Z`;
  const ticks = Array.from({ length: Math.round(yMax / 0.05) + 1 }, (_, i) => i * 0.05);
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    data.forEach((d, i) => {
      if (Math.abs(sx(d.x) - px) < Math.abs(sx(data[best]!.x) - px)) best = i;
    });
    setHover(best);
  };
  const h = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${xLabel} line chart`} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} stroke="var(--chart-grid)" strokeWidth={1} />
            <text x={pad.l - 8} y={sy(t) + 3.5} textAnchor="end" fontSize={10} fill="var(--muted)" className="tabular">
              {Math.round(t * 100)}%
            </text>
          </g>
        ))}
        {data.map((d) => (
          <text key={d.x} x={sx(d.x)} y={H - pad.b + 16} textAnchor="middle" fontSize={10} fill="var(--muted)">
            {d.x}
          </text>
        ))}
        <text x={(W - pad.r + pad.l) / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="var(--faint)">
          {xLabel}
        </text>
        <line x1={pad.l} x2={W - pad.r} y1={sy(refY)} y2={sy(refY)} stroke="var(--fg)" strokeOpacity={0.5} strokeWidth={1} />
        <text x={W - pad.r + 6} y={sy(refY) + 3.5} fontSize={10} fill="var(--fg-soft)">
          {refLabel}
        </text>
        <motion.path d={area} fill="var(--series-2)" initial={{ opacity: 0 }} whileInView={{ opacity: 0.1 }} viewport={{ once: true }} transition={{ duration: 1 }} />
        <motion.path
          d={path}
          fill="none"
          stroke="var(--series-2)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease }}
        />
        {data.map((d, i) => (
          <circle key={d.x} cx={sx(d.x)} cy={sy(d.y)} r={hover === i ? 5.5 : 4} fill="var(--series-2)" stroke="var(--chart-surface)" strokeWidth={2} />
        ))}
        <text x={sx(data[data.length - 1]!.x) + 8} y={sy(data[data.length - 1]!.y) + 4} fontSize={11} fill="var(--fg)" className="tabular">
          {format(data[data.length - 1]!.y)}
        </text>
        {h && <line x1={sx(h.x)} x2={sx(h.x)} y1={pad.t} y2={H - pad.b} stroke="var(--fg)" strokeOpacity={0.25} strokeWidth={1} />}
      </svg>
      {h && hover !== null && (
        <div className="viz-tip" style={{ left: `${(sx(h.x) / W) * 100}%`, top: 0, transform: "translate(-50%, -110%)" }}>
          <span className="text-muted">{h.x} looks · </span>
          <span className="font-mono">{format(h.y)}</span> false-positive rate
        </div>
      )}
    </div>
  );
}

/** Heatmap of the 36-config retrieval ablation: one cell per (mode, chunker, size), shaded by nDCG@10. */
export function AblationGrid({
  data,
}: {
  data: readonly { chunker: string; size: number; mode: string; ndcg10: number; docRecall5: number }[];
}) {
  const modes = [
    { key: "bm25", label: "bm25" },
    { key: "dense", label: "dense" },
    { key: "hybrid", label: "hybrid" },
    { key: "hybrid_rerank", label: "hybrid+rerank" },
  ];
  const chunkers = ["fixed", "semantic", "section"];
  const sizes = [256, 512, 1024];
  const values = data.map((d) => d.ndcg10);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const cell = (m: string, c: string, s: number) => data.find((d) => d.mode === m && d.chunker === c && d.size === s);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[460px] border-separate border-spacing-[3px] text-[11px]">
        <thead>
          <tr>
            <th />
            {chunkers.map((c) => (
              <th key={c} colSpan={3} className="pb-1 text-center font-mono font-normal text-muted">
                {c}
              </th>
            ))}
          </tr>
          <tr>
            <th />
            {chunkers.flatMap((c) =>
              sizes.map((s) => (
                <th key={`${c}${s}`} className="text-center font-mono text-[10px] font-normal text-faint">
                  {s}
                </th>
              )),
            )}
          </tr>
        </thead>
        <tbody>
          {modes.map((m, mi) => (
            <tr key={m.key}>
              <th className="whitespace-nowrap pr-2 text-right font-mono font-normal text-fg-soft">{m.label}</th>
              {chunkers.flatMap((c, ci) =>
                sizes.map((s, si) => {
                  const d = cell(m.key, c, s);
                  const i = mi * 9 + ci * 3 + si;
                  if (!d) return <td key={`${c}${s}`} />;
                  const t = hi > lo ? (d.ndcg10 - lo) / (hi - lo) : 1;
                  const best = d.ndcg10 === hi;
                  return (
                    <td key={`${c}${s}`} className="p-0">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.02, type: "spring", stiffness: 400, damping: 24 }}
                        className={`flex h-7 items-center justify-center rounded-[4px] font-mono text-[10px] tabular ${best ? "font-semibold text-fg ring-2 ring-[var(--accent)]" : "text-fg-soft"}`}
                        style={{ background: `color-mix(in oklab, var(--series-1) ${Math.round(12 + t * 70)}%, transparent)` }}
                        title={`${m.label} · ${c} · ${s} tokens: nDCG@10 ${d.ndcg10.toFixed(3)}, doc Recall@5 ${d.docRecall5.toFixed(3)}`}
                      >
                        {d.ndcg10.toFixed(2)}
                      </motion.span>
                    </td>
                  );
                }),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
