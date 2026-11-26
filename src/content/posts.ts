/** Technical write-ups. Bodies live in src/content/posts/<slug>.md; every number comes from the linked repository's committed results. */
export interface Post {
  slug: string;
  title: string;
  date: string; // ISO date
  summary: string;
  project: { slug: string; label: string };
  tags: string[];
}

export const posts: Post[] = [
  {
    slug: "bm25-beat-my-hybrid-rag",
    title: "BM25 beat my hybrid RAG pipeline. Here's the evidence.",
    date: "2026-11-26",
    summary:
      "108 retrieval configurations, tuned on one split and tested on another with paired significance tests: the textbook hybrid + reranker stack scored 0.172 nDCG@10 below plain BM25, and the reranker found a better job as an abstention gate.",
    project: { slug: "rbi-rag", label: "RBI Regulations Q&A" },
    tags: ["RAG", "Evaluation", "Information retrieval"],
  },
  {
    slug: "synthetic-99-real-56",
    title: "My fine-tuned LLM scored 99.3% on synthetic data. On real job posts it scored 56.1%.",
    date: "2026-11-26",
    summary:
      "A LoRA fine-tune of a 0.5B model looked perfect on its synthetic test set. A licence-checked set of 130 real postings told a different story, and showed which gains were real: far fewer hallucinated fields than a 6× larger model.",
    project: { slug: "jobpost-extractor", label: "Job-post to JSON extractor" },
    tags: ["LLM fine-tuning", "Evaluation", "Structured extraction"],
  },
];

export const postBySlug = (slug: string) => posts.find((p) => p.slug === slug);
