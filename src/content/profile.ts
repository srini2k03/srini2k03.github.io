export const profile = {
  name: "Srinivasan Balasubramanian",
  shortName: "Srinivasan",
  initials: "SB",
  roles: ["AI/ML Engineer", "Junior Data Scientist", "Associate Software Engineer (ML)"],
  location: "Bangalore, India",
  email: "srinivasanb123@gmail.com",
  phone: "+91 8431358523",
  phoneHref: "tel:+918431358523",
  github: "https://github.com/srini2k03",
  githubHandle: "srini2k03",
  siteRepo: "https://github.com/srini2k03/Resume-",
  headline: "I build ML systems that ship, measure themselves, and say “I don’t know” when they should.",
  summary:
    "Machine Learning Engineer (B.E. Information Science, BMS College of Engineering, 2025). " +
    "I take models past the notebook: hybrid retrieval with citations and a calibrated refusal gate, " +
    "a credit-risk model with a cost-optimal decision threshold behind a promotion-gated MLflow registry, " +
    "drift-triggered retraining, SQL that is cross-checked on two engines in CI, and models that run directly in the browser.",
  about: [
    "I care about the part of machine learning that happens after the model trains: how it is evaluated, how it fails, how it is served, and how anyone can tell when it has stopped working.",
    "So my projects end at a deployed endpoint or a browser demo, not a notebook. They have test suites and CI pipelines, data splits that are leakage-safe by construction, and results tables that CI regenerates from committed artefacts. Where a number is still being measured, the project says so instead of guessing.",
  ],
  education: {
    school: "BMS College of Engineering",
    degree: "Bachelor of Engineering, Information Science and Engineering",
    period: "Dec 2021 – Jun 2025",
    grade: "CGPA 8.5 / 10",
    location: "Bangalore, India",
  },
  certifications: [
    {
      name: "Fundamentals of Red Hat Enterprise Linux",
      issuer: "Red Hat · Coursera",
      href: "https://www.coursera.org/account/accomplishments/verify/KJ7ESJ1C2WZS",
    },
    {
      name: "Data Analysis with R",
      issuer: "Johns Hopkins University · Coursera",
      href: "https://www.coursera.org/account/accomplishments/verify/LNXG7OSLGILX",
    },
  ],
} as const;

export const experience = [
  {
    company: "AIMPLIFY",
    role: "Software Intern (AI/ML)",
    period: "Jul 2024 – Sep 2024",
    location: "Bangalore, India",
    points: [
      "Built Python data-processing workflows to clean and structure unstructured text corpora for LLM and ML model evaluation.",
      "Designed and benchmarked baseline LLM prompts across test suites; wrote Scikit-Learn cross-validation and error-analysis scripts tracking Precision, Recall and F1.",
      "Integrated ML inference outputs into internal application prototypes through Flask REST APIs, working with the software team.",
    ],
    stack: ["Python", "Scikit-Learn", "LLM evaluation", "Flask"],
  },
] as const;

/** Engineering principles, each tied to concrete evidence in a project. */
export const principles = [
  {
    id: "measure",
    title: "Measure before you claim",
    body: "Every model is scored against a baseline with bootstrap confidence intervals. Partial runs are kept out of results tables, and CI fails if a committed results table no longer matches a fresh run.",
    evidence: [
      { project: "jobpost-extractor", text: "Results table regenerated in CI; runs below 90% completion are shown as incomplete" },
      { project: "rbi-rag", text: "Recall@k, MRR, nDCG, NLI faithfulness and bootstrap CIs in one harness" },
    ],
  },
  {
    id: "refuse",
    title: "Know when to say “I don’t know”",
    body: "A system that answers everything is a liability. My RAG system refuses below a calibrated confidence threshold, and my extractor returns null instead of guessing a missing value.",
    evidence: [
      { project: "rbi-rag", text: "Refusal gate on the reranker score, τ tuned for F0.5 on a document-level dev split" },
      { project: "jobpost-extractor", text: "Missing fields must be null or [], scored with a hallucination-rate metric" },
    ],
  },
  {
    id: "decide",
    title: "Optimise the decision, not the metric",
    body: "A 0.5 threshold is a default, not a decision. I tie the cutoff to what an error actually costs, and I recommend against launching a change when the economics say no, even if the result is statistically significant.",
    evidence: [
      { project: "credit-default", text: "Cost-optimal threshold: −26% expected cost per applicant vs the 0.5 default" },
      { project: "olist-analytics", text: "Significant uplift, but R$9.60 subsidy for R$1.44 revenue, so the call was do not launch" },
    ],
  },
  {
    id: "leakage",
    title: "Prevent leakage by construction",
    body: "Splits are built so that leakage cannot happen: document-level for RAG, template- and company-disjoint for synthetic data, identity-grouped for faces, point-in-time for churn features. Each split has a test.",
    evidence: [
      { project: "jobpost-extractor", text: "MinHash LSH de-duplication plus template-family-disjoint splits" },
      { project: "deepfake-detection", text: "Train/test splits grouped by identity for FaceForensics++ and Celeb-DF" },
    ],
  },
  {
    id: "ship",
    title: "Ship it, then keep it honest",
    body: "A model is not done until it is containerised, load-tested and monitored. A promotion gate blocks regressions, drift triggers retraining, and a weekly job smoke-tests the live endpoint.",
    evidence: [
      { project: "credit-default", text: "MLflow gate rejects a challenger whose PR-AUC is more than 0.005 below production" },
      { project: "credit-default", text: "Locust load test: 5,543 requests, 0 failures, p95 170 ms" },
    ],
  },
] as const;
