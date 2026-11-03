/**
 * Tokenisation for the in-browser retriever.
 * Deliberately small and dependency-free: lowercase, strip accents,
 * split on non-alphanumerics, drop stopwords, light suffix stemming.
 */

const STOPWORDS = new Set(
  (
    "a an and are as at be been but by can could did do does for from had has have how i if in into is it its " +
    "me my of on or our so than that the their them then there these they this to too was we were what when " +
    "where which who whom why will with would you your yours he she his her about any all also just more most " +
    "some such only own same very s t don should now use used using tell show give does did done much many " +
    "project projects work worked srinivasan srini " +
    // conversational filler: "do you know X", "are you familiar with X", "can you explain X"
    "know knows familiar explain describe please hi hello hey"
  ).split(/\s+/),
);

/** Very light English stemmer: enough to match "models"/"model", "retrieval"/"retrieve" style pairs. */
export function stem(word: string): string {
  if (word.length <= 3 || /\d/.test(word)) return word;
  const rules: Array<[RegExp, string]> = [
    [/ational$/, "ate"],
    [/ization$/, "ize"],
    [/ingly$/, ""],
    [/edly$/, ""],
    [/ies$/, "y"],
    [/ied$/, "y"],
    [/ing$/, ""],
    [/ed$/, ""],
    [/ers$/, "er"],
    [/es$/, "e"],
    [/s$/, ""],
  ];
  for (const [re, rep] of rules) {
    if (re.test(word)) {
      const out = word.replace(re, rep);
      return out.length >= 3 ? out : word;
    }
  }
  return word;
}

export function normalise(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Raw word split, before stopword removal. Keeps tokens like "f1", "k8s", "0.778". */
export function words(text: string): string[] {
  return normalise(text).match(/[a-z0-9]+(?:\.[0-9]+)?/g) ?? [];
}

export function tokenize(text: string): string[] {
  return words(text)
    .filter((w) => !STOPWORDS.has(w) && (w.length > 1 || /\d/.test(w)))
    .map(stem);
}

/** Character n-grams of each word, padded with boundary markers, e.g. "rag" -> "#ra","rag","ag#". */
export function charNgrams(text: string, n = 3): string[] {
  const grams: string[] = [];
  for (const w of words(text)) {
    if (STOPWORDS.has(w)) continue;
    const padded = `#${w}#`;
    if (padded.length <= n) {
      grams.push(padded);
      continue;
    }
    for (let i = 0; i + n <= padded.length; i++) grams.push(padded.slice(i, i + n));
  }
  return grams;
}
