I built a question-answering system over **2,153 Reserve Bank of India notifications**. I started with the textbook "advanced RAG" stack:

- BM25 for keyword matching
- BGE-small dense embeddings in Qdrant for semantic matching
- Reciprocal Rank Fusion (RRF) to merge the two lists
- A cross-encoder reranker on top

Every blog post said this hybrid stack beats plain keyword search. On my data, it didn't.

## How I tested it

I wanted a test that couldn't flatter whatever I believed going in.

- **Separate dev and test documents.** Questions were split by *document*, so no circular used for tuning appears in the test set. The test set has 130 answerable questions and 25 deliberately unanswerable ones.
- **Everything tuned on dev only.** Fusion weights, RRF's k, reranker depth and thresholds were chosen on the dev split and frozen before touching test.
- **17 strategy families, 108 configurations.** BM25, dense-only, RRF hybrids, weighted z-score fusion, RM3 query expansion, an RBI acronym dictionary, parent-child context, document-first retrieval, metadata filters and rerankers.
- **Paired significance tests.** Each strategy was compared with BM25 on the *same* questions using paired randomisation tests, with a Holm correction because I was testing many strategies at once.

## The result

Chunk-level nDCG@10 on the 130 test questions:

| Strategy | nDCG@10 | vs BM25 |
|---|---|---|
| BM25 + parent context | 0.715 | +0.017 (not significant) |
| Weighted hybrid (z-score, 0.7 / 0.3) | 0.704 | +0.006 (not significant) |
| **BM25** | **0.697** | baseline |
| BM25 + cross-encoder rerank | 0.663 | −0.035 |
| RRF hybrid (original) | 0.582 | −0.116 (p = 0.002) |
| **RRF hybrid + rerank (original)** | **0.525** | **−0.172 (p = 0.002)** |
| Dense only | 0.481 | −0.216 |

The pipeline I originally shipped was **0.172 nDCG@10 worse than plain BM25**, and the gap is statistically significant. Nothing I tried beat BM25 by a significant margin.

## Why, as far as I can tell

Regulatory questions reuse the exact wording of the circulars: "KYC updation", "Master Direction", specific paragraph numbers. Lexical matching is very good at that. The reranker is a general model trained on web search queries, and it reshuffled correct passages out of the top 5.

The failure analysis supports this. For BM25, 26 of its 28 misses were retrieved by a first-stage retriever but ranked just below the 5-passage context. It's a ranking problem, not a recall problem.

There's also a caveat that cuts the other way. My test questions were generated from source passages, so they may share more vocabulary with those passages than a real user's question would. That favours BM25. A human-written test set could narrow the gap, which is why I'm human-verifying the questions next.

## What I changed

The reranker hurt *ranking*, but it turned out to be excellent at a different job: telling answerable questions from unanswerable ones. Its top score separates them with **AUROC 0.952**, against 0.80 for the BM25 score.

So the served system now:

1. ranks with BM25;
2. uses the cross-encoder only as a **gate** that decides whether to answer or say "the documents don't establish this";
3. runs the same profile in the browser via transformers.js.

## A second surprise: the faithfulness numbers disagreed

On the same 195 answers, my LLM judge gave an average faithfulness of **0.97** and an NLI model gave **0.19**. One of them had to be wrong.

It was the setup. The NLI model reads at most 512 tokens, and **86% of my passages were longer**, so most of the evidence was cut off before it was checked. Checking each claim against short windows of the passage brought NLI faithfulness to **0.70–0.73**. I rebuilt the citation verifier on that basis: it now checks claim by claim and removes citations that don't support their sentence.

## What I'd tell anyone building RAG

- **Benchmark BM25 first.** It's a strong baseline, and on domain text with exact terminology it can be the best one.
- **Tune on one split, report on another.** Otherwise every "improvement" is partly overfitting.
- **Test significance.** Several of my "wins" were +0.006 nDCG and meant nothing.
- **When two metrics disagree, investigate before choosing one.** The disagreement was the most useful finding in the project.

Code, data splits, per-question results and the full 108-config table: https://github.com/srini2k03/rbi-circulars-rag
Live demo (runs in your browser): https://srini2k03.github.io/rbi-circulars-rag/
