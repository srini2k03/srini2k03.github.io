import { describe, expect, it } from "vitest";
import { buildCorpus } from "./corpus";
import { GATE, PortfolioRetriever } from "./engine";
import { DEV_QUERIES, evaluate, sweepGate } from "./eval";

describe("refusal gate calibration", () => {
  const retriever = new PortfolioRetriever(buildCorpus());

  it("the shipped gate sits on the dev-accuracy maximum of the sweep", () => {
    const rows = sweepGate(retriever, DEV_QUERIES);
    const best = Math.max(...rows.map((r) => r.accuracy));
    expect(evaluate(retriever, DEV_QUERIES).accuracy).toBe(best);
  });

  it("is not on the edge of the plateau (neighbours score the same)", () => {
    const here = evaluate(retriever, DEV_QUERIES).accuracy;
    for (const d of [-0.02, 0.02]) {
      const acc = evaluate(retriever, DEV_QUERIES, 3, { ...GATE, minSimilarity: GATE.minSimilarity + d }).accuracy;
      expect(acc).toBe(here);
    }
  });
});
