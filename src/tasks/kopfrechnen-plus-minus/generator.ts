import { MINUS, PLUS, parseAnswer, stellenwerte } from "../../core/format";
import type { Rng } from "../../core/rng";
import type { CheckResult, SolutionStep } from "../../core/types";

export type KopfrechnenConfig = {
  zahlenraum: "20" | "100" | "1000";
  rechenarten: string[]; // "plus" | "minus"
  luecke: "ergebnis" | "erste" | "zweite" | "zufall";
  zahlen: "beliebig" | "zehner" | "hunderter";
};

export type Op = "+" | "-";

export interface KopfrechnenTask {
  a: number;
  b: number;
  op: Op;
  c: number;
  /** Welche Zahl gesucht ist: a ○ b = c */
  gap: "a" | "b" | "c";
}

export type KopfrechnenAnswer = { x: string };

/**
 * Kleinste Einheit der Zahlen. Bei zu kleinem Zahlenraum (z. B. Hunderter im Zahlenraum 100)
 * wird auf die nächstkleinere Einheit ausgewichen, damit es genug verschiedene Aufgaben gibt.
 */
export function unitFor(config: KopfrechnenConfig): number {
  const max = Number(config.zahlenraum);
  let unit = config.zahlen === "hunderter" ? 100 : config.zahlen === "zehner" ? 10 : 1;
  while (unit > 1 && max / unit < 10) unit /= 10;
  return unit;
}

export function generate(config: KopfrechnenConfig, rng: Rng): KopfrechnenTask | null {
  const max = Number(config.zahlenraum);
  if (!(max >= 10)) return null;
  const unit = unitFor(config);
  const n = max / unit;

  const allowed = (["plus", "minus"] as const).filter((o) => config.rechenarten.includes(o));
  const op: Op = rng.pick(allowed.length > 0 ? allowed : ["plus", "minus"]) === "plus" ? "+" : "-";

  let a: number;
  let b: number;
  if (op === "+") {
    a = rng.int(1, n - 1);
    b = rng.int(1, n - a);
  } else {
    a = rng.int(2, n);
    b = rng.int(1, a - 1);
  }
  a *= unit;
  b *= unit;
  const c = op === "+" ? a + b : a - b;

  const gaps = { ergebnis: "c", erste: "a", zweite: "b" } as const;
  const gap = config.luecke === "zufall" ? rng.pick(["a", "b", "c"] as const) : gaps[config.luecke];
  return { a, b, op, c, gap };
}

export function correctValue(task: KopfrechnenTask): number {
  return task[task.gap];
}

export function check(task: KopfrechnenTask, answer: KopfrechnenAnswer): CheckResult {
  const value = parseAnswer(answer.x);
  const correct = correctValue(task);
  if (value === correct) return { status: "richtig", wrongFields: [] };
  return { status: "falsch", wrongFields: ["x"], errorTag: errorTag(task, value) };
}

function errorTag(task: KopfrechnenTask, value: number | null): string | undefined {
  if (value === null) return undefined;
  const correct = correctValue(task);
  const diff = Math.abs(value - correct);
  if (task.gap === "c") {
    const swapped = task.op === "+" ? task.a - task.b : task.a + task.b;
    if (value === swapped) return "Plus und Minus verwechselt";
  }
  if (diff === 10 || diff === 100) return "Zehner-/Hunderterübergang";
  return "Verrechnet";
}

const sym = (op: Op) => (op === "+" ? PLUS : MINUS);
const calc = (x: number, op: Op, y: number) => (op === "+" ? x + y : x - y);

/** Rechnet x ○ y schrittweise: erst die Hunderter, dann die Zehner, dann die Einer von y. */
export function schrittweise(x: number, op: Op, y: number): SolutionStep[] {
  const parts = stellenwerte(y);
  if (parts.length <= 1) return [{ text: `${x} ${sym(op)} ${y} = ${calc(x, op, y)}` }];
  const steps: SolutionStep[] = [{ text: `Zerlege ${y} = ${parts.join(" + ")}` }];
  let acc = x;
  for (const p of parts) {
    const next = calc(acc, op, p);
    steps.push({ text: `${acc} ${sym(op)} ${p} = ${next}` });
    acc = next;
  }
  return steps;
}

export function solution(task: KopfrechnenTask): SolutionStep[] {
  const { a, b, op, c, gap } = task;
  const aufgabe = `${a} ${sym(op)} ${b} = ${c}`;
  if (gap === "c") return [...schrittweise(a, op, b), { text: `Also: ${aufgabe}` }];

  // Lücke an 1. oder 2. Stelle: mit der Umkehraufgabe rechnen.
  let x: number;
  let inv: Op;
  let y: number;
  if (op === "+") [x, inv, y] = gap === "a" ? [c, "-", b] : [c, "-", a];
  else [x, inv, y] = gap === "a" ? [c, "+", b] : [a, "-", c];
  return [
    { text: `Rechne mit der Umkehraufgabe: ${x} ${sym(inv)} ${y}` },
    ...schrittweise(x, inv, y),
    { text: `Probe: ${aufgabe}` },
  ];
}

export function hint(task: KopfrechnenTask): string {
  const { a, b, op, c, gap } = task;
  if (gap === "c") {
    return stellenwerte(b).length > 1
      ? `Zerlege ${b} und rechne in Schritten: erst die großen Stellen, dann die kleinen.`
      : `Rechne ${op === "+" ? "weiter" : "zurück"}: von ${a} aus ${b} ${op === "+" ? "dazu" : "weg"}.`;
  }
  if (op === "+") return `Umkehraufgabe: ${c} ${MINUS} ${gap === "a" ? b : a} = ?`;
  return gap === "a" ? `Umkehraufgabe: ${c} ${PLUS} ${b} = ?` : `Wie viel fehlt von ${c} bis ${a}?`;
}
