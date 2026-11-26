# Open-source contributions (staging)

Files prepared for upstream submissions. They are kept here only until the issue / pull request is
opened upstream.

- `stlite/ISSUE.md`: bug report for [whitphx/stlite](https://github.com/whitphx/stlite) (theme font
  with a URL crashes the app in HelmetDispatcher). Live reproduction:
  https://srini2k03.github.io/repro/stlite-theme-font.html
- `rank_bm25/`: pull request for [dorianbrown/rank_bm25](https://github.com/dorianbrown/rank_bm25)
  (postings index for `get_scores()`, 9–26x faster, scores bit-for-bit identical). `rank_bm25.py` is
  the upstream file (Apache-2.0) with the change applied; `test_term_frequencies.py` goes in
  `tests/`; `PR.md` is the pull-request description.
