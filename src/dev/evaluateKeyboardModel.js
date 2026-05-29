// src/dev/evaluateKeyboardModel.js
//
// v3 — métricas mejoradas:
// 1. KSR potencial (sin costo de navegación) — techo teórico
// 2. KSR real con costo de navegación por posición en el diccionario
// 3. Desglose de ahorro por longitud de palabra (corta/media/larga)
// 4. Histograma de posición donde se resolvió la palabra

import {
  loadLanguageModel,
  getTopLetters,
  getSuggestedWords,
} from "../lib/languageModel.js";

function cleanText(text = "") {
  return text.toLowerCase().trim();
}

export async function runEvaluation() {
  console.log("⏳ Cargando modelo...");
  await loadLanguageModel();

  const res = await fetch("/test_phrases_500_es.json");
  if (!res.ok) throw new Error("No se pudo cargar /test_phrases_500_es.json");
  const phrases = await res.json();
  console.log(`→ ${phrases.length} frases`);
  console.log("🔢 Evaluando...");

  // ── Métricas de letras ──────────────────────────────────────────
  let totalLetters = 0;
  let correctTop5  = 0;

  // ── Métricas de palabras ────────────────────────────────────────
  let totalWords    = 0;
  let correctWords  = 0;

  // KSR potencial (sin navegación)
  let totalBaseline    = 0;
  let totalWithPotential = 0;

  // KSR real (con costo de navegación = posición en lista)
  let totalWithReal    = 0;

  // Desglose por longitud: corta (1-3), media (4-6), larga (7+)
  const byLength = {
    corta: { baseline: 0, potential: 0, real: 0, total: 0, resolved: 0 },
    media: { baseline: 0, potential: 0, real: 0, total: 0, resolved: 0 },
    larga: { baseline: 0, potential: 0, real: 0, total: 0, resolved: 0 },
  };

  // Histograma: con cuántas letras se resolvió la palabra
  const savingsByPosition = {};
  // Histograma: en qué posición del diccionario apareció
  const positionInList = {};

  for (const phrase of phrases) {
    const text  = cleanText(phrase);

    // ── Letras ──────────────────────────────────────────────────
    for (let i = 1; i < text.length; i++) {
      const context      = text.slice(0, i);
      const realNextChar = text[i];
      totalLetters++;
      const topLetters = getTopLetters(context, 5).map(x => x.letter);
      if (topLetters.includes(realNextChar)) correctTop5++;
    }

    // ── Palabras ────────────────────────────────────────────────
    const words = text.split(" ").filter(Boolean);
    let typedContext = "";

    for (const word of words) {
      totalWords++;
      totalBaseline += word.length;

      const bucket = word.length <= 3 ? "corta" : word.length <= 6 ? "media" : "larga";
      byLength[bucket].total++;
      byLength[bucket].baseline += word.length;

      let found    = false;
      let foundAt  = -1;
      let listPos  = -1;

      for (let i = 1; i <= word.length; i++) {
        const prefix      = word.slice(0, i);
        const context     = (typedContext + prefix).trim();
        const suggestions = getSuggestedWords(context, 8).map(x =>
          typeof x === "string" ? x : x.word
        );
        const idx = suggestions.indexOf(word);

        if (idx !== -1) {
          correctWords++;
          foundAt  = i;
          listPos  = idx;
          found    = true;

          // KSR potencial: costo = letras escritas + 1 (seleccionar)
          totalWithPotential += i + 1;
          byLength[bucket].potential += i + 1;

          // KSR real: costo = letras escritas + posición en lista + 1
          totalWithReal += i + idx + 1;
          byLength[bucket].real += i + idx + 1;

          byLength[bucket].resolved++;

          // Histogramas
          savingsByPosition[i] = (savingsByPosition[i] || 0) + 1;
          positionInList[idx]  = (positionInList[idx]  || 0) + 1;
          break;
        }
      }

      if (!found) {
        totalWithPotential += word.length;
        totalWithReal      += word.length;
        byLength[bucket].potential += word.length;
        byLength[bucket].real      += word.length;
      }

      typedContext += word + " ";
    }
  }

  // ── Cálculos ─────────────────────────────────────────────────────
  const letterHit5   = totalLetters ? (correctTop5 / totalLetters) * 100 : 0;
  const wordHit5     = totalWords   ? (correctWords / totalWords)  * 100 : 0;
  const ksrPotential = totalBaseline ? ((totalBaseline - totalWithPotential) / totalBaseline) * 100 : 0;
  const ksrReal      = totalBaseline ? ((totalBaseline - totalWithReal)      / totalBaseline) * 100 : 0;

  // Posición promedio en la lista cuando se resuelve
  const totalResolved = Object.values(positionInList).reduce((a, b) => a + b, 0);
  const avgPosition   = totalResolved
    ? Object.entries(positionInList).reduce((acc, [pos, cnt]) => acc + Number(pos) * cnt, 0) / totalResolved
    : 0;

  // ── Desglose por longitud ─────────────────────────────────────────
  const lengthStats = {};
  for (const [key, d] of Object.entries(byLength)) {
    lengthStats[key] = {
      total: d.total,
      resolved: d.resolved,
      ksrPotential: d.baseline ? ((d.baseline - d.potential) / d.baseline * 100).toFixed(1) + "%" : "N/A",
      ksrReal:      d.baseline ? ((d.baseline - d.real)      / d.baseline * 100).toFixed(1) + "%" : "N/A",
    };
  }

  // ── Output ────────────────────────────────────────────────────────
  console.log("✅ RESULTADOS:");
  console.table({
    "Precisión top-5 letras":       letterHit5.toFixed(1)   + "%",
    "Precisión palabras sugeridas": wordHit5.toFixed(1)     + "%",
    "KSR potencial (sin nav.)":     ksrPotential.toFixed(1) + "%",
    "KSR real (con nav. por pos.)": ksrReal.toFixed(1)      + "%",
    "Posición promedio en lista":   avgPosition.toFixed(2),
    "Total frases":                 phrases.length,
    "Total letras evaluadas":       totalLetters,
    "Total palabras evaluadas":     totalWords,
  });

  console.log("Desglose por longitud de palabra:");
  console.table(lengthStats);

  console.log("Palabras resueltas con N letras escritas:");
  const posEntries = Object.entries(savingsByPosition).sort((a, b) => Number(a[0]) - Number(b[0]));
  for (const [pos, count] of posEntries) {
    const pct = (count / totalWords * 100).toFixed(1);
    console.log(`  ${pos} letra(s): ${count} palabras (${pct}%)`);
  }

  console.log("Posición en lista donde se resolvió la palabra (0=primera):");
  const listEntries = Object.entries(positionInList).sort((a, b) => Number(a[0]) - Number(b[0]));
  for (const [pos, count] of listEntries) {
    const pct = (count / totalResolved * 100).toFixed(1);
    console.log(`  Posición ${Number(pos)+1}: ${count} palabras (${pct}%)`);
  }

  window.__keyboardEval = { letterHit5, wordHit5, ksrPotential, ksrReal, avgPosition, lengthStats, savingsByPosition, positionInList };
  return window.__keyboardEval;
}