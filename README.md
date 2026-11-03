# Srinivasan Balasubramanian · ML Engineer portfolio

**Live site:** https://srini2k03.github.io/Resume-/

This is a portfolio for AI/ML Engineer, Junior Data Scientist and Associate Software Engineer (ML) roles. It is a typed, tested, statically exported web app. Every number on it comes from a results file committed in the matching project repository. Results that have not been measured yet are labelled as pending, never estimated.

## What's on the site

| Section | What it shows |
|---|---|
| Hero | A rotating 3-D "embedding space" drawn on canvas. Your cursor acts as the query vector and retrieves its 6 nearest neighbours each frame. |
| Case studies | Five end-to-end systems (hybrid RAG, credit-risk MLOps, LoRA extraction, Olist analytics, deepfake detection). Each has a project-specific visual and an animated pipeline, plus a full page covering architecture, results, trade-offs and engineering. |
| Interactive lab | **Ask my portfolio**: a hybrid retriever written from scratch in TypeScript (BM25 + char-trigram TF-IDF, fused with Reciprocal Rank Fusion) with a refusal gate. It is evaluated live in the browser on a held-out, hand-labelled question set. **Pick a threshold**: the real decision-rule results from the credit-risk model. |
| How I work | Five engineering principles, each linked to evidence in a repository. |
| Skills | Click a skill to see which projects use it. The mapping is derived from project data, not typed by hand. |
| Résumé | `resume/resume.tex`, compiled to PDF in CI and served at `/Srinivasan_Balasubramanian_Resume.pdf`. |

Extras: a ⌘K / Ctrl+K command palette, light/dark themes, reduced-motion support, JSON-LD `Person` schema, Open Graph image, sitemap and robots.txt.

## Stack

- **Next.js 16** (App Router, `output: "export"`), **React 19**, **TypeScript** (strict, `noUncheckedIndexedAccess`)
- **Tailwind CSS v4** with design tokens as CSS variables (separate light and dark values; chart colours checked for colour-vision deficiency)
- **Motion** for animation; the hero is plain Canvas 2D (no WebGL dependency)
- **Vitest** for unit tests, **ESLint** (`eslint-config-next`)
- **GitHub Actions → GitHub Pages**

```
src/
  app/                 routes: /, /projects/[slug]/, sitemap, robots, 404
  components/          sections, charts, lab demos, motion primitives
  content/             single source of truth: profile, projects, chart data, skills
  lib/search/          tokenizer, BM25, char-n-gram TF-IDF, RRF, refusal gate, eval sets + tests
resume/resume.tex      the résumé (compiled in CI)
.github/workflows/     CI & deploy
```

### The retrieval lab, honestly described

- The corpus is built from `src/content/*`, the same data that renders the page.
- The gate thresholds (`GATE` in `src/lib/search/engine.ts`) were chosen from a grid sweep on `DEV_QUERIES` only. `gate.test.ts` asserts that the shipped values sit on the dev-accuracy maximum and away from the edge of the plateau.
- The UI reports Recall@3, MRR and refusal precision/recall on the disjoint `TEST_QUERIES` split. These are computed in the visitor's browser at page load. The set is small (24 questions), and the page says so.

## Run locally

```bash
npm ci
```

```bash
npm run dev        # http://localhost:3000
```

```bash
npm run check      # lint + type-check + unit tests
```

```bash
npm run build      # static export to ./out
```

## Deploy

`.github/workflows/deploy.yml` runs on every push to `main`:

1. **check**: lint, type-check, unit tests (including the held-out retrieval eval)
2. **resume**: compiles `resume/resume.tex` with TeX Live
3. **build**: static export with the Pages base path injected (`PAGES_BASE_PATH`)
4. **deploy**: publishes `out/` to GitHub Pages

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Keeping it truthful

When a project finishes a pending run (the RBI RAG ablation, LoRA fine-tuning, deepfake benchmarks):

1. Copy the committed numbers into `src/content/projects.ts`.
2. Change that project's `status` from `pending` to `info` or `live`.
3. Update the résumé bullet in `resume/resume.tex`. The TODO comments mark where.
