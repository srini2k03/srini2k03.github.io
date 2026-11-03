import { BM25, CharNgramTfidf, reciprocalRankFusion, type Ranked } from "./retrievers";
import type { CorpusDoc } from "./corpus";
import { tokenize } from "./tokenize";

/**
 * Refusal gate parameters. Tuned on DEV_QUERIES only (see eval.ts); reported
 * metrics come from the disjoint TEST_QUERIES split.
 */
export interface Gate {
  /** Minimum fraction of query terms that must exist in the corpus vocabulary. */
  minCoverage: number;
  /** Minimum top char-trigram cosine similarity. */
  minSimilarity: number;
}

/** Middle of the dev-accuracy plateau (see gate.test.ts for the sweep). */
export const GATE: Gate = { minCoverage: 0.5, minSimilarity: 0.1 };

export interface AskResult {
  query: string;
  tokens: string[];
  bm25: Ranked[];
  ngram: Ranked[];
  fused: Ranked[];
  coverage: number;
  similarity: number;
  answered: boolean;
  reason: string;
  ms: number;
}

export class PortfolioRetriever {
  readonly bm25: BM25;
  readonly ngram: CharNgramTfidf;
  readonly byId: Map<string, CorpusDoc>;

  constructor(readonly docs: CorpusDoc[]) {
    this.bm25 = new BM25(docs);
    this.ngram = new CharNgramTfidf(docs);
    this.byId = new Map(docs.map((d) => [d.id, d]));
  }

  ask(query: string, k = 5, gate: Gate = GATE): AskResult {
    const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
    const tokens = tokenize(query);
    const bm25 = this.bm25.search(query, 20);
    const ngram = this.ngram.search(query, 20);
    const fused = reciprocalRankFusion([bm25, ngram], 60, k);
    const coverage = this.bm25.coverage(query);
    const similarity = ngram[0]?.score ?? 0;

    let answered = true;
    let reason = "Enough of the question matches the portfolio to answer from sources.";
    if (tokens.length === 0) {
      answered = false;
      reason = "The question has no searchable terms.";
    } else if (coverage < gate.minCoverage) {
      answered = false;
      reason = `Only ${Math.round(coverage * 100)}% of the query terms appear anywhere in the portfolio (gate: ${gate.minCoverage * 100}%).`;
    } else if (similarity < gate.minSimilarity) {
      answered = false;
      reason = `Best match similarity ${similarity.toFixed(2)} is below the gate (${gate.minSimilarity}).`;
    }

    const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
    return { query, tokens, bm25: bm25.slice(0, k), ngram: ngram.slice(0, k), fused, coverage, similarity, answered, reason, ms: t1 - t0 };
  }
}
