I fine-tuned a small language model to turn messy Indian job posts (WhatsApp forwards, Hinglish, "CTC 8–12 LPA") into one strict JSON object with 11 fields: role, company, salary, experience, locations, skills and so on. Fields the post doesn't mention should come back `null`, not guessed.

The model is **Qwen2.5-0.5B-Instruct** with LoRA, trained on CPU in GitHub Actions and quantised to a 0.40 GB GGUF that runs in the browser.

## The number that looked great

I trained and tested on synthetic data: 3,000 posts generated from templates, with labels known exactly by construction. To stop the model memorising templates, I split train and test by **template family and company** and de-duplicated with MinHash.

On 471 held-out synthetic posts:

- micro-F1 went from **71.6%** (base model) to **99.3%**;
- hallucinated fields dropped from **67.1%** to **1.9%**;
- it beat GPT-OSS-120B with few-shot prompting (97.9%).

That's the kind of number that ends up on a CV. It's also the kind I didn't trust.

## Building a real test set

I collected **130 real Indian job postings**. My rule was to read a dataset's licence before reading any of its rows, which ruled out several sources:

- a scrape whose dataset card said it bypassed anti-bot protection;
- a set whose descriptions had been rewritten by an LLM.

The 130 posts come from 4 sources with clear licences. I labelled them with documented annotation rules (AI-assisted, not yet human-verified) and allowed alternative answers where a field is genuinely ambiguous.

## The real result

| Approach | Micro-F1 | Hallucinated fields |
|---|---|---|
| Base 0.5B, zero-shot | 32.0% | 58.4% |
| Base 1.5B, zero-shot | 50.2% | 35.4% |
| Base 3B, zero-shot | 56.4% | 30.3% |
| Regex rules | 60.4% | 5.5% |
| **My fine-tune (F16)** | **56.1%** | **7.9%** |
| My fine-tune (4-bit + JSON grammar) | 56.9% | 7.9% |

**99.3% became 56.1%.** Real posts are much harder than my templates, and the model's weak spots showed up:

- **Skill lists:** F1 only 32–36%.
- **Locations:** filled with state codes, country codes and even company names.
- **Education:** often missed.

## What still held up

The fine-tune didn't win outright, but the gains that matter most survived:

- **Hallucinations stayed low.** 7.9% of fields invented, against 58.4% for its own base model and 30.3% for a 6× larger 3B model.
- **It matched the 3B model** on micro-F1 (56.1% vs 56.4%) at a sixth of the size.
- **It reads better than regex.** The regex rules lead on micro-F1 only because skill and location list items dominate that metric. On fields that need actual reading, regex falls far behind: role 52% vs 82%, company 34% vs 81%.

## Making it honest about uncertainty

A wrong value with a confident face is worse than a `null`. So I added two things:

1. **Evidence spans.** Every extracted value is traced to the text it came from (exact, alias, parsed, fuzzy or none). Values with no support are flagged.
2. **Calibrated confidence.** I aligned token log-probabilities to each JSON field and fitted a calibrator on the *validation* set only. On real posts, calibration error (ECE) fell from 0.20 to 0.10 (AUROC 0.88). Abstaining below the threshold raised the accuracy of the kept fields from 76.4% to 86.0%, while keeping 87.9% of them.

One more fix came from looking at real outputs. With the JSON grammar on, 5 of 130 outputs looped on a list until the token limit. Capping list lengths in the grammar took valid JSON from 96.2% to 100%.

## What I took away

- **Synthetic test sets measure your generator, not your model.** Keep one, but don't stop there.
- **Look past the headline metric.** Micro-F1 made regex look best; per-field scores and hallucination rate told the real story.
- **Report the drop.** "99% on synthetic, 56% on real, and here's why" says more about your engineering than 99% alone.

Still to do: human-verify the 130 labels, and harden the model against prompt-injection text inside posts. Injected values currently reach the output in 33–42% of injection cases.

Code, data card, real test set and all results: https://github.com/srini2k03/jobpost-extractor-qlora
Live demo (the model runs in your browser): https://srini2k03.github.io/jobpost-extractor-qlora/
