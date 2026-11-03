import { charNgrams, tokenize } from "./tokenize";

export interface Doc {
  id: string;
  title: string;
  text: string;
  /** Optional extra field weighted into the index (tags, stack, etc.). */
  keywords?: string;
}

export interface Ranked {
  id: string;
  score: number;
  rank: number;
}

function counts(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

function toRanked(scores: Map<string, number>, k: number): Ranked[] {
  return [...scores.entries()]
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, k)
    .map(([id, score], i) => ({ id, score, rank: i + 1 }));
}

const docText = (d: Doc) => `${d.title} ${d.title} ${d.keywords ?? ""} ${d.text}`;

/**
 * Okapi BM25 over word tokens (Lucene-style IDF, always non-negative).
 */
export class BM25 {
  private readonly tf: Array<Map<string, number>>;
  private readonly len: number[];
  private readonly df = new Map<string, number>();
  private readonly avgdl: number;
  readonly vocab = new Set<string>();

  constructor(
    private readonly docs: Doc[],
    private readonly k1 = 1.2,
    private readonly b = 0.75,
  ) {
    this.tf = docs.map((d) => counts(tokenize(docText(d))));
    this.len = this.tf.map((m) => [...m.values()].reduce((a, c) => a + c, 0));
    this.avgdl = this.len.reduce((a, c) => a + c, 0) / Math.max(1, docs.length);
    for (const m of this.tf) {
      for (const term of m.keys()) {
        this.df.set(term, (this.df.get(term) ?? 0) + 1);
        this.vocab.add(term);
      }
    }
  }

  idf(term: string): number {
    const n = this.docs.length;
    const df = this.df.get(term) ?? 0;
    return Math.log(1 + (n - df + 0.5) / (df + 0.5));
  }

  search(query: string, k = 10): Ranked[] {
    const q = [...new Set(tokenize(query))];
    const scores = new Map<string, number>();
    this.docs.forEach((d, i) => {
      const tf = this.tf[i]!;
      const dl = this.len[i]!;
      let s = 0;
      for (const term of q) {
        const f = tf.get(term);
        if (!f) continue;
        s += (this.idf(term) * (f * (this.k1 + 1))) / (f + this.k1 * (1 - this.b + (this.b * dl) / this.avgdl));
      }
      scores.set(d.id, s);
    });
    return toRanked(scores, k);
  }

  /** Fraction of (deduplicated) query terms that exist anywhere in the corpus. */
  coverage(query: string): number {
    const q = [...new Set(tokenize(query))];
    if (q.length === 0) return 0;
    return q.filter((t) => this.vocab.has(t)).length / q.length;
  }
}

/**
 * TF-IDF cosine over character trigrams: tolerant to typos and
 * spacing ("lightgbm" ~ "light gbm", "retreival" ~ "retrieval").
 */
export class CharNgramTfidf {
  private readonly vecs: Array<Map<string, number>>;
  private readonly idf = new Map<string, number>();

  constructor(private readonly docs: Doc[]) {
    const tfs = docs.map((d) => counts(charNgrams(docText(d))));
    const df = new Map<string, number>();
    for (const m of tfs) for (const g of m.keys()) df.set(g, (df.get(g) ?? 0) + 1);
    const n = docs.length;
    for (const [g, c] of df) this.idf.set(g, Math.log((1 + n) / (1 + c)) + 1);
    this.vecs = tfs.map((m) => this.weigh(m));
  }

  private weigh(tf: Map<string, number>): Map<string, number> {
    const v = new Map<string, number>();
    let norm = 0;
    for (const [g, c] of tf) {
      const w = (1 + Math.log(c)) * (this.idf.get(g) ?? 0);
      if (w === 0) continue;
      v.set(g, w);
      norm += w * w;
    }
    norm = Math.sqrt(norm) || 1;
    for (const [g, w] of v) v.set(g, w / norm);
    return v;
  }

  search(query: string, k = 10): Ranked[] {
    const q = this.weigh(counts(charNgrams(query)));
    const scores = new Map<string, number>();
    this.docs.forEach((d, i) => {
      const v = this.vecs[i]!;
      let dot = 0;
      for (const [g, w] of q) dot += w * (v.get(g) ?? 0);
      scores.set(d.id, dot);
    });
    return toRanked(scores, k);
  }
}

/**
 * Reciprocal Rank Fusion (Cormack et al., 2009): score(d) = sum_r 1 / (k + rank_r(d)).
 */
export function reciprocalRankFusion(lists: Ranked[][], k = 60, topK = 10): Ranked[] {
  const scores = new Map<string, number>();
  for (const list of lists) {
    for (const r of list) scores.set(r.id, (scores.get(r.id) ?? 0) + 1 / (k + r.rank));
  }
  return toRanked(scores, topK);
}
