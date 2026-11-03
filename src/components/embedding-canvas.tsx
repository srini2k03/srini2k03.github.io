"use client";

import { useEffect, useRef } from "react";

/**
 * Hero background: a slowly rotating 3D "embedding space" of clustered points.
 * A query vector (the pointer, or a drifting path on touch devices) retrieves its
 * k nearest neighbours each frame, drawn as similarity-weighted links.
 * Canvas 2D, no WebGL dependency; pauses off-screen and respects reduced motion.
 */

type RGB = [number, number, number];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number) {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function hexToRgb(hex: string, fallback: RGB): RGB {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m?.[1]) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

interface Pt {
  x: number;
  y: number;
  z: number;
  c: number;
  phase: number;
  sx: number;
  sy: number;
  depth: number;
}

export function EmbeddingCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = mulberry32(20250601);
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let visible = true;
    let t = 0;

    let colors = { fg: [238, 241, 245] as RGB, accent: [94, 234, 168] as RGB, hues: [] as RGB[] };
    let mono = "ui-monospace, monospace";
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      mono = cs.getPropertyValue("--font-geist-mono").trim() || mono;
      colors = {
        fg: hexToRgb(cs.getPropertyValue("--fg"), [238, 241, 245]),
        accent: hexToRgb(cs.getPropertyValue("--accent"), [94, 234, 168]),
        hues: ["--accent", "--blue", "--violet", "--amber", "--rose", "--blue"].map((v) => hexToRgb(cs.getPropertyValue(v), [127, 166, 255])),
      };
    };
    readColors();

    // Six clusters ~ six topics; points sampled around each centre.
    const centres = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + 0.4;
      return { x: Math.cos(a) * 0.62, y: (rand() - 0.5) * 0.7, z: Math.sin(a) * 0.62 };
    });
    let points: Pt[] = [];
    let edges: Array<[number, number]> = [];

    const build = () => {
      const n = w < 640 ? 90 : 170;
      points = Array.from({ length: n }, (_, i) => {
        const c = i % centres.length;
        const ctr = centres[c]!;
        return {
          x: ctr.x + gauss(rand) * 0.15,
          y: ctr.y + gauss(rand) * 0.15,
          z: ctr.z + gauss(rand) * 0.15,
          c,
          phase: rand() * Math.PI * 2,
          sx: 0,
          sy: 0,
          depth: 0,
        };
      });
      // Static constellation: link each point to its 2 nearest same-cluster neighbours.
      edges = [];
      points.forEach((p, i) => {
        const near = points
          .map((q, j) => ({ j, d: j === i || q.c !== p.c ? Infinity : (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2 }))
          .sort((a, b) => a.d - b.d)
          .slice(0, 2);
        for (const { j } of near) if (i < j) edges.push([i, j]);
      });
    };

    const resize = () => {
      const r = host.getBoundingClientRect();
      w = r.width;
      h = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!points.length || (w < 640) !== points.length < 100) build();
    };

    const pointer = { x: 0, y: 0, active: false };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = host.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    };
    const onLeave = () => (pointer.active = false);
    const query = { x: 0, y: 0 };

    const frame = () => {
      if (!running) return;
      t += reduced ? 0 : 1 / 60;
      ctx.clearRect(0, 0, w, h);

      const theta = t * 0.08;
      const tilt = 0.35;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const cosX = Math.cos(tilt);
      const sinX = Math.sin(tilt);
      const scale = Math.min(w * 0.75, h * 1.1) * (w < 768 ? 0.55 : 0.4);
      const cx = w * (w < 768 ? 0.5 : 0.72);
      const cy = h * (w < 768 ? 0.42 : 0.46);

      for (const p of points) {
        const dx = Math.sin(t * 0.6 + p.phase) * 0.012;
        const dy = Math.cos(t * 0.5 + p.phase) * 0.012;
        const x = p.x + dx;
        const y = p.y + dy;
        const xr = x * cosT - p.z * sinT;
        const zr = x * sinT + p.z * cosT;
        const yr = y * cosX - zr * sinX;
        const zr2 = y * sinX + zr * cosX;
        const persp = 2.4 / (2.4 + zr2);
        p.sx = cx + xr * scale * persp;
        p.sy = cy + yr * scale * persp;
        p.depth = (1 - zr2) / 2; // ~0 far, ~1 near
      }

      // Query vector: pointer if present, otherwise a slow Lissajous drift.
      const tx = pointer.active ? pointer.x : cx + Math.sin(t * 0.37) * scale * 0.7;
      const ty = pointer.active ? pointer.y : cy + Math.sin(t * 0.23 + 1.2) * scale * 0.45;
      query.x += (tx - query.x) * (reduced ? 1 : 0.08);
      query.y += (ty - query.y) * (reduced ? 1 : 0.08);

      // Constellation edges
      ctx.lineWidth = 1;
      for (const [i, j] of edges) {
        const a = points[i]!;
        const b = points[j]!;
        ctx.strokeStyle = rgba(colors.fg, 0.05 + 0.07 * Math.min(a.depth, b.depth));
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();
      }

      // k-NN retrieval in screen space
      const K = 6;
      const ranked = points
        .map((p, i) => ({ i, d: Math.hypot(p.sx - query.x, p.sy - query.y) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, K);
      const maxD = Math.hypot(w, h) * 0.5;
      const hit = new Set(ranked.map((r) => r.i));

      ranked.forEach((r, rank) => {
        const p = points[r.i]!;
        const alpha = 0.55 * (1 - rank / K) + 0.1;
        const grad = ctx.createLinearGradient(query.x, query.y, p.sx, p.sy);
        grad.addColorStop(0, rgba(colors.accent, alpha));
        grad.addColorStop(1, rgba(colors.accent, alpha * 0.25));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(query.x, query.y);
        ctx.lineTo(p.sx, p.sy);
        ctx.stroke();
      });

      // Points
      points.forEach((p, i) => {
        const isHit = hit.has(i);
        const hue = colors.hues[p.c] ?? colors.accent;
        const r = (isHit ? 2.6 : 1) + p.depth * 1.6;
        ctx.fillStyle = isHit ? rgba(colors.accent, 0.95) : rgba(hue, 0.18 + p.depth * 0.42);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fill();
        if (isHit) {
          ctx.strokeStyle = rgba(colors.accent, 0.25);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, r + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Similarity labels on the top 3
      if (w >= 640) {
        ctx.font = `10px ${mono}`;
        ctx.fillStyle = rgba(colors.fg, 0.55);
        ranked.slice(0, 3).forEach((r) => {
          const p = points[r.i]!;
          const sim = Math.max(0, 1 - r.d / maxD);
          ctx.fillText(sim.toFixed(2), p.sx + 8, p.sy - 6);
        });
      }

      // Query marker
      const pulse = reduced ? 0 : (Math.sin(t * 3) + 1) / 2;
      ctx.strokeStyle = rgba(colors.accent, 0.9);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(query.x, query.y, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = rgba(colors.accent, 0.25 * (1 - pulse));
      ctx.beginPath();
      ctx.arc(query.x, query.y, 8 + pulse * 14, 0, Math.PI * 2);
      ctx.stroke();
      if (w >= 640) {
        ctx.fillStyle = rgba(colors.accent, 0.9);
        ctx.fillText("query", query.x + 10, query.y + 16);
      }

      if (!reduced && visible) raf = requestAnimationFrame(frame);
    };

    resize();
    query.x = w * 0.72;
    query.y = h * 0.5;

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) frame();
    });
    ro.observe(host);

    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = !!entry?.isIntersecting;
      if (visible && !was && !reduced) raf = requestAnimationFrame(frame);
    });
    io.observe(host);

    const onVis = () => {
      running = !document.hidden;
      if (running && visible && !reduced) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);

    const mo = new MutationObserver(() => {
      readColors();
      if (reduced) frame();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`} />;
}
