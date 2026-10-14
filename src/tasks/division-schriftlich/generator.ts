import { GETEILT, MAL, MINUS } from "../../core/format";
import type { Rng } from "../../core/rng";
import type { CheckResult, SolutionStep } from "../../core/types";
import {
  grundVorgabe,
  zerlege,
  zerlegenFehler,
  zerlegenKaestchen,
  zerlegenLoesung,
  zerlegenTipp,
} from "./zerlegen";

export type DivSchriftlichConfig = {
  /**
   * Rechenweg: "normal" = schriftliches Normalverfahren (malnehmen, abziehen, herunterholen),
   * "zerlegen" = halbschriftlich in zwei leichte Aufgaben (228 : 6 → 180 : 6 und 48 : 6),
   * "gemischt" = beides abwechselnd
   */
  methode: "normal" | "zerlegen" | "gemischt";
  stellen: number; // Stellen des Dividenden (2–4)
  divisoren: string[]; // "2" … "9"
  mitRest: boolean;
  /**
   * Was schon dasteht (Lücken ausfüllen):
   * "keine" – alles selbst rechnen
   * "viele" – etwa zwei Drittel der Ziffern sind vorgegeben, nur wenige Lücken
   * "einige" – etwa ein Drittel ist vorgegeben
   * "ergebnis" – das Ergebnis steht da, der Rechenweg wird ausgefüllt
   * "rechenweg" – der Rechenweg steht da, das Ergebnis wird gesucht
   */
  vorgabe: Vorgabe;
};

export type Vorgabe = "keine" | "viele" | "einige" | "ergebnis" | "rechenweg";

/** Ältere gespeicherte Einstellungen ("alles"/"luecken") auf die neuen Werte abbilden. */
export function normalisiereVorgabe(v: string): Vorgabe {
  if (v === "alles") return "keine";
  if (v === "luecken") return "einige";
  return (
    (["keine", "viele", "einige", "ergebnis", "rechenweg"] as const).find((x) => x === v) ?? "keine"
  );
}

/** Gehört das Kästchen zum Ergebnis (Quotient oder Rest oben) – oder zum Rechenweg? */
export const istErgebnis = (name: string) =>
  name.startsWith("q") || name === "R" || name.startsWith("e") || name === "R0";

export type Methode = "normal" | "zerlegen";

export interface DivSchriftlichTask {
  methode: Methode;
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
  if (task.methode === "zerlegen")
    return zerlegenKaestchen(task.dividend, task.divisor, task.mitRest);
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
  const methode: Methode =
    config.methode === "zerlegen" || (config.methode === "gemischt" && rng.chance(0.5))
      ? "zerlegen"
      : "normal";
  if (methode === "zerlegen") {
    if (!zerlege(dividend, divisor)) return null;
  } else if (schritte(dividend, divisor).length < 2) {
    // mindestens zwei Schritte, sonst ist es keine richtige schriftliche Division
    return null;
  }

  const ohneVorgabe = { methode, dividend, divisor, mitRest: config.mitRest, gegeben: [] };
  const alle = kaestchen(ohneVorgabe).map((k) => k.name);
  // Beim Zerlegen steht – wie auf dem Übungsblatt – immer genug da, damit die Zerlegung eindeutig ist
  const basis = methode === "zerlegen" ? grundVorgabe(dividend, divisor, config.mitRest, rng) : [];
  const rest = alle.filter((k) => !basis.includes(k));

  const vorgabe = normalisiereVorgabe(config.vorgabe);
  let gegeben: string[] = basis;
  if (vorgabe === "ergebnis") gegeben = [...basis, ...rest.filter(istErgebnis)];
  else if (vorgabe === "rechenweg") gegeben = alle.filter((k) => !istErgebnis(k));
  else if (vorgabe === "viele" || vorgabe === "einige") {
    const anteil = vorgabe === "viele" ? 2 / 3 : 1 / 3;
    gegeben = [...basis, ...rng.shuffle(rest).slice(0, Math.round(rest.length * anteil))];
  }
  // Es bleiben immer mindestens drei Lücken, und (außer bei „Ergebnis vorgegeben“)
  // ist mindestens eine Ziffer des Ergebnisses gesucht
  const offen = alle.filter((k) => !gegeben.includes(k));
  if (offen.length < 3 && vorgabe !== "rechenweg") return null;
  if (vorgabe !== "ergebnis" && !offen.some(istErgebnis)) return null;
  return { ...ohneVorgabe, gegeben };
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
  const ergebnisFalsch = wrongFields.some(istErgebnis);
  const errorTag = leer
    ? undefined
    : task.methode === "zerlegen"
      ? zerlegenFehler(wrongFields.find((f) => answer[f]) ?? wrongFields[0]!)
      : ergebnisFalsch
        ? "Ergebnis falsch"
        : "Zwischenschritt falsch";
  return {
    status: wrongFields.length < Object.keys(richtig).length ? "teilweise" : "falsch",
    wrongFields,
    errorTag,
  };
}

export function solution(task: DivSchriftlichTask): SolutionStep[] {
  if (task.methode === "zerlegen")
    return zerlegenLoesung(task.dividend, task.divisor, task.mitRest);
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
  if (task.methode === "zerlegen") return zerlegenTipp(task.dividend, task.divisor);
  const erster = schritte(task.dividend, task.divisor)[0]!;
  return `Fang vorne an: Wie oft passt ${task.divisor} in ${erster.teil}? Dann malnehmen, abziehen, nächste Ziffer herunterholen.`;
}
