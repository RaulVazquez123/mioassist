// src/lib/languageModel.js
const ALPHABET = Array.from("abcdefghijklmnñopqrstuvwxyzáéíóúü ");

const CORPUS_FILES = [
  "/corpus/mexico.txt",
  "/corpus/mexico2.txt",
  "/corpus/mexico3.txt",
  "/corpus/shrek.txt",
  "/corpus/huevos.txt"
];

const DICTIONARY_FILE = "/corpus/diccionario.txt";

const LAMBDAS = {
  fourgram: 0.60,
  trigram:  0.22,
  bigram:   0.12,
  unigram:  0.06,
};

const LETTER_WORD_BLEND = {
  charModel: 0.72,
  wordModel: 0.28,
};

const WORD_SCORE_WEIGHTS = {
  logFreq:     0.28,
  prefix:      0.32,
  recency:     0.15,
  wordContext: 0.25,
};

const KN_DISCOUNT = 0.75;
const SPACE_PENALTY_WHEN_IN_WORD = 0.1;

let MODEL_READY = false;

let UNIGRAM_COUNTS  = {};
let BIGRAM_COUNTS   = {};
let TRIGRAM_COUNTS  = {};
let FOURGRAM_COUNTS = {};

let TOTAL_UNIGRAMS  = 0;
let BIGRAM_TOTALS   = {};
let TRIGRAM_TOTALS  = {};
let FOURGRAM_TOTALS = {};

let KN_CONTINUATION_COUNTS = {};
let KN_TOTAL_BIGRAM_TYPES  = 0;

let DICTIONARY_WORDS  = [];
let DICTIONARY_BY_WORD = new Map();

let USER_RECENCY      = new Map();
let USER_RECENCY_TICK = 0;

let WORD_BIGRAM_COUNTS  = {};
let WORD_BIGRAM_TOTALS  = {};
let WORD_TRIGRAM_COUNTS = {};
let WORD_TRIGRAM_TOTALS = {};

export function cleanText(text = "") {
  return text
    .toLowerCase()
    .replace(/\n/g, " ")
    .replace(/[^a-záéíóúüñ\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getCurrentWord(rawText = "") {
  return (
    rawText
      .toLowerCase()
      .split(" ")
      .pop()
      ?.replace(/[^a-záéíóúüñ]/g, "") || ""
  );
}

function getPreviousWord(rawText = "") {
  const cleaned = cleanText(rawText);
  if (!cleaned) return "";
  const words = cleaned.split(" ").filter(Boolean);
  const currentWord = getCurrentWord(rawText);
  if (currentWord && words.length >= 2) return words[words.length - 2];
  if (!currentWord && words.length >= 1) return words[words.length - 1];
  return "";
}

function getPreviousTwoWords(rawText = "") {
  const cleaned = cleanText(rawText);
  if (!cleaned) return { w1: "", w2: "" };
  const words = cleaned.split(" ").filter(Boolean);
  const currentWord = getCurrentWord(rawText);
  const offset = currentWord ? 1 : 0;
  const w2 = words.length >= 1 + offset ? words[words.length - 1 - offset] : "";
  const w1 = words.length >= 2 + offset ? words[words.length - 2 - offset] : "";
  return { w1, w2 };
}

function tokenizeWords(text = "") {
  const cleaned = cleanText(text);
  if (!cleaned) return [];
  return cleaned.split(" ").filter(Boolean);
}

async function loadTextFile(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar ${path} (${res.status})`);
  const text = await res.text();
  const suspicious = text.slice(0, 300).toLowerCase();
  if (
    suspicious.includes("<!doctype html") ||
    suspicious.includes("<html") ||
    suspicious.includes("<head") ||
    suspicious.includes("<body")
  ) {
    throw new Error(`La ruta ${path} regresó HTML en vez de texto plano`);
  }
  return text;
}

function trainCharacterModel(text) {
  const cleaned = cleanText(text);

  const unigramCounts  = {};
  const bigramCounts   = {};
  const trigramCounts  = {};
  const fourgramCounts = {};
  const bigramTotals   = {};
  const trigramTotals  = {};
  const fourgramTotals = {};
  const continuationSets = {};

  let totalUnigrams = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    unigramCounts[ch] = (unigramCounts[ch] || 0) + 1;
    totalUnigrams++;
  }

  for (let i = 0; i < cleaned.length - 1; i++) {
    const ctx  = cleaned[i];
    const next = cleaned[i + 1];
    if (!bigramCounts[ctx]) bigramCounts[ctx] = {};
    bigramCounts[ctx][next] = (bigramCounts[ctx][next] || 0) + 1;
    bigramTotals[ctx] = (bigramTotals[ctx] || 0) + 1;

    if (!continuationSets[next]) continuationSets[next] = new Set();
    continuationSets[next].add(ctx);
  }

  for (let i = 0; i < cleaned.length - 2; i++) {
    const ctx  = cleaned.slice(i, i + 2);
    const next = cleaned[i + 2];
    if (!trigramCounts[ctx]) trigramCounts[ctx] = {};
    trigramCounts[ctx][next] = (trigramCounts[ctx][next] || 0) + 1;
    trigramTotals[ctx] = (trigramTotals[ctx] || 0) + 1;
  }

  for (let i = 0; i < cleaned.length - 3; i++) {
    const ctx  = cleaned.slice(i, i + 3);
    const next = cleaned[i + 3];
    if (!fourgramCounts[ctx]) fourgramCounts[ctx] = {};
    fourgramCounts[ctx][next] = (fourgramCounts[ctx][next] || 0) + 1;
    fourgramTotals[ctx] = (fourgramTotals[ctx] || 0) + 1;
  }

  const continuationCounts = {};
  let totalBigramTypes = 0;
  for (const [ch, set] of Object.entries(continuationSets)) {
    continuationCounts[ch] = set.size;
    totalBigramTypes += set.size;
  }

  return {
    unigramCounts, bigramCounts, trigramCounts, fourgramCounts,
    totalUnigrams, bigramTotals, trigramTotals, fourgramTotals,
    continuationCounts, totalBigramTypes,
  };
}

function trainWordNgramModel(text) {
  const words = tokenizeWords(text);

  const bigramCounts  = {};
  const bigramTotals  = {};
  const trigramCounts = {};
  const trigramTotals = {};

  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    if (!bigramCounts[w1]) bigramCounts[w1] = {};
    bigramCounts[w1][w2] = (bigramCounts[w1][w2] || 0) + 1;
    bigramTotals[w1] = (bigramTotals[w1] || 0) + 1;
  }

  for (let i = 0; i < words.length - 2; i++) {
    const key = words[i] + " " + words[i + 1];
    const w3  = words[i + 2];
    if (!trigramCounts[key]) trigramCounts[key] = {};
    trigramCounts[key][w3] = (trigramCounts[key][w3] || 0) + 1;
    trigramTotals[key] = (trigramTotals[key] || 0) + 1;
  }

  return { bigramCounts, bigramTotals, trigramCounts, trigramTotals };
}

function parseNumberLoose(value = "") {
  if (!value) return null;
  const cleaned = value.replace(/,/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function parseDictionaryText(text = "") {
  const lines = text.split("\n");
  const entries = [];

  for (const line of lines) {
    const raw = line.trim().toLowerCase();
    if (!raw) continue;

    const rankedMatch = raw.match(/^\s*\d+\.?\s+([a-záéíóúüñ]+)\s+([\d,]+(?:\.\d+)?)/);
    if (rankedMatch) {
      entries.push({ word: rankedMatch[1], freq: parseNumberLoose(rankedMatch[2]) ?? 1 });
      continue;
    }

    const plainWord = raw.match(/\b([a-záéíóúüñ]{2,})\b/i);
    if (plainWord?.[1]) entries.push({ word: plainWord[1], freq: 1 });
  }

  const bestByWord = new Map();
  for (const entry of entries) {
    const prev = bestByWord.get(entry.word);
    if (!prev || entry.freq > prev.freq) bestByWord.set(entry.word, entry);
  }

  const deduped = Array.from(bestByWord.values());
  const maxFreq = deduped.reduce((m, x) => Math.max(m, x.freq || 1), 1);

  return deduped
    .map((entry) => ({
      word:     entry.word,
      freq:     entry.freq,
      normFreq: entry.freq / maxFreq,
      logFreq:  Math.log1p(entry.freq),
    }))
    .sort((a, b) => b.freq - a.freq);
}

function knUnigramProb(letter) {
  const cont = KN_CONTINUATION_COUNTS[letter] || 0;
  if (KN_TOTAL_BIGRAM_TYPES === 0) return 1 / ALPHABET.length;
  return cont / KN_TOTAL_BIGRAM_TYPES;
}

function knBigramProb(ctx1, letter) {
  const count = BIGRAM_COUNTS?.[ctx1]?.[letter] || 0;
  const total = BIGRAM_TOTALS?.[ctx1] || 0;
  if (total === 0) return knUnigramProb(letter);
  const discounted = Math.max(count - KN_DISCOUNT, 0) / total;
  const uniqueSuccessors = Object.keys(BIGRAM_COUNTS[ctx1] || {}).length;
  const lambda = (KN_DISCOUNT / total) * uniqueSuccessors;
  return discounted + lambda * knUnigramProb(letter);
}

function knTrigramProb(ctx2, letter) {
  const count = TRIGRAM_COUNTS?.[ctx2]?.[letter] || 0;
  const total = TRIGRAM_TOTALS?.[ctx2] || 0;
  const ctx1  = ctx2.slice(-1);
  if (total === 0) return knBigramProb(ctx1, letter);
  const discounted = Math.max(count - KN_DISCOUNT, 0) / total;
  const uniqueSuccessors = Object.keys(TRIGRAM_COUNTS[ctx2] || {}).length;
  const lambda = (KN_DISCOUNT / total) * uniqueSuccessors;
  return discounted + lambda * knBigramProb(ctx1, letter);
}

function knFourgramProb(ctx3, letter) {
  const count = FOURGRAM_COUNTS?.[ctx3]?.[letter] || 0;
  const total = FOURGRAM_TOTALS?.[ctx3] || 0;
  const ctx2  = ctx3.slice(-2);
  if (total === 0) return knTrigramProb(ctx2, letter);
  const discounted = Math.max(count - KN_DISCOUNT, 0) / total;
  const uniqueSuccessors = Object.keys(FOURGRAM_COUNTS[ctx3] || {}).length;
  const lambda = (KN_DISCOUNT / total) * uniqueSuccessors;
  return discounted + lambda * knTrigramProb(ctx2, letter);
}

function interpolatedCharProb(cleanedText, letter) {
  const p1 = knUnigramProb(letter);
  if (cleanedText.length === 0) return p1;
  if (cleanedText.length === 1) {
    const p2 = knBigramProb(cleanedText.slice(-1), letter);
    return LAMBDAS.bigram * p2 + LAMBDAS.unigram * p1;
  }
  if (cleanedText.length === 2) {
    const p3 = knTrigramProb(cleanedText.slice(-2), letter);
    const p2 = knBigramProb(cleanedText.slice(-1), letter);
    return LAMBDAS.trigram * p3 + LAMBDAS.bigram * p2 + LAMBDAS.unigram * p1;
  }
  const p4 = knFourgramProb(cleanedText.slice(-3), letter);
  const p3 = knTrigramProb(cleanedText.slice(-2), letter);
  const p2 = knBigramProb(cleanedText.slice(-1), letter);
  return (
    LAMBDAS.fourgram * p4 +
    LAMBDAS.trigram  * p3 +
    LAMBDAS.bigram   * p2 +
    LAMBDAS.unigram  * p1
  );
}

export function registerWordUsage(word) {
  const cleaned = cleanText(word);
  if (!cleaned) return;
  USER_RECENCY_TICK++;
  USER_RECENCY.set(cleaned, USER_RECENCY_TICK);
  if (USER_RECENCY.size > 200) {
    const sorted = Array.from(USER_RECENCY.entries()).sort((a, b) => a[1] - b[1]);
    for (const [oldWord] of sorted.slice(0, 50)) USER_RECENCY.delete(oldWord);
  }
}

function getRecencyBoost(word) {
  const tick = USER_RECENCY.get(word);
  if (!tick) return 0;
  const age = USER_RECENCY_TICK - tick;
  if (age <= 0) return 1;
  return 1 / (1 + age * 0.15);
}

function getPrefixCandidates(prefix) {
  if (!prefix) return [];
  return DICTIONARY_WORDS.filter((entry) => entry.word.startsWith(prefix));
}

function getNextLetterDistributionFromPrefix(prefix) {
  const candidates = getPrefixCandidates(prefix);
  if (!candidates.length) return null;

  const counts = {};
  let total = 0;

  for (const entry of candidates) {
    const nextChar = entry.word.length > prefix.length ? entry.word[prefix.length] : " ";
    const recency  = getRecencyBoost(entry.word);
    const weight   = (entry.normFreq || 0.0001) + 0.15 * recency;
    counts[nextChar] = (counts[nextChar] || 0) + weight;
    total += weight;
  }

  if (!total) return null;

  const probs = {};
  for (const ch of Object.keys(counts)) probs[ch] = counts[ch] / total;
  return { probs, candidates };
}

function getWordContextProb(w1, w2, candidateWord) {
  if (w1 && w2) {
    const triKey   = w1 + " " + w2;
    const triCount = WORD_TRIGRAM_COUNTS?.[triKey]?.[candidateWord] || 0;
    const triTotal = WORD_TRIGRAM_TOTALS?.[triKey] || 0;
    if (triTotal > 0 && triCount > 0) return triCount / triTotal;
  }
  if (w2) {
    const biCount = WORD_BIGRAM_COUNTS?.[w2]?.[candidateWord] || 0;
    const biTotal = WORD_BIGRAM_TOTALS?.[w2] || 0;
    if (biTotal > 0) return biCount / biTotal;
  }
  return 0;
}

export async function loadLanguageModel() {
  if (MODEL_READY) return;

  let fullCorpus = "";
  for (const path of CORPUS_FILES) {
    try {
      const txt = await loadTextFile(path);
      fullCorpus += " " + txt;
      console.log(`✅ Corpus cargado: ${path}`);
    } catch (error) {
      console.error(`❌ ${error.message}`);
    }
  }

  if (!fullCorpus.trim()) throw new Error("No se cargó ningún corpus.");

  const trained = trainCharacterModel(fullCorpus);
  UNIGRAM_COUNTS         = trained.unigramCounts;
  BIGRAM_COUNTS          = trained.bigramCounts;
  TRIGRAM_COUNTS         = trained.trigramCounts;
  FOURGRAM_COUNTS        = trained.fourgramCounts;
  TOTAL_UNIGRAMS         = trained.totalUnigrams;
  BIGRAM_TOTALS          = trained.bigramTotals;
  TRIGRAM_TOTALS         = trained.trigramTotals;
  FOURGRAM_TOTALS        = trained.fourgramTotals;
  KN_CONTINUATION_COUNTS = trained.continuationCounts;
  KN_TOTAL_BIGRAM_TYPES  = trained.totalBigramTypes;

  const wordModel    = trainWordNgramModel(fullCorpus);
  WORD_BIGRAM_COUNTS  = wordModel.bigramCounts;
  WORD_BIGRAM_TOTALS  = wordModel.bigramTotals;
  WORD_TRIGRAM_COUNTS = wordModel.trigramCounts;
  WORD_TRIGRAM_TOTALS = wordModel.trigramTotals;

  try {
    const dictionaryText = await loadTextFile(DICTIONARY_FILE);
    DICTIONARY_WORDS     = parseDictionaryText(dictionaryText);
    DICTIONARY_BY_WORD   = new Map(DICTIONARY_WORDS.map((x) => [x.word, x]));
    console.log(`✅ Diccionario cargado: ${DICTIONARY_WORDS.length} palabras`);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    DICTIONARY_WORDS   = [];
    DICTIONARY_BY_WORD = new Map();
  }

  MODEL_READY = true;
}

export function isLanguageModelReady() {
  return MODEL_READY;
}

export function getTopLetters(text = "", topN = 5) {
  if (!MODEL_READY) return [];

  const cleaned     = cleanText(text);
  const currentWord = getCurrentWord(text);
  const endsInSpace = text.length > 0 && text[text.length - 1] === " ";

  // Si termina en espacio, no usar modelo de prefijo — predecir inicio de nueva palabra
  const prefixModel = endsInSpace ? null : getNextLetterDistributionFromPrefix(currentWord);

  const results = [];

  for (const letter of ALPHABET) {
    const charProb = interpolatedCharProb(cleaned, letter);
    const wordProb = prefixModel?.probs?.[letter] || 0;

    let finalProb =
      LETTER_WORD_BLEND.charModel * charProb +
      LETTER_WORD_BLEND.wordModel * wordProb;

    // Penalizar espacio si estamos en medio de una palabra
    if (
      currentWord &&
      !endsInSpace &&
      letter === " " &&
      prefixModel &&
      prefixModel.candidates.some((c) => c.word.length > currentWord.length)
    ) {
      finalProb *= SPACE_PENALTY_WHEN_IN_WORD;
    }

    // Penalizar doble espacio
    if (endsInSpace && letter === " ") {
      finalProb *= 0.05;
    }

    results.push({ letter, prob: finalProb, charProb, wordProb });
  }

  results.sort((a, b) => b.prob - a.prob);

  const top = results.slice(0, topN);
  const sum = top.reduce((acc, x) => acc + x.prob, 0) || 1;

  return top.map((item) => ({
    ...item,
    percent: Math.round((item.prob / sum) * 100),
  }));
}

export function getSuggestedWords(text = "", topN = 8) {
  if (!MODEL_READY) return [];

  const currentWord = getCurrentWord(text);
  if (!currentWord) return [];

  const { w1, w2 } = getPreviousTwoWords(text);

  const candidates = DICTIONARY_WORDS.filter((entry) =>
    entry.word.startsWith(currentWord)
  );

  const scored = candidates.map((entry) => {
    const prefixRatio     = currentWord.length / Math.max(entry.word.length, currentWord.length);
    const recency         = getRecencyBoost(entry.word);
    const wordContextProb = getWordContextProb(w1, w2, entry.word);

    const score =
      WORD_SCORE_WEIGHTS.logFreq     * entry.logFreq +
      WORD_SCORE_WEIGHTS.prefix      * prefixRatio +
      WORD_SCORE_WEIGHTS.recency     * recency +
      WORD_SCORE_WEIGHTS.wordContext * wordContextProb;

    return { ...entry, score, wordContextProb };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}

export function getTopLetterStrings(text = "", topN = 5) {
  return getTopLetters(text, topN).map((item) => item.letter);
}

export function getSuggestedWordStrings(text = "", topN = 8) {
  return getSuggestedWords(text, topN).map((item) => item.word);
}

export function getModelInfo() {
  return {
    ready:          MODEL_READY,
    dictionarySize: DICTIONARY_WORDS.length,
  };
}