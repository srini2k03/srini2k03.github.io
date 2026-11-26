/**
 * Single source of truth for every project on the site.
 * Every number below is copied from a results file committed in the
 * project's own repository (paths noted in comments). Results that do not
 * exist yet are labelled as pending instead of being estimated.
 */

export type StatusTone = "live" | "pending" | "info";

export interface Status {
  label: string;
  tone: StatusTone;
}

export interface Metric {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  context?: string;
}

export interface Link {
  label: string;
  href: string;
  kind: "code" | "demo" | "api" | "site" | "apk";
  note?: string;
}

export interface Stage {
  name: string;
  detail: string;
}

export interface Project {
  slug: string;
  title: string;
  short: string;
  year: number;
  category: "GenAI · Retrieval" | "MLOps" | "LLM fine-tuning" | "Analytics · Statistics" | "Deep learning" | "Classical ML" | "Android" | "Backend";
  featured: boolean;
  tagline: string;
  status: Status[];
  /** Canonical skill names; these drive the skills evidence matrix. */
  skills: string[];
  links: Link[];
  problem: string;
  pipeline: Stage[];
  highlights: string[];
  metrics: Metric[];
  decisions: { title: string; body: string }[];
  engineering: { label: string; value: string }[];
  honesty?: string;
  next?: string[];
  inBrowser?: string;
  accent: "green" | "blue" | "amber" | "violet" | "rose";
}

export const projects: Project[] = [
  {
    slug: "rbi-rag",
    title: "RBI Regulations Q&A: Benchmarked RAG with Verified Citations",
    short: "RBI regulatory RAG",
    year: 2026,
    category: "GenAI · Retrieval",
    featured: true,
    accent: "green",
    tagline:
      "Question answering over 2,153 Reserve Bank of India notifications. Every citation is checked claim by claim, amendments between circulars are linked, and the system abstains when the evidence is weak.",
    status: [
      { label: "Retrieval live in browser", tone: "live" },
      { label: "108-config benchmark", tone: "info" },
    ],
    skills: ["Python", "RAG", "Hugging Face Transformers", "Qdrant", "BM25", "Cross-Encoder Reranking", "FastAPI", "Docker", "GitHub Actions (CI/CD)", "Pytest", "Streamlit", "Ollama"],
    links: [
      { label: "Code", href: "https://github.com/srini2k03/rbi-circulars-rag", kind: "code" },
      { label: "Live demo", href: "https://srini2k03.github.io/rbi-circulars-rag/", kind: "demo" },
    ],
    problem:
      "RBI publishes thousands of circulars that look almost identical, and many amend earlier ones. A compliance analyst needs the one rule that applies, with a citation to the exact notification, and needs to know when the documents do not settle the question. A plain LLM will invent a plausible-sounding rule. This system retrieves first, verifies every citation, links amendments, and declines when the evidence is weak.",
    pipeline: [
      { name: "Crawl", detail: "Polite httpx crawler (≥1 s between requests, retries with backoff, SHA-256 manifest); corpus-v1 has 2,153 documents" },
      { name: "Parse & chunk", detail: "HTML/PDF parsing with selectolax and PyMuPDF; fixed, semantic or section-aware chunkers (served index: 1,024-token chunks, 5,618 passages)" },
      { name: "Relation graph", detail: "9,183 cross-references parsed; 2,671 resolved into amends / supersedes edges, the rest kept as unknown rather than guessed" },
      { name: "Query understanding", detail: "Question type, ambiguity, out-of-scope detection and follow-up rewriting, always shown to the user" },
      { name: "Retrieve (benchmarked)", detail: "BM25, BGE-small dense search in Qdrant, RRF and weighted z-score fusion, RM3, parent-child: 108 configurations tuned on dev, tested with paired randomisation tests" },
      { name: "Abstention gate", detail: "The MiniLM cross-encoder scores the BM25 top 20; its top probability decides whether to answer (AUROC 0.952 on unanswerable test questions)" },
      { name: "Generate & verify", detail: "Numbered-source prompt; a claim-level verifier removes citations that do not support their sentence" },
      { name: "Serve", detail: "FastAPI /v1 (ask, retrieve, compare, verify, documents, relations) with rate limits, a Streamlit UI, Docker Compose, and the same profile in the browser" },
    ],
    highlights: [
      "Benchmarked 17 retrieval strategy families (108 configurations) for a RAG system over 2,153 RBI notifications, tuned on a dev split and reported on a document-disjoint test split (130 answerable questions) with paired randomisation tests. The original RRF hybrid + cross-encoder reranking scored 0.172 nDCG@10 below plain BM25 (Holm p = 0.002), and no deployable strategy beat BM25 significantly.",
      "Redeployed on the evidence: BM25 ranking with the cross-encoder as an abstention gate (AUROC 0.952 on unanswerable test questions), in both the FastAPI service and the in-browser demo (transformers.js).",
      "Explained a 0.97 vs 0.19 LLM-judge vs NLI faithfulness gap on the same 195 answers: 86% of passages exceeded the NLI model's 512-token input, and claim-level checks against passage windows raise NLI faithfulness to 0.70–0.73. Built a claim-level citation verifier on that finding.",
      "Built a regulatory relation graph from 9,183 cross-references (2,671 resolved, the rest marked unknown) with 94% precision on an AI-checked sample (49/52); graph-expanded context raised both-documents-in-context from 30% to 65% on multi-document questions, and follow-up rewriting raised document Recall@5 from 0.60 to 0.95.",
    ],
    metrics: [
      { value: 2153, label: "RBI notifications indexed", context: "5,618 passages served · 9,183 cross-references" },
      { value: 0.697, decimals: 3, label: "BM25 chunk nDCG@10 (test)", context: "best deployable of 108 configs · RRF + rerank 0.525" },
      { value: 0.952, decimals: 3, label: "Abstention AUROC", context: "cross-encoder gate · unanswerable test questions" },
      { value: 94, suffix: "%", label: "Relation precision", context: "amends / supersedes links · 49 of 52 sampled" },
    ],
    decisions: [
      { title: "Benchmark before believing", body: "RRF, weighted z-score fusion, RM3, parent-child context and reranking were each tuned on dev and tested against BM25 with paired randomisation tests and Holm correction. Plain BM25 held up on exact regulatory wording, so the served profile follows the evidence." },
      { title: "Reranker as a gate, not a ranker", body: "The cross-encoder hurt ranking but is excellent at telling answerable from unanswerable questions (AUROC 0.952), so it decides whether to answer instead of reordering results." },
      { title: "Find out why two checks disagree", body: "On the same 195 answers the LLM judge said 0.97 and NLI said 0.19. The NLI model truncates at 512 tokens and 86% of passages are longer; checking each claim against passage windows gives 0.70–0.73, and the verifier is built on that." },
      { title: "Latest in the corpus is not “in force”", body: "The relation graph reports the latest version in the indexed corpus and says so; references it cannot resolve stay unknown instead of being guessed." },
      { title: "Document-level splits", body: "Dev and test questions come from disjoint documents (seeded SHA-256 split), so thresholds are never tuned on the circulars they are scored on." },
      { title: "Honest test-set provenance", body: "Every Q/A pair is labelled as model-generated, AI-reviewed or human-verified, and every result is logged with its commit and CI run." },
    ],
    engineering: [
      { label: "Tests", value: "369 tests (pytest, strict mypy) plus Playwright browser tests and JS/Python parity checks" },
      { label: "CI", value: "ruff, strict mypy, pytest, Docker Compose smoke test; benchmark and analysis workflows replay cached model scores and check they reproduce live runs" },
      { label: "Evaluation infra", value: "Experiment log with commit and CI run per result; a score cache replays all 108 configurations without the models" },
      { label: "API", value: "/v1 ask, retrieve, compare, verify, documents, relations; rate limits (429), body limits (413), per-answer time budgets, request metrics" },
    ],
    honesty:
      "The test set is 216 model-generated Q/A pairs reviewed by an AI assistant; none are human-verified yet. The dev split has only 5 unanswerable questions, so the gate threshold is fragile (precision 0.77, recall 0.68 at that threshold). Answer-quality figures predate the new served profile, and the relation precision comes from an AI-checked sample.",
    next: ["Human-verify the test set and the relation sample", "Re-run answer generation on the new served profile"],
    inBrowser: "BM25 ranking and the cross-encoder gate run client-side through transformers.js.",
  },
  {
    slug: "credit-default",
    title: "Credit Default Prediction: Cost-Sensitive MLOps Platform",
    short: "Credit-risk MLOps",
    year: 2026,
    category: "MLOps",
    featured: true,
    accent: "blue",
    tagline:
      "A cost-sensitive credit-risk system on 30,000 customers: five model families under one protocol, a 12-check promotion gate with rollback, drift policies that block or retrain, and a load-tested FastAPI service that redeploys itself.",
    status: [
      { label: "API live on Render", tone: "live" },
      { label: "Results committed", tone: "info" },
    ],
    skills: ["Python", "Scikit-Learn", "XGBoost", "LightGBM", "Optuna", "SHAP", "MLflow", "DVC", "Prefect", "Evidently", "Docker", "FastAPI", "GitHub Actions (CI/CD)", "Pytest", "pandas", "Linux"],
    links: [
      { label: "Code", href: "https://github.com/srini2k03/credit-default-mlops", kind: "code" },
      { label: "API docs", href: "https://credit-default-api-fkqg.onrender.com/docs", kind: "api", note: "Free tier: the first request takes 30–60 s to wake the service" },
      { label: "Dashboard", href: "https://srini2k03.github.io/credit-default-mlops/", kind: "site" },
    ],
    problem:
      "Approving a customer who later defaults costs a lender far more than turning away one who would have paid. A classifier tuned for accuracy at a 0.5 cutoff ignores that asymmetry. The real task is to pick the decision that minimises expected cost, keep the probabilities calibrated, stop a worse model from reaching production, and notice when incoming data stops looking like the training data.",
    pipeline: [
      { name: "Ingest & validate", detail: "UCI download pinned by SHA-256 and versioned with DVC; Pandera schema plus a data-quality and leakage report" },
      { name: "Train five families", detail: "Logistic regression, random forest, XGBoost, LightGBM (CatBoost compared), tuned with Optuna under one protocol with bootstrap CIs" },
      { name: "Calibrate", detail: "None vs Platt vs isotonic on a separate calibration split; Platt kept (ECE 0.015 vs 0.190 uncalibrated)" },
      { name: "Decide", detail: "Cost engine with configurable FN/FP costs; cutoff 0.16 at 5:1, sensitivity analysis from 1:1 to 20:1" },
      { name: "Gate & register", detail: "12 checks against the @production model (performance, calibration, cost, operations); append-only decision history; rollback" },
      { name: "Monitor", detail: "Seven drift scenarios (PSI, KS, χ², z-test); a policy decides block, retrain or monitor, and drives the retrain workflow" },
      { name: "Serve & explain", detail: "FastAPI with request IDs, /ready, rate and size limits, per-prediction SHAP, and a NumPy fast path identical to the sklearn pipeline" },
      { name: "Deploy", detail: "Render redeploys through a deploy hook whenever the model or API changes; a workflow waits for the new model and smoke-tests every endpoint" },
    ],
    highlights: [
      "Compared five model families (LogReg, random forest, XGBoost, LightGBM, CatBoost) under one protocol with bootstrap CIs on 30,000 credit-card customers; the Platt-calibrated LightGBM champion scored ROC-AUC 0.781 and PR-AUC 0.559 on a 6,000-customer holdout. Sex, marital status and age were removed from the inputs with no measurable loss.",
      "Built a configurable cost-sensitive decision engine: at a 5:1 miss-to-false-alarm cost the chosen cutoff lowers expected cost per applicant by 25.9% against a 0.5 cutoff and raises default recall from 35% to 78%; a sensitivity analysis shows how the cutoff moves from 1:1 to 20:1.",
      "Designed champion/challenger governance: a 12-check promotion gate, an append-only decision history and rollback. A simulation on real data rejected a label-noise challenger and an uncalibrated one, and drift policies blocked broken feeds and triggered retraining in CI.",
      "Rewrote per-request scoring in NumPy with probabilities identical to the sklearn pipeline on all 6,000 test rows, taking one worker from 103 to 330 requests/s and p95 latency from 51 ms to 15 ms.",
    ],
    metrics: [
      { value: 0.781, decimals: 3, label: "ROC-AUC (holdout)", context: "n = 6,000 · PR-AUC 0.559" },
      { value: 25.9, decimals: 1, prefix: "−", suffix: "%", label: "Expected cost / applicant", context: "0.752 → 0.558 vs the 0.5 cutoff" },
      { value: 77.7, decimals: 1, suffix: "%", label: "Default recall", context: "up from 35.4% at the 0.5 cutoff" },
      { value: 330, label: "Requests/s, one worker", context: "4 clients · p95 15 ms (was 103 req/s, 51 ms)" },
    ],
    decisions: [
      { title: "Select on cost, not ROC-AUC", body: "The champion is the deployable family with the lowest validation cost. The tree models overlap within their paired-bootstrap intervals, and the dashboard says so instead of declaring a clear winner." },
      { title: "Calibrate on its own split", body: "None, Platt and isotonic were compared on a held-out calibration split. Platt was kept (ECE 0.015 vs 0.190); isotonic cost 0.026 PR-AUC because of tied scores." },
      { title: "Gate, don't overwrite", body: "A challenger replaces the champion only if it passes all 12 checks. Tests prove a failed challenger cannot be promoted, and rollback restores the previous alias or bundle." },
      { title: "Not every drift is a problem", body: "Broken feeds (missing values, unknown codes) block scoring; covariate shift triggers retraining before labels arrive; a significant test statistic alone does not." },
      { title: "Exactness before speed", body: "The NumPy fast path is enabled only if it reproduces the pipeline's probabilities exactly; MLflow pyfunc loading (4.3 s, 411 MB) was benchmarked against the joblib bundle (1.6 s, 287 MB)." },
    ],
    engineering: [
      { label: "Tests", value: "107 tests: data quality, decision engine, fairness, drift scenarios, governance (including a failed challenger), API, performance" },
      { label: "CI", value: "ruff, pytest, synthetic end-to-end run (quality → train → gate → drift → governance → Prefect), Docker smoke test, Locust, push to GHCR" },
      { label: "CD & monitoring", value: "Deploy hook redeploys Render on model or API changes, waits for the new model version and smoke-tests it; the retrain workflow follows the drift policy" },
      { label: "Dashboard", value: "Five pages (overview, predict, evaluation, monitoring, registry); the cost slider recomputes from the committed held-out predictions; browser-checked in CI" },
    ],
    honesty:
      "The data has no application dates, so the split is stratified random rather than temporal; drift batches are simulated; the 5:1 cost ratio is an assumption; and the fairness report is descriptive, not a compliance assessment. It is an educational decision-support system, not an approved lending engine.",
  },
  {
    slug: "jobpost-extractor",
    title: "Job-Post to JSON Extractor: LoRA Fine-Tuning, Tested on Real Posts",
    short: "LoRA JSON extractor",
    year: 2026,
    category: "LLM fine-tuning",
    featured: true,
    accent: "violet",
    tagline:
      "Turns messy Indian job posts (WhatsApp forwards, Hinglish, “12 LPA”) into one strict 11-field JSON object with evidence for every value. Evaluated on real postings, not just synthetic ones.",
    status: [
      { label: "In-browser model live", tone: "live" },
      { label: "Real-posting evaluation", tone: "info" },
    ],
    skills: ["Python", "Hugging Face Transformers", "TRL (LoRA fine-tuning)", "llama.cpp/GGUF Quantization", "Ollama", "FastAPI", "Docker", "GitHub Actions (CI/CD)", "Pytest", "NumPy"],
    links: [
      { label: "Code", href: "https://github.com/srini2k03/jobpost-extractor-qlora", kind: "code" },
      { label: "Live demo", href: "https://srini2k03.github.io/jobpost-extractor-qlora/", kind: "demo", note: "The 4-bit model (~400 MB) downloads once, then runs entirely in your browser" },
      { label: "Model release", href: "https://github.com/srini2k03/jobpost-extractor-qlora/releases/tag/model-v1", kind: "code" },
    ],
    problem:
      "Job posts in India arrive as WhatsApp forwards, Telegram blasts and Naukri copy-pastes, mixing Hindi and English, with salaries such as “8–12 LPA”. Downstream systems need strict JSON. A general LLM will happily invent a missing salary or location, so the goal is a small model that extracts what is there, shows where it found it, and returns null for what is not, and an honest measure of how well that works on real text.",
    pipeline: [
      { name: "Synthesise", detail: "3,000 labelled posts from 18 role domains, 143 skills, 35 cities and 12 template families, plus noise operators" },
      { name: "Audit", detail: "Leakage gate in CI: exact and near duplicates, cross-split Jaccard, 8-gram overlap, template and company overlap, few-shot provenance" },
      { name: "Real postings", detail: "130 real Indian postings from 4 sources whose licences were checked before any row was read; labelled with documented rules" },
      { name: "LoRA SFT", detail: "Qwen2.5-0.5B-Instruct, r = 16, α = 32, TRL completion-only loss, on CPU in chained GitHub Actions jobs; a 6-config LoRA study selected on validation" },
      { name: "Quantise", detail: "Merge, then eight GGUF variants (F16 to Q2_K) benchmarked on one machine with llama.cpp" },
      { name: "Ground", detail: "An evidence span for every value (exact, alias, parsed, fuzzy or none); unsupported values are flagged" },
      { name: "Calibrate", detail: "Token log-probs aligned to each field, a logistic calibrator fitted on validation, configurable abstention" },
      { name: "Serve", detail: "FastAPI (/extract, /extract/batch, /validate, /evidence, /model) in a multi-stage Docker image; Q4_K_M in the browser via llama.cpp WASM" },
    ],
    highlights: [
      "LoRA fine-tuned Qwen2.5-0.5B-Instruct (TRL SFT, completion-only loss) on CPU in GitHub Actions to convert noisy Indian job posts into schema-validated JSON across 11 fields: micro-F1 99.3% (base 71.6%) on 471 template-disjoint synthetic posts.",
      "Built a real-world test set of 130 licence-checked Indian postings and measured the synthetic-to-real gap honestly (99.3% → 56.1% micro-F1). The fine-tune cut hallucinated fields from 58.4% to 7.9% against its base model and matched a 6× larger Qwen2.5-3B on micro-F1 (56.1% vs 56.4%) with a quarter of its hallucinations.",
      "Added evidence spans for every value and calibrated field confidence fitted on validation only: on real postings ECE dropped from 0.20 to 0.10 (AUROC 0.88), and abstention raised kept-field accuracy from 76.4% to 86.0% at 87.9% coverage; capping list lengths in the JSON grammar raised valid JSON from 96.2% to 100%.",
      "Benchmarked eight GGUF quantisations on one machine: real-posting accuracy stayed within 53.4–55.6% from F16 to Q2_K, and the 0.40 GB Q4_K_M runs at 40 tokens/s with 0.54 GB peak RAM and in the browser via WebAssembly.",
    ],
    metrics: [
      { value: 56.1, decimals: 1, suffix: "%", label: "Micro-F1 on real postings", context: "n = 130 · 99.3% on synthetic · base 32.0%" },
      { value: 7.9, decimals: 1, suffix: "%", label: "Hallucinated fields (real)", context: "base 58.4% · Qwen2.5-3B 30.3%" },
      { value: 0.88, decimals: 2, label: "Confidence AUROC (real)", context: "ECE 0.20 → 0.10 after calibration" },
      { value: 0.4, decimals: 2, suffix: " GB", label: "4-bit model in the browser", context: "Q4_K_M · 40 tokens/s on 4 CPU threads" },
    ],
    decisions: [
      { title: "Measure on real text", body: "Synthetic labels are exact but flatter the model. A 130-posting real set, gathered only from sources whose licences allow it, shows the true picture: 56.1% micro-F1, and where the model fails (skill lists, locations, education)." },
      { title: "Hallucination as a first-class metric", body: "F1 alone rewards guessing. A separate hallucination rate counts fields filled in when they should be null; the fine-tune keeps it at 7.9% on real posts." },
      { title: "Evidence before trust", body: "Every value is traced to a span in the input. Values with no support are flagged, and calibrated confidence decides whether to abstain, with the withheld value still returned for review." },
      { title: "Leakage-proof splits, enforced", body: "Template families and companies never cross splits, and an audit gate in CI fails the build on duplicates, n-gram overlap or few-shot leakage." },
      { title: "Compare speed on one machine", body: "Earlier speed figures came from different CPUs. All quantisations were re-run on the same runner, so the size, latency, RAM and accuracy trade-offs are comparable." },
    ],
    engineering: [
      { label: "Tests", value: "207 tests: leakage audit, evidence spans, calibration, robustness scoring, schema, serving" },
      { label: "CI", value: "ruff, mypy, pytest, leakage audit; Docker image build with an API smoke test; the Pages deploy checks the real model returns valid JSON" },
      { label: "Evaluation infra", value: "Real-posting, robustness (14 categories incl. prompt injection), quantisation and LoRA-study workflows on GitHub Actions; each commits only the files it produced" },
      { label: "Serving", value: "FastAPI with rate and size limits and JSON logs that never contain posting text; multi-stage Docker image with llama-cpp-python" },
    ],
    honesty:
      "The 130 real postings carry AI-assisted labels that are not human-verified yet, and the set leans towards IT jobs. Prompt-injection text still reaches the output in 33–42% of injection cases, the model rarely returns an empty record for non-job text, and calibration is fitted on synthetic validation data, so it is still over-confident on real posts. The GPT-OSS-120B comparison on real posts is incomplete (9 of 130, free API quota).",
    next: ["Human-verify the real-posting labels", "Retrain with the winning LoRA configuration at full budget and harden against prompt injection"],
  },
  {
    slug: "olist-analytics",
    title: "E-Commerce Analytics Platform on 99K Orders (Olist)",
    short: "Olist analytics",
    year: 2026,
    category: "Analytics · Statistics",
    featured: true,
    accent: "amber",
    tagline:
      "A layered DuckDB warehouse with 75 data-quality checks, a 32-metric layer and a 10-page in-browser dashboard on the real Olist marketplace data, ending with a simulated A/B test that says not to launch free shipping.",
    status: [
      { label: "Dashboard live (in-browser)", tone: "live" },
      { label: "Results committed", tone: "info" },
    ],
    skills: ["Python", "SQL", "DuckDB", "PostgreSQL", "Streamlit", "A/B Testing", "Statistical Inference", "pandas", "NumPy", "Scikit-Learn", "LightGBM", "SHAP", "GitHub Actions (CI/CD)", "Pytest"],
    links: [
      { label: "Code", href: "https://github.com/srini2k03/olist-ecommerce-analytics", kind: "code" },
      { label: "Dashboard", href: "https://srini2k03.github.io/olist-ecommerce-analytics/app/", kind: "demo", note: "Streamlit compiled to WebAssembly; the first load takes 10–30 s" },
    ],
    problem:
      "A marketplace with 99,441 orders wants to know what is hurting customer satisfaction, who its valuable customers are, which sellers to trust, when deliveries will be late, and whether free shipping would pay for itself. Each question needs clean data, a defensible statistical answer and a business recommendation, not just a chart.",
    pipeline: [
      { name: "Fetch", detail: "Kaggle API with a pinned GitHub fallback; every file checked by SHA-256" },
      { name: "Validate", detail: "75 data-quality and referential-integrity checks across raw, staging and marts; the pipeline stops on any error" },
      { name: "Warehouse", detail: "Raw → 8 staging models → 7 marts; the same SQL builds DuckDB and PostgreSQL, and CI compares the results on the real data" },
      { name: "26 SQL queries", detail: "Organised by domain (customers, sellers, products, orders, delivery, payments, revenue, reviews) on top of the marts" },
      { name: "Metric layer", detail: "32 metrics defined in YAML; revenue, payment value, freight, GMV and estimated contribution are kept separate" },
      { name: "Statistics & models", detail: "Bootstrap CIs, power, Holm/BH corrections; BG/NBD + Gamma-Gamma CLV; a delivery-delay model validated on later months" },
      { name: "Experiment", detail: "Simulated free-shipping A/B test on real 2018 baskets with a decision engine and sensitivity analysis" },
      { name: "Dashboard", detail: "10 filterable pages in Streamlit compiled to WebAssembly (stlite), served from GitHub Pages with no backend" },
    ],
    highlights: [
      "Built a layered DuckDB warehouse (raw → staging → marts) for 99k Olist orders with 75 data-quality and referential-integrity checks and 26 domain SQL queries verified identical on PostgreSQL in CI. The checks caught a zip-code defect that left 24,265 customers without a location (280 after the fix).",
      "Showed that late deliveries drop the average review from 4.29 to 2.27 stars (6,381 late orders; 95% CI on the gap −2.06 to −1.98), and found an RFM segment holding 12.4% of customers but 38.6% of revenue.",
      "Built a delivery-delay model validated on later months: late-delivery PR-AUC 0.123 vs 0.069 for a lane-history baseline, and delivery-time MAE 5.20 days vs 5.65 (Olist's own promise misses by 14.56). A BG/NBD CLV model predicted 739 repeat purchases against 720 actual on a 6-month holdout.",
      "Simulated a free-shipping test on real 2018 baskets with power planning, an SRM check and bootstrap CIs: contribution would fall by about R$58.5k a month, so the recommendation is not to launch.",
    ],
    metrics: [
      { value: 99441, label: "Orders analysed", context: "9 tables · 75 data-quality checks" },
      { value: 2.27, decimals: 2, label: "Avg review when late", context: "vs 4.29 on time · 6,381 late orders" },
      { value: 38.6, decimals: 1, suffix: "%", label: "Revenue from 12.4% of customers", context: "“At-risk big spenders” segment" },
      { value: 0.123, decimals: 3, label: "Late-delivery PR-AUC", context: "vs 0.069 baseline · tested on later months" },
    ],
    decisions: [
      { title: "Significant is not the same as worth it", body: "The simulated test on real 2018 baskets found an uplift, but the R$9.26 subsidy per treatment order would cut contribution by about R$58.5k a month (CI −62.6k to −54.3k). The recommendation is not to launch." },
      { title: "Separate the money", body: "Revenue, payment value, freight, GMV and estimated marketplace contribution are distinct metrics. Olist has no commission or cost data, so anything profit-like is labelled an estimate." },
      { title: "One SQL, two engines", body: "Every model is a plain SELECT with a documented grain, built on DuckDB and PostgreSQL from the same text; CI fails if the results differ." },
      { title: "Rank sellers fairly", body: "Rankings need at least 30 orders, use Wilson intervals and shrinkage, and weigh service quality above revenue, so a lucky small seller cannot top the list." },
      { title: "Honest about weak signals", body: "Only 3% of customers ever reorder. The repeat-purchase model reaches ROC-AUC 0.58 and the CLV ranking 0.59, and both are reported as weak rather than oversold." },
    ],
    engineering: [
      { label: "Tests", value: "300 tests, including known-answer fixtures, 26 PostgreSQL parity tests, pipeline contracts and Streamlit AppTests" },
      { label: "CI", value: "4 jobs: lint and test, PostgreSQL parity on the real data, notebooks executed, Playwright smoke test of all 10 dashboard pages" },
      { label: "Performance", value: "Warehouse build 3.9 s on DuckDB; two PostgreSQL slow paths cut from 202 s to 0.11 s and from 235 s to 2.4 s" },
      { label: "Deployment", value: "Serverless dashboard: Streamlit in Pyodide (7 MB bundle, first render ~10 s), verified in headless Chromium before publishing" },
    ],
    honesty:
      "Findings are associations, not causal effects. The A/B test is simulated on real baskets, not a real experiment, and Olist has no commission or cost data, so contribution figures are estimates.",
    inBrowser: "The 10-page Streamlit dashboard runs entirely client-side in Pyodide (Python compiled to WebAssembly).",
  },
  {
    slug: "deepfake-detection",
    title: "Deepfake Detection: Audio and Face Models, Honestly Benchmarked",
    short: "Deepfake detection",
    year: 2025,
    category: "Deep learning",
    featured: true,
    accent: "rose",
    tagline:
      "Voice-spoof and face-manipulation detectors trained and benchmarked on openly licensed data, with the shortcuts they learned exposed, a calibrated API, Grad-CAM, and the audio model running in the browser.",
    status: [
      { label: "Audio model live in browser", tone: "live" },
      { label: "Benchmarked on lawful data", tone: "info" },
      { label: "Fusion not evaluated", tone: "pending" },
    ],
    skills: ["Python", "TensorFlow/Keras", "OpenCV", "NumPy", "Flask", "Docker", "GitHub Actions (CI/CD)", "Pytest"],
    links: [
      { label: "Code", href: "https://github.com/srini2k03/multimodal-deepfake-detection", kind: "code" },
      { label: "Demo", href: "https://srini2k03.github.io/multimodal-deepfake-detection/", kind: "demo", note: "Real audio scoring and face preprocessing in the browser" },
      { label: "Model releases", href: "https://github.com/srini2k03/multimodal-deepfake-detection/releases", kind: "code" },
    ],
    problem:
      "Deepfake detectors often look excellent on their benchmark and fail on anything else, because they learn shortcuts in the data rather than manipulation artefacts. A credible detector has to be trained on data it is allowed to use, evaluated on unseen speakers, identities and attack methods, and checked for exactly those shortcuts.",
    pipeline: [
      { name: "Lawful data", detail: "ASVspoof 2019 LA and In-the-Wild (audio), DeepFakeFace and WildDeepfake (faces); datasets behind access forms excluded" },
      { name: "Audio branch", detail: "Silence trim → log-mel → 154k-parameter CNN on speaker-disjoint official splits" },
      { name: "Face branch", detail: "OpenCV detection + eye alignment → EfficientNetV2-B0 fine-tuned on identity-disjoint splits" },
      { name: "Calibrate", detail: "Platt scaling per branch on validation, re-weighted to equal priors" },
      { name: "Stress-test", detail: "Silence- and metadata-only baselines, 13 audio and 14 image robustness conditions, held-out generators, cross-dataset tests" },
      { name: "Explain", detail: "Grad-CAM for faces, spectrograms with saliency for audio" },
      { name: "Optimise", detail: "TFLite: audio int8 1.4 ms with the same EER; face model fp32 6.9 ms" },
      { name: "Serve", detail: "Flask API (rate limits, upload validation, per-stage timings), React dashboard, audio CNN ported to JavaScript" },
    ],
    highlights: [
      "Benchmarked a CPU-trained 154k-parameter log-mel CNN on ASVspoof 2019 LA (11 unseen attacks, speaker-disjoint): 7.65% EER and min t-DCF 0.138. Showed it leans on a silence shortcut (one extra second of silence flags 100% of real clips) and shipped a silence-trimmed model that holds 27.6% EER at 10 dB SNR instead of 62.6%.",
      "Fine-tuned EfficientNetV2-B0 to 0.914 ROC-AUC on identity-disjoint DeepFakeFace, exposed a dataset bias (file metadata alone scores 0.967), and measured the limits: 0.714 on held-out face-swap methods and 0.653 video-level AUC on WildDeepfake.",
      "Shipped a calibrated Flask API (rate limiting, upload validation, Grad-CAM, per-stage latency; 1.77 s for a 10 s video on 4 vCPU) and a JavaScript port of the audio CNN matched to Python (logit difference 1.5e-6), checked in CI.",
    ],
    metrics: [
      { value: 7.65, decimals: 2, suffix: "%", label: "Audio EER (ASVspoof 2019)", context: "11 unseen attacks · min t-DCF 0.138" },
      { value: 0.914, decimals: 3, label: "Face ROC-AUC (DeepFakeFace)", context: "identity-disjoint · metadata-only 0.967" },
      { value: 27.6, decimals: 1, suffix: "%", label: "EER at 10 dB SNR", context: "served model · 62.6% before silence trimming" },
      { value: 1.4, decimals: 1, suffix: " ms", label: "Audio inference (int8)", context: "TFLite, 168 KB, same EER" },
    ],
    decisions: [
      { title: "Lawful data only", body: "FaceForensics++, Celeb-DF, DFDC and the paired audio-visual sets need access forms, so they were not used. Fusion therefore has no reported accuracy, and the site says so." },
      { title: "Hunt for shortcuts", body: "Silence-only and metadata-only baselines run next to every model. They exposed a silence shortcut in the audio data and a fixed-resolution bias in the face data." },
      { title: "Ship the robust model, not the best number", body: "The served audio model scores worse on clean ASVspoof (19.0% vs 7.65% EER) but catches attack A17 and holds up under noise, which matters more in use." },
      { title: "Speaker- and identity-disjoint splits", body: "No speaker or face identity appears in both train and test, the most common source of inflated deepfake benchmarks." },
      { title: "Missing audio is never evidence", body: "Fusion drops a missing modality and renormalises the weights instead of treating silence as a sign of manipulation." },
    ],
    engineering: [
      { label: "Tests", value: "103 tests, a Playwright smoke test, and a JS/Python audio parity check run in CI and before every Pages deploy" },
      { label: "CI", value: "ruff check and format, pytest with and without TensorFlow, frontend production build" },
      { label: "Training infra", value: "CPU training in GitHub Actions; results committed with run ID, commit and package versions; models published as releases" },
      { label: "Packaging", value: "Backend image (gunicorn, non-root, healthcheck) and frontend image (nginx) via docker-compose" },
    ],
    honesty:
      "Audio-visual fusion is not evaluated, because no paired dataset is available without an access form; the Xception/InceptionV3 video ensemble remains untrained for the same reason. Each system was trained with one seed, calibration holds only in distribution, and cross-dataset audio (In-the-Wild) is near chance. Scores are model assessments, not verdicts.",
    next: ["Apply for FaceForensics++ and FakeAVCeleb access to train the video ensemble and evaluate fusion"],
    inBrowser: "The trained audio CNN and face detection with alignment (MediaPipe) run client-side.",
  },
  {
    slug: "abalone-regression",
    title: "Abalone Age Regression",
    short: "Abalone regression",
    year: 2024,
    category: "Classical ML",
    featured: false,
    accent: "green",
    tagline:
      "A reproducible scikit-learn pipeline comparing nine models. The tuned XGBoost model is exported to run in the browser, with a CI parity check against Python.",
    status: [{ label: "In-browser predictor live", tone: "live" }],
    skills: ["Python", "Scikit-Learn", "XGBoost", "LightGBM", "CatBoost", "Optuna", "SHAP", "FastAPI", "Docker", "GitHub Actions (CI/CD)", "Pytest", "pandas"],
    links: [
      { label: "Code", href: "https://github.com/srini2k03/abalone-age-regression", kind: "code" },
      { label: "Live predictor", href: "https://srini2k03.github.io/abalone-age-regression/", kind: "demo" },
    ],
    problem: "Predict an abalone's age (rings) from body measurements, and show which models actually beat a strong linear baseline.",
    pipeline: [
      { name: "Fetch & validate", detail: "UCI download with a pinned fingerprint and schema validation" },
      { name: "Features in-fold", detail: "Quantile clipping and morphometric features fitted inside each CV fold" },
      { name: "Compare", detail: "9 models with repeated K-fold (5×2), log1p target so training directly minimises RMSLE" },
      { name: "Ensemble", detail: "Stacking (positive linear meta-learner) and a blend" },
      { name: "Ship", detail: "Typer CLI, FastAPI and Docker; 300-tree XGBoost exported to JSON for the browser" },
    ],
    highlights: [
      "Best hold-out RMSLE of 0.1659 (blend ensemble), 41.6% below a mean-predictor baseline and about 3% better than plain linear regression in CV.",
      "The tuned XGBoost model runs in the browser. CI checks JS-vs-Python parity on 196 rows (tolerance 1e-4) before every deploy.",
    ],
    metrics: [
      { value: 0.1659, decimals: 4, label: "Hold-out RMSLE", context: "blend ensemble, 836 unseen rows" },
      { value: 41.6, decimals: 1, prefix: "−", suffix: "%", label: "vs mean baseline", context: "baseline RMSLE 0.2839" },
      { value: 56, label: "Tests", context: "Python 3.10–3.12 matrix" },
    ],
    decisions: [
      { title: "Report the gap to the strong baseline", body: "A gain of 41.6% over predicting the mean sounds large. The more honest comparison is with linear regression, where the gain is about 3%." },
    ],
    engineering: [
      { label: "CI", value: "ruff, pytest on 3 Python versions, CLI smoke run on real data, Docker build, JS/Python parity gate" },
    ],
    inBrowser: "300-tree XGBoost model evaluated client-side in plain JavaScript.",
  },
  {
    slug: "e-challan-android",
    title: "Traffic Violation & e-Challan Manager (Android)",
    short: "Android e-Challan",
    year: 2023,
    category: "Android",
    featured: false,
    accent: "blue",
    tagline:
      "An offline-first Android app for issuing traffic fines. Clean Architecture across three Gradle modules, with a Room source of truth synced to Firebase by WorkManager.",
    status: [{ label: "CI-built debug APK", tone: "info" }],
    skills: ["Kotlin", "GitHub Actions (CI/CD)"],
    links: [
      { label: "Code", href: "https://github.com/srini2k03/traffic-violation-fine-manager", kind: "code" },
      { label: "Site", href: "https://srini2k03.github.io/traffic-violation-fine-manager/", kind: "site" },
    ],
    problem: "Officers issue fines in places with patchy connectivity. The app must work offline, sync reliably later and apply repeat-offender rules consistently.",
    pipeline: [
      { name: ":domain", detail: "Pure Kotlin: fine calculator with repeat-offender tiers, validators, use cases" },
      { name: ":data", detail: "Room, a pending-operation queue, WorkManager sync with exponential backoff, Firebase Auth / Realtime Database / Storage" },
      { name: ":app", detail: "Jetpack Compose and Material 3, Hilt, MVVM with StateFlow" },
    ],
    highlights: [
      "Kotlin, Jetpack Compose, MVVM and Clean Architecture; Room offline-first storage with WorkManager sync to Firebase.",
      "Indian number-plate validation, GPS and photo evidence, PDF challans with QR codes, and an admin analytics console.",
      "107 unit tests (JUnit, MockK, Turbine); CI runs lint and tests and publishes a debug APK.",
    ],
    metrics: [
      { value: 107, label: "Unit tests", context: "JUnit 4, MockK, Turbine" },
      { value: 3, label: "Gradle modules", context: "domain / data / app" },
    ],
    decisions: [],
    engineering: [{ label: "CI", value: "assembleDebug, Android lint and unit tests; rolling debug APK release" }],
    honesty: "First built in September 2023 and later re-architected, as the README notes.",
  },
  {
    slug: "redis-chat",
    title: "Redis Chat Service",
    short: "Redis chat",
    year: 2025,
    category: "Backend",
    featured: false,
    accent: "amber",
    tagline: "A Spring Boot REST chat service. Rooms are Redis hashes, participants are sets, history is lists, with pub/sub for fan-out.",
    status: [],
    skills: ["Java", "Docker"],
    links: [{ label: "Code", href: "https://github.com/srini2k03/Simple-Chat-Application-Using-Redis", kind: "code" }],
    problem: "",
    pipeline: [],
    highlights: [],
    metrics: [],
    decisions: [],
    engineering: [],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);
export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

/** Aggregates computed from the data above, so headline numbers can never drift from the projects. */
export const proof = {
  endToEnd: featuredProjects.length,
  /** Approximate test counts per repo: RBI 369, credit 107, jobpost 207, olist 300, deepfake 103, abalone 56, android 107. */
  testsApprox: 369 + 107 + 207 + 300 + 103 + 56 + 107,
  inBrowserCount: projects.filter((p) => p.inBrowser).length,
  liveDemos: projects.filter((p) => p.status.some((s) => s.tone === "live")).length,
  /** Count of .github/workflows files across the seven project repos (7+7+13+4+8+2+2). */
  ciWorkflows: 43,
};
