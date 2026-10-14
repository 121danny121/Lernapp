import { GETEILT, MAL, MINUS } from "../../core/format";
import type { Rng } from "../../core/rng";
import type { CheckResult, SolutionStep } from "../../core/types";

export type DivSchriftlichConfig = {
  stellen: number; // Stellen des Dividenden (2–4)
  divisoren: string[]; // "2" … "9"
  mitRest: boolean;
  /** "alles": alle Kästchen selbst ausfüllen; "luecken": einige Ziffern stehen schon da */
  vorgabe: "alles" | "luecken";
};

export interface DivSchriftlichTask {
  dividend: number;
  divisor: number;
  mitRest: boolean;
  /** Namen der Kästchen, deren Ziffer schon vorgegeben ist (Lücken-Modus) */
  gegeben: string[];
}

export type DivSchriftlichAnswer = Record<string, string>;

export interface DivSchritt {
  /** Teilzahl, die gerade geteilt wird */
  teil: number;
  /** Index der letzten Dividenden-Ziffer, über der die Teilzahl steht */
  ende: number;
  q: number;
  produkt: number;
  rest: number;
}

/** Das schriftliche Verfahren Schritt für Schritt. */
export function schritte(dividend: number, divisor: number): DivSchritt[] {
  const z = String(dividend).split("").map(Number);
  let ende = 0;
  let teil = z[0]!;
  while (teil < divisor && ende < z.length - 1) teil = teil * 10 + z[++ende]!;
  const out: DivSchritt[] = [];
  for (;;) {
    const q = Math.floor(teil / divisor);
    const produkt = q * divisor;
    const rest = teil - produkt;
    out.push({ teil, ende, q, produkt, rest });
    if (ende === z.length - 1) return out;
    ende++;
    teil = rest * 10 + z[ende]!;
  }
}

/** Ziffernfolge der Zeile unter dem Produkt: Rest und heruntergeholte Ziffer (z. B. "36" oder "04"). */
export function restZeile(dividend: number, s: DivSchritt[], i: number): string {
  const z = String(dividend);
  return i < s.length - 1 ? `${s[i]!.rest}${z[s[i]!.ende + 1]}` : String(s[i]!.rest);
}

export interface Kaestchen {
  name: string;
  ziffer: string;
}

/** Alle Kästchen in der Reihenfolge, in der man sie beim Rechnen ausfüllt. */
export function kaestchen(task: DivSchriftlichTask): Kaestchen[] {
  const s = schritte(task.dividend, task.divisor);
  const out: Kaestchen[] = [];
  s.forEach((schritt, i) => {
    out.push({ name: `q${i}`, ziffer: String(schritt.q) });
    const p = String(schritt.produkt);
    for (let j = p.length - 1; j >= 0; j--) out.push({ name: `p${i}_${j}`, ziffer: p[j]! });
    const r = restZeile(task.dividend, s, i);
    // erst den Rest von rechts nach links, dann die heruntergeholte Ziffer
    const restLaenge = i < s.length - 1 ? r.length - 1 : r.length;
    for (let j = restLaenge - 1; j >= 0; j--) out.push({ name: `r${i}_${j}`, ziffer: r[j]! });
    if (i < s.length - 1) out.push({ name: `r${i}_${r.length - 1}`, ziffer: r[r.length - 1]! });
  });
  if (task.mitRest) out.push({ name: "R", ziffer: String(s[s.length - 1]!.rest) });
  return out;
}

export function generate(config: DivSchriftlichConfig, rng: Rng): DivSchriftlichTask | null {
  const stellen = Math.min(4, Math.max(2, config.stellen));
  const erlaubt = config.divisoren.map(Number).filter((d) => d >= 2 && d <= 9);
  const divisor = rng.pick(erlaubt.length > 0 ? erlaubt : [2, 3, 4, 5, 6, 7, 8, 9]);
  const lo = 10 ** (stellen - 1);
  const hi = 10 ** stellen - 1;

  let dividend: number;
  if (config.mitRest) {
    dividend = rng.int(lo, hi);
  } else {
    const qMin = Math.ceil(lo / divisor);
    const qMax = Math.floor(hi / divisor);
    if (qMin > qMax) return null;
    dividend = rng.int(qMin, qMax) * divisor;
  }
  if (dividend < divisor) return null;
  const s = schritte(dividend, divisor);
  // mindestens zwei Schritte, sonst ist es keine richtige schriftliche Division
  if (s.length < 2) return null;

  let gegeben: string[] = [];
  if (config.vorgabe === "luecken") {
    const alle = kaestchen({ dividend, divisor, mitRest: config.mitRest, gegeben: [] }).map(
      (k) => k.name,
    );
    // etwa die Hälfte vorgeben, mindestens drei Lücken lassen, das Ergebnis bleibt teilweise offen
    gegeben = alle.filter(() => rng.chance(0.5));
    const offen = alle.filter((k) => !gegeben.includes(k));
    if (offen.length < 3 || !offen.some((k) => k.startsWith("q"))) return null;
  }
  return { dividend, divisor, mitRest: config.mitRest, gegeben };
}

export function correctAnswer(task: DivSchriftlichTask): DivSchriftlichAnswer {
  return Object.fromEntries(
    kaestchen(task)
      .filter((k) => !task.gegeben.includes(k.name))
      .map((k) => [k.name, k.ziffer]),
  );
}

export function emptyAnswer(task: DivSchriftlichTask): DivSchriftlichAnswer {
  return Object.fromEntries(Object.keys(correctAnswer(task)).map((k) => [k, ""]));
}

export function check(task: DivSchriftlichTask, answer: DivSchriftlichAnswer): CheckResult {
  const richtig = correctAnswer(task);
  const wrongFields = Object.keys(richtig).filter((k) => answer[k] !== richtig[k]);
  if (wrongFields.length === 0) return { status: "richtig", wrongFields };
  const leer = wrongFields.every((f) => !answer[f]);
  const ergebnisFalsch = wrongFields.some((f) => f.startsWith("q") || f === "R");
  return {
    status: wrongFields.length < Object.keys(richtig).length ? "teilweise" : "falsch",
    wrongFields,
    errorTag: leer ? undefined : ergebnisFalsch ? "Ergebnis falsch" : "Zwischenschritt falsch",
  };
}

export function solution(task: DivSchriftlichTask): SolutionStep[] {
  const s = schritte(task.dividend, task.divisor);
  const d = task.divisor;
  const steps: SolutionStep[] = [];
  s.forEach((x, i) => {
    steps.push({
      text: `${x.teil} ${GETEILT} ${d} = ${x.q}, denn ${x.q} ${MAL} ${d} = ${x.produkt}`,
    });
    const weiter =
      i < s.length - 1
        ? `, hole die nächste Ziffer herunter: ${restZeile(task.dividend, s, i)}`
        : "";
    steps.push({ text: `${x.teil} ${MINUS} ${x.produkt} = ${x.rest}${weiter}` });
  });
  const q = s.map((x) => x.q).join("");
  const rest = s[s.length - 1]!.rest;
  steps.push({
    text: `Ergebnis: ${task.dividend} ${GETEILT} ${d} = ${Number(q)}${task.mitRest ? ` Rest ${rest}` : ""}`,
  });
  return steps;
}

export function hint(task: DivSchriftlichTask): string {
  const erster = schritte(task.dividend, task.divisor)[0]!;
  return `Fang vorne an: Wie oft passt ${task.divisor} in ${erster.teil}? Dann malnehmen, abziehen, nächste Ziffer herunterholen.`;
}
