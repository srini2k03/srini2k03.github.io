import { describe, expect, it } from "vitest";
import { buildCorpus } from "./corpus";
import { PortfolioRetriever } from "./engine";
import { DEV_QUERIES, TEST_QUERIES, evaluate } from "./eval";

const retriever = new PortfolioRetriever(buildCorpus());

describe("portfolio corpus", () => {
  it("has unique ids and non-empty text", () => {
    const docs = buildCorpus();
    expect(new Set(docs.map((d) => d.id)).size).toBe(docs.length);
    for (const d of docs) expect(d.text.trim().length).toBeGreaterThan(0);
  });
});

describe("eval splits", () => {
  it("dev and test queries are disjoint", () => {
    const dev = new Set(DEV_QUERIES.map((q) => q.q));
    for (const t of TEST_QUERIES) expect(dev.has(t.q)).toBe(false);
  });
});

describe("PortfolioRetriever", () => {
  it("answers an in-scope question with a matching citation", () => {
    const res = retriever.ask("what reranker does the RAG system use");
    expect(res.answered).toBe(true);
    const top3 = res.fused.slice(0, 3).map((r) => retriever.byId.get(r.id)?.source);
    expect(top3).toContain("rbi-rag");
  });

  it("refuses an out-of-scope question", () => {
    expect(retriever.ask("what is the capital of peru").answered).toBe(false);
    expect(retriever.ask("").answered).toBe(false);
  });

  it("meets quality bars on the dev split", () => {
    const r = evaluate(retriever, DEV_QUERIES);
    expect(r.recallAt3).toBeGreaterThanOrEqual(0.9);
    expect(r.refusalRecall).toBeGreaterThanOrEqual(0.8);
  });

  it("meets quality bars on the held-out test split", () => {
    const r = evaluate(retriever, TEST_QUERIES);
    // Printed so CI logs show the actual held-out numbers.
    console.info("held-out eval", r);
    expect(r.recallAt3).toBeGreaterThanOrEqual(0.8);
    expect(r.refusalRecall).toBeGreaterThanOrEqual(0.8);
  });
});
