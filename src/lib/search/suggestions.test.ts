import { describe, expect, it } from "vitest";
import { buildCorpus } from "./corpus";
import { PortfolioRetriever } from "./engine";

// The example chips in the UI must demonstrate what they claim to.
const retriever = new PortfolioRetriever(buildCorpus());

describe("lab suggestion chips", () => {
  it.each([
    "Which reranker does the RAG system use?",
    "How was the credit threshold chosen?",
    "How do you prevent data leakage?",
    "Where did you intern?",
  ])("answers: %s", (q) => expect(retriever.ask(q).answered).toBe(true));

  it.each(["Do you know Kubernetes?", "Can you recommend a good movie?"])("refuses: %s", (q) => expect(retriever.ask(q).answered).toBe(false));

  it("documents the known lexical-gate failure shown in the UI", () => {
    // If this starts refusing, the gate improved: update the "known failure" copy in ask-lab.tsx.
    expect(retriever.ask("Best biryani in Bangalore?").answered).toBe(true);
  });
});
