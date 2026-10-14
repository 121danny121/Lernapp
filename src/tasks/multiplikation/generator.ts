import { MAL, PLUS, parseAnswer } from "../../core/format";
import type { Rng } from "../../core/rng";
import type { CheckResult, SolutionStep } from "../../core/types";

export type MultiplikationConfig = {
  /** "einmaleins" (7 · 8), "zehner" (6 · 80), "zweistellig" (7 · 58), "dreistellig" (4 · 123) */
  arten: string[];
  /** Erlaubte Einmaleins-Reihen bzw. kleine Faktoren */
  reihen: string[];
  luecke: "ergebnis" | "faktor" | "zufall";
};

export interface MultiplikationTask {
  a: number;
  b: number;
  c: number;
  gap: "a" | "b" | "c";
}

export type MultiplikationAnswer = { x: string };

export const ALLE_REIHEN = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export function generate(config: MultiplikationConfig, rng: Rng): MultiplikationTask | null {
  const reihen = config.reihen.map(Number).filter((n) => n >= 1 && n <= 10);
  const klein = rng.pick(reihen.length > 0 ? reihen : ALLE_REIHEN.map(Number));
  const arten = config.arten.length > 0 ? config.arten : ["einmaleins"];
  const art = rng.pick(arten);

  let gross: number;
  switch (art) {
    case "zehner":
      gross = rng.int(1, 9) * 10;
      break;
    case "zweistellig":
      gross = rng.int(11, 99);
      if (gross % 10 === 0) return null;
      break;
    case "dreistellig":
      gross = rng.int(101, 999);
      if (gross % 10 === 0) return null;
      break;
    default:
      gross = rng.int(1, 10);
  }
  // Kleiner Faktor zufällig vorne oder hinten (7 · 58 oder 58 · 7)
  const [a, b] = rng.chance(0.5) ? [klein, gross] : [gross, klein];
  const c = a * b;

  let gap: MultiplikationTask["gap"];
  if (config.luecke === "ergebnis") gap = "c";
  else if (config.luecke === "faktor") gap = rng.pick(["a", "b"] as const);
  else gap = rng.pick(["a", "b", "c"] as const);
  // Lücke im Faktor nur, wenn die Aufgabe eindeutig ist (nicht · 0) und nicht trivial (· 1)
  if (gap !== "c" && (a === 1 || b === 1)) return null;
  return { a, b, c, gap };
}

export const correctValue = (t: MultiplikationTask) => t[t.gap];

export function check(task: MultiplikationTask, answer: MultiplikationAnswer): CheckResult {
  const v = parseAnswer(answer.x);
  if (v === correctValue(task)) return { status: "richtig", wrongFields: [] };
  return { status: "falsch", wrongFields: ["x"], errorTag: errorTag(task, v) };
}

function errorTag(task: MultiplikationTask, v: number | null): string | undefined {
  if (v === null) return undefined;
  const { a, b, c, gap } = task;
  if (gap === "c") {
    if (v === c + a || v === c - a || v === c + b || v === c - b) return "Um eine Reihe verrutscht";
    if (v === a + b) return "Plus statt Mal gerechnet";
    const [klein, gross] = a < b ? [a, b] : [b, a];
    if (gross > 10) {
      const zehner = gross - (gross % 10);
      if (v === klein * zehner + (gross % 10)) return "Einer nicht malgenommen";
    }
  }
  return "Verrechnet";
}

export function solution(task: MultiplikationTask): SolutionStep[] {
  const { a, b, c, gap } = task;
  const [klein, gross] = a <= b ? [a, b] : [b, a];
  if (gap !== "c") {
    const bekannt = gap === "a" ? b : a;
    return [
      { text: `Welche Zahl mal ${bekannt} ergibt ${c}?` },
      { text: `Rechne die Umkehraufgabe: ${c} : ${bekannt} = ${correctValue(task)}` },
      { text: `Probe: ${a} ${MAL} ${b} = ${c}` },
    ];
  }
  if (gross <= 10) {
    const steps: SolutionStep[] = [];
    if (klein > 1 && gross > 5) {
      // Kernaufgabe: 5 · x und dann weiter
      steps.push({ text: `Kernaufgabe: 5 ${MAL} ${klein} = ${5 * klein}` });
      steps.push({ text: `Dazu noch ${gross - 5} ${MAL} ${klein} = ${(gross - 5) * klein}` });
      steps.push({ text: `${5 * klein} ${PLUS} ${(gross - 5) * klein} = ${c}` });
    }
    steps.push({ text: `${a} ${MAL} ${b} = ${c}` });
    return steps;
  }
  if (gross % 10 === 0) {
    const z = gross / 10;
    return [
      { text: `Rechne erst ohne die Null: ${klein} ${MAL} ${z} = ${klein * z}` },
      { text: `Dann eine Null anhängen: ${klein} ${MAL} ${gross} = ${c}` },
    ];
  }
  // Zerlegen: 7 · 58 = 7 · 50 + 7 · 8
  const teile: number[] = [];
  let rest = gross;
  for (const stelle of [100, 10, 1]) {
    const t = rest - (rest % stelle);
    if (t > 0) teile.push(t);
    rest -= t;
  }
  return [
    { text: `Zerlege ${gross} = ${teile.join(" + ")}` },
    ...teile.map((t) => ({ text: `${klein} ${MAL} ${t} = ${klein * t}` })),
    { text: `${teile.map((t) => klein * t).join(" + ")} = ${c}` },
    { text: `Also: ${a} ${MAL} ${b} = ${c}` },
  ];
}

export function hint(task: MultiplikationTask): string {
  const { a, b, gap, c } = task;
  if (gap !== "c") return `Denk an die Umkehraufgabe: ${c} : ${gap === "a" ? b : a}`;
  const gross = Math.max(a, b);
  if (gross <= 10) return `Tipp: Was ist 5 ${MAL} ${Math.min(a, b)}? Von dort aus weiterrechnen.`;
  if (gross % 10 === 0) return `Rechne erst ohne die Null und hänge sie dann an.`;
  return `Zerlege ${gross} in Zehner und Einer und nimm beide mal ${Math.min(a, b)}.`;
}
