import { describe, expect, it } from "vitest";
import { BM25, CharNgramTfidf, reciprocalRankFusion, type Doc, type Ranked } from "./retrievers";
import { charNgrams, stem, tokenize } from "./tokenize";

const docs: Doc[] = [
  { id: "rag", title: "Hybrid RAG", text: "BM25 and dense retrieval fused with reciprocal rank fusion, then a cross-encoder reranker." },
  { id: "credit", title: "Credit risk", text: "LightGBM classifier with a cost-optimal decision threshold and MLflow registry." },
  { id: "sql", title: "SQL analytics", text: "Window functions and CTEs on DuckDB and PostgreSQL over e-commerce orders." },
];

describe("tokenize", () => {
  it("lowercases, strips stopwords and stems", () => {
    expect(tokenize("The Models are Ranking documents")).toEqual(["model", "rank", "document"]);
  });
  it("keeps numbers and decimals", () => {
    expect(tokenize("ROC-AUC 0.778 on F1")).toEqual(["roc", "auc", "0.778", "f1"]);
  });
  it("strips accents", () => {
    expect(tokenize("São Paulo")).toEqual(["sao", "paulo"]);
  });
  it("stem never shortens below three characters", () => {
    expect(stem("uses")).toBe("use");
    expect(stem("bus")).toBe("bus");
  });
  it("char n-grams pad word boundaries", () => {
    expect(charNgrams("rag")).toEqual(["#ra", "rag", "ag#"]);
  });
});

describe("BM25", () => {
  const bm25 = new BM25(docs);
  it("ranks the document containing the query terms first", () => {
    const hits = bm25.search("cross-encoder reranker");
    expect(hits[0]?.id).toBe("rag");
  });
  it("returns nothing for out-of-vocabulary queries", () => {
    expect(bm25.search("biryani recipe")).toEqual([]);
  });
  it("assigns rarer terms a higher IDF", () => {
    expect(bm25.idf("lightgbm")).toBeGreaterThan(0);
    expect(bm25.idf("nonexistentterm")).toBeGreaterThan(bm25.idf("lightgbm"));
  });
  it("reports query coverage", () => {
    expect(bm25.coverage("lightgbm threshold")).toBe(1);
    expect(bm25.coverage("lightgbm pizza")).toBe(0.5);
    expect(bm25.coverage("")).toBe(0);
  });
});

describe("CharNgramTfidf", () => {
  const tfidf = new CharNgramTfidf(docs);
  it("is tolerant to typos", () => {
    expect(tfidf.search("postgress duckdb")[0]?.id).toBe("sql");
    expect(tfidf.search("retreival reranker")[0]?.id).toBe("rag");
  });
  it("produces cosine scores in [0, 1]", () => {
    for (const r of tfidf.search("lightgbm mlflow")) {
      expect(r.score).toBeGreaterThan(0);
      expect(r.score).toBeLessThanOrEqual(1 + 1e-9);
    }
  });
});

describe("reciprocalRankFusion", () => {
  const list = (ids: string[]): Ranked[] => ids.map((id, i) => ({ id, score: 1, rank: i + 1 }));
  it("rewards documents that rank well in both lists", () => {
    const fused = reciprocalRankFusion([list(["a", "b", "c"]), list(["b", "c", "a"])]);
    expect(fused[0]?.id).toBe("b");
  });
  it("matches the closed-form score", () => {
    const fused = reciprocalRankFusion([list(["a"]), list(["x", "a"])], 60);
    const a = fused.find((r) => r.id === "a");
    expect(a?.score).toBeCloseTo(1 / 61 + 1 / 62, 12);
  });
  it("handles empty inputs", () => {
    expect(reciprocalRankFusion([[], []])).toEqual([]);
  });
});
