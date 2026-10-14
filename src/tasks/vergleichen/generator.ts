import { GETEILT, MAL, MINUS, PLUS } from "../../core/format";
import type { Rng } from "../../core/rng";
import type { CheckResult, SolutionStep } from "../../core/types";

export type VergleichenConfig = {
  rechenarten: string[]; // "plus" | "minus" | "mal" | "geteilt"
  zahlenraum: "100" | "1000";
  /** Anteil der Aufgaben mit „=“ in Prozent */
  anteilGleich: number;
};

export type RechenOp = "+" | "-" | "*" | ":";

export interface Term {
  a: number;
  op: RechenOp;
  b: number;
  wert: number;
}

export interface VergleichenTask {
  links: Term;
  rechts: Term;
}

export type Zeichen = "<" | "=" | ">";
export type VergleichenAnswer = { z: string };

const OPS: Record<string, RechenOp> = { plus: "+", minus: "-", mal: "*", geteilt: ":" };
export const opZeichen: Record<RechenOp, string> = {
  "+": PLUS,
  "-": MINUS,
  "*": MAL,
  ":": GETEILT,
};

/** Zehnerzahlen im Zahlenraum 1000, sonst beliebige Zahlen – wie 6 · 80 ◯ 40 · 9. */
function zahl(rng: Rng, von: number, bis: number, zehner: boolean): number {
  if (!zehner) return rng.int(von, bis);
  const lo = Math.ceil(von / 10);
  const hi = Math.floor(bis / 10);
  return lo > hi ? rng.int(von, bis) : rng.int(lo, hi) * 10;
}

/** Zufälliger Term; mit `ziel` wird ein Term mit genau diesem Wert gesucht. */
export function term(op: RechenOp, max: number, rng: Rng, ziel?: number): Term | null {
  const zehner = max >= 1000;
  let a: number;
  let b: number;
  switch (op) {
    case "+":
      if (ziel !== undefined) {
        if (ziel < 2) return null;
        b = zahl(rng, 1, ziel - 1, zehner && ziel % 10 === 0);
        a = ziel - b;
      } else {
        a = zahl(rng, 1, max - 1, zehner);
        b = zahl(rng, 1, max - a, zehner);
      }
      break;
    case "-":
      if (ziel !== undefined) {
        b = zahl(rng, 1, max - ziel, zehner && ziel % 10 === 0);
        a = ziel + b;
      } else {
        a = zahl(rng, 2, max, zehner);
        b = zahl(rng, 1, a - 1, zehner);
      }
      break;
    case "*": {
      // ein Faktor klein (2–9), der andere einstellig oder Zehnerzahl
      if (ziel !== undefined) {
        const teiler = [2, 3, 4, 5, 6, 7, 8, 9].filter((d) => ziel % d === 0 && ziel / d >= 2);
        if (teiler.length === 0) return null;
        a = rng.pick(teiler);
        b = ziel / a;
      } else {
        a = rng.int(2, 9);
        b = zehner ? rng.int(1, 9) * 10 : rng.int(2, Math.min(10, Math.floor(max / a)));
      }
      if (rng.chance(0.5)) [a, b] = [b, a];
      break;
    }
    case ":": {
      b = rng.int(2, 9);
      const q =
        ziel ??
        (zehner ? rng.int(1, Math.floor(max / b / 10)) * 10 : rng.int(2, Math.floor(max / b)));
      if (q < 1) return null;
      a = q * b;
      break;
    }
  }
  const wert = op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b;
  if (a < 1 || b < 1 || wert < 1 || a > max || b > max || wert > max || !Number.isInteger(wert))
    return null;
  return { a, op, b, wert };
}

export function generate(config: VergleichenConfig, rng: Rng): VergleichenTask | null {
  const max = Number(config.zahlenraum);
  const erlaubt = config.rechenarten.map((r) => OPS[r]).filter((o): o is RechenOp => !!o);
  const ops = erlaubt.length > 0 ? erlaubt : (["+", "-", "*", ":"] as RechenOp[]);
  const links = term(rng.pick(ops), max, rng);
  if (!links) return null;

  const gleich = rng.next() * 100 < config.anteilGleich;
  const rechts = term(rng.pick(ops), max, rng, gleich ? links.wert : undefined);
  if (!rechts) return null;
  if (rechts.a === links.a && rechts.b === links.b && rechts.op === links.op) return null;
  // Spannend bleibt es, wenn die Werte nah beieinander liegen
  if (!gleich && Math.abs(rechts.wert - links.wert) > Math.max(10, links.wert * 0.4)) return null;
  return { links, rechts };
}

export function richtigesZeichen(t: VergleichenTask): Zeichen {
  return t.links.wert < t.rechts.wert ? "<" : t.links.wert > t.rechts.wert ? ">" : "=";
}

export function check(task: VergleichenTask, answer: VergleichenAnswer): CheckResult {
  if (answer.z === richtigesZeichen(task)) return { status: "richtig", wrongFields: [] };
  const umgedreht = { "<": ">", ">": "<", "=": "" }[richtigesZeichen(task)];
  return {
    status: "falsch",
    wrongFields: ["z"],
    errorTag:
      answer.z === "" ? undefined : answer.z === umgedreht ? "Zeichen verdreht" : "Verrechnet",
  };
}

export const termText = (t: Term) => `${t.a} ${opZeichen[t.op]} ${t.b}`;

export function solution(task: VergleichenTask): SolutionStep[] {
  const z = richtigesZeichen(task);
  return [
    { text: `Links: ${termText(task.links)} = ${task.links.wert}` },
    { text: `Rechts: ${termText(task.rechts)} = ${task.rechts.wert}` },
    { text: `${task.links.wert} ${z} ${task.rechts.wert}` },
    {
      text:
        z === "=" ? "Beide Seiten sind gleich groß." : "Die Spitze zeigt immer zur kleineren Zahl.",
    },
  ];
}

export function hint(): string {
  return "Rechne beide Seiten aus. Das Krokodil frisst immer die größere Zahl!";
}
