import { experience, principles, profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { skillGroups } from "@/content/skills";
import type { Doc } from "./retrievers";

export interface CorpusDoc extends Doc {
  /** Source group used for citations and for evaluation (e.g. a project slug). */
  source: string;
  sourceLabel: string;
  href: string;
}

/** Builds the retrieval corpus from the same typed content that renders the site. */
export function buildCorpus(): CorpusDoc[] {
  const docs: CorpusDoc[] = [];

  for (const p of projects) {
    const base = { source: p.slug, sourceLabel: p.short, href: p.featured ? `/projects/${p.slug}/` : `/#more-projects` };
    docs.push({ ...base, id: `${p.slug}:overview`, title: p.title, text: `${p.tagline} ${p.problem}`, keywords: `${p.category} ${p.skills.join(" ")}` });
    p.highlights.forEach((h, i) => docs.push({ ...base, id: `${p.slug}:hl${i}`, title: `${p.short}: what I built (${i + 1}/${p.highlights.length})`, text: h, keywords: p.short }));
    p.decisions.forEach((d, i) => docs.push({ ...base, id: `${p.slug}:dec${i}`, title: `${p.short}: ${d.title}`, text: d.body, keywords: p.short }));
    if (p.pipeline.length) {
      docs.push({
        ...base,
        id: `${p.slug}:pipeline`,
        title: `${p.short}: pipeline`,
        text: p.pipeline.map((s) => `${s.name}: ${s.detail}.`).join(" "),
        keywords: "pipeline architecture stages",
      });
    }
    if (p.engineering.length) {
      docs.push({
        ...base,
        id: `${p.slug}:eng`,
        title: `${p.short}: engineering`,
        text: p.engineering.map((e) => `${e.label}: ${e.value}.`).join(" "),
        keywords: "tests ci cd testing engineering quality",
      });
    }
    if (p.honesty) docs.push({ ...base, id: `${p.slug}:status`, title: `${p.short}: current status`, text: p.honesty, keywords: "status pending progress" });
  }

  for (const e of experience) {
    e.points.forEach((pt, i) =>
      docs.push({
        id: `exp:${i}`,
        source: "experience",
        sourceLabel: `${e.company} internship`,
        href: "/#experience",
        title: `${e.role} at ${e.company} (${e.period})`,
        text: pt,
        keywords: `internship intern experience job ${e.company} ${e.stack.join(" ")}`,
      }),
    );
  }

  const ed = profile.education;
  docs.push({
    id: "edu",
    source: "education",
    sourceLabel: "Education",
    href: "/#experience",
    title: `${ed.degree}, ${ed.school}`,
    text: `${ed.degree} at ${ed.school}, ${ed.location}, ${ed.period}, ${ed.grade}. Graduated 2025.`,
    keywords: "education degree college university graduate cgpa gpa bms bmsce",
  });
  docs.push({
    id: "certs",
    source: "education",
    sourceLabel: "Certifications",
    href: "/#experience",
    title: "Certifications",
    text: profile.certifications.map((c) => `${c.name} (${c.issuer})`).join("; "),
    keywords: "certification certificate course coursera",
  });

  profile.about.forEach((t, i) =>
    docs.push({ id: `about:${i}`, source: "about", sourceLabel: "About", href: "/#about", title: "How I approach ML engineering", text: t, keywords: "about approach philosophy" }),
  );
  docs.push({
    id: "contact",
    source: "about",
    sourceLabel: "Contact",
    href: "/#contact",
    title: "Contact and availability",
    text: `Based in ${profile.location}. Looking for ${profile.roles.join(", ")} roles. Email ${profile.email}, phone ${profile.phone}, GitHub ${profile.githubHandle}.`,
    keywords: "contact email phone hire hiring available location roles github reach",
  });

  for (const pr of principles) {
    docs.push({
      id: `principle:${pr.id}`,
      source: "principles",
      sourceLabel: "How I work",
      href: "/#principles",
      title: pr.title,
      text: `${pr.body} ${pr.evidence.map((e) => e.text).join(". ")}.`,
      keywords: "principle approach",
    });
  }

  for (const g of skillGroups) {
    docs.push({
      id: `skills:${g.name}`,
      source: "skills",
      sourceLabel: "Skills",
      href: "/#skills",
      title: `Skills: ${g.name}`,
      text: g.skills.join(", "),
      keywords: "skills stack tools technologies",
    });
  }

  return docs;
}
