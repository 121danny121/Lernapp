import { GETEILT, MAL, parseAnswer } from "../../core/format";
import type { Rng } from "../../core/rng";
import type { CheckResult, SolutionStep } from "../../core/types";

export type DivisionConfig = {
  dividendVon: number;
  dividendBis: number;
  divisoren: string[]; // "2" … "9"
  mitRest: boolean;
};

export interface DivisionTask {
  dividend: number;
  divisor: number;
  quotient: number;
  rest: number;
  /** Ob ein Rest-Feld angezeigt wird (auch wenn der Rest 0 ist). */
  mitRest: boolean;
}

export type DivisionAnswer = { q: string; r: string };

export const ALLE_DIVISOREN = ["2", "3", "4", "5", "6", "7", "8", "9"];

export function generate(config: DivisionConfig, rng: Rng): DivisionTask | null {
  const lo = Math.min(config.dividendVon, config.dividendBis);
  const hi = Math.max(config.dividendVon, config.dividendBis);
  const allowed = config.divisoren.map(Number).filter((d) => d >= 2 && d <= 9);
  const divisor = rng.pick(allowed.length > 0 ? allowed : ALLE_DIVISOREN.map(Number));

  let dividend: number;
  if (config.mitRest) {
    const from = Math.max(lo, divisor);
    if (from > hi) return null;
    dividend = rng.int(from, hi);
  } else {
    // Ohne Rest: Dividend als Vielfaches des Divisors erzeugen – geht garantiert auf.
    const qMin = Math.max(1, Math.ceil(lo / divisor));
    const qMax = Math.floor(hi / divisor);
    if (qMin > qMax) return null;
    dividend = rng.int(qMin, qMax) * divisor;
  }
  return {
    dividend,
    divisor,
    quotient: Math.floor(dividend / divisor),
    rest: dividend % divisor,
    mitRest: config.mitRest,
  };
}

export function check(task: DivisionTask, answer: DivisionAnswer): CheckResult {
  const q = parseAnswer(answer.q);
  const r = parseAnswer(answer.r);
  const wrongFields: string[] = [];
  if (q !== task.quotient) wrongFields.push("q");
  if (task.mitRest && r !== task.rest) wrongFields.push("r");

  if (wrongFields.length === 0) return { status: "richtig", wrongFields };
  const status =
    wrongFields.length === 1 && task.mitRest && q !== null && r !== null ? "teilweise" : "falsch";

  let errorTag: string | undefined;
  if (q === null) errorTag = undefined;
  else if (task.mitRest && r !== null && r >= task.divisor) errorTag = "Rest zu groß";
  else if (Math.abs(q - task.quotient) === 1) errorTag = "Um eins daneben";
  else if (q === task.quotient) errorTag = "Rest falsch";
  else errorTag = "Verrechnet";
  return { status, wrongFields, errorTag };
}

/** Zerlegt den Dividenden in Vielfache von Divisor · 100, · 10 und · 1. */
export function zerlegen(task: DivisionTask): { teil: number; quotient: number }[] {
  const teile: { teil: number; quotient: number }[] = [];
  let rest = task.dividend;
  for (const stelle of [100, 10, 1]) {
    const k = Math.floor(rest / (task.divisor * stelle));
    if (k > 0) {
      teile.push({ teil: k * stelle * task.divisor, quotient: k * stelle });
      rest -= k * stelle * task.divisor;
    }
  }
  return teile;
}

export function solution(task: DivisionTask): SolutionStep[] {
  const { dividend, divisor, quotient, rest } = task;
  const teile = zerlegen(task);
  const steps: SolutionStep[] = [];

  if (teile.length <= 1) {
    steps.push({
      text: `Denk an die ${divisor}er-Reihe: ${quotient} ${MAL} ${divisor} = ${quotient * divisor}`,
    });
  } else {
    const summanden = [...teile.map((t) => t.teil), ...(rest > 0 ? [rest] : [])];
    steps.push({ text: `Zerlege ${dividend} = ${summanden.join(" + ")}` });
    for (const t of teile) steps.push({ text: `${t.teil} ${GETEILT} ${divisor} = ${t.quotient}` });
    steps.push({ text: `${teile.map((t) => t.quotient).join(" + ")} = ${quotient}` });
  }
  if (rest > 0) steps.push({ text: `Es bleiben ${rest} übrig. Das ist der Rest.` });

  const ergebnis = task.mitRest ? `${quotient} Rest ${rest}` : `${quotient}`;
  steps.push({ text: `Also: ${dividend} ${GETEILT} ${divisor} = ${ergebnis}` });
  steps.push({
    text: `Probe: ${quotient} ${MAL} ${divisor}${rest > 0 ? ` + ${rest}` : ""} = ${dividend}`,
  });
  return steps;
}

export function hint(task: DivisionTask): string {
  if (task.quotient <= 10)
    return `Denk an die ${task.divisor}er-Reihe: Was mal ${task.divisor} passt?`;
  return `Zerlege ${task.dividend} in Zahlen, die du leicht durch ${task.divisor} teilen kannst – zum Beispiel ${zerlegen(task)[0]!.teil}.`;
}
