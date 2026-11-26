**Title:** Speed up get_scores() 9–26x with a lazily built postings index (scores bit-for-bit identical)

### What
`get_scores()` builds each query term's frequency vector with a Python loop over every document:

```python
q_freq = np.array([(doc.get(q) or 0) for doc in self.doc_freqs])
```

That loop dominates query time and grows linearly with the corpus. This PR builds a postings index
(word → document indices and term frequencies) the first time `get_scores()` is called, and fills
the same vector with one NumPy assignment that only touches documents containing the word:

```python
q_freq = self._term_frequencies(q)   # np.zeros(corpus_size); q_freq[doc_ids] = freqs
```

The scoring formulas of `BM25Okapi`, `BM25L` and `BM25Plus` are unchanged. Term frequencies are
small integers, exactly representable as floats, so **the returned scores are bit-for-bit identical**.
`get_batch_scores()` already loops only over the requested `doc_ids`, so it is left as is.

### Results
Synthetic Zipf-distributed corpus (30k-word vocabulary, 40–200 tokens per document), 100 queries
of 3–8 terms, median `BM25Okapi.get_scores()` time, NumPy 2.3, Python 3.12, 4-vCPU Linux:

| Documents | Before | After | Speed-up | One-off index build | Extra memory |
|---|---|---|---|---|---|
| 2,000 | 1.50 ms | 0.17 ms | 8.9x | 0.09 s | ~9 MB |
| 20,000 | 22.85 ms | 1.04 ms | 22.1x | 0.61 s | ~23 MB |
| 100,000 | 142.60 ms | 5.57 ms | 25.6x | 3.08 s | ~78 MB |

Every one of the 300 benchmark queries returned an array equal to the original (`np.array_equal`).

### Compatibility
- No API change and no new dependency.
- The index is built lazily, so users who only call `get_batch_scores()` pay nothing, and the
  memory cost (int32 arrays) is only incurred when `get_scores()` is used.
- Objects pickled by an earlier version (without `_postings`) still work: the index is built on
  first use.

### Tests
`tests/test_term_frequencies.py` checks, for all three variants, that scores equal those of a
subclass using the original per-document loop, on 53 queries including empty, unknown and
repeated terms; and that an object without the index (as if unpickled from an older version)
still scores correctly. `pytest`: 4 passed.
