import type { Status } from "@/content/projects";
import { Reveal, Scramble } from "./motion-primitives";

export function SectionHeading({
  index,
  kicker,
  title,
  lead,
  id,
}: {
  index: string;
  kicker: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-12 max-w-3xl md:mb-16">
      <Reveal>
        <p className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span className="text-accent">{index}</span>
          <span className="h-px w-8 bg-line-strong" />
          <Scramble text={kicker} />
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 id={id} className="text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-fg sm:text-5xl">
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">{lead}</p>
        </Reveal>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const tone =
    status.tone === "live"
      ? "border-live/30 bg-live/10 text-live"
      : status.tone === "pending"
        ? "border-pending/30 bg-pending/10 text-pending"
        : "border-line-strong bg-surface text-fg-soft";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] tracking-wide ${tone}`}>
      <span
        aria-hidden
        className={`size-1.5 rounded-full ${status.tone === "live" ? "pulse-dot bg-live" : status.tone === "pending" ? "bg-pending" : "bg-faint"}`}
      />
      {status.tone === "pending" && <span className="sr-only">Pending: </span>}
      {status.label}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-[11px] text-fg-soft">{children}</span>;
}

export const accentVar: Record<string, string> = {
  green: "var(--accent)",
  blue: "var(--blue)",
  amber: "var(--amber)",
  violet: "var(--violet)",
  rose: "var(--rose)",
};
