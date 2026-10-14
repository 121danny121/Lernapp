import { parseAnswer } from "../../core/format";
import type { Rng } from "../../core/rng";
import type { CheckResult, SolutionStep } from "../../core/types";
import {
  anzahlBlaetter,
  istBlatt,
  istPunkt,
  linksNachRechts,
  rechenweg,
  regeln,
  rueckwaerts,
  text,
  wert,
  type Knoten,
  type Op,
} from "./ausdruck";

export type RechenregelnConfig = {
  /** "punkt" (Punkt vor Strich), "klammer" (Klammern) */
  regeln: string[];
  operationen: "2" | "3";
  zahlenraum: "100" | "1000";
  /** "ergebnis": 7 · 8 + 26 = __ ; "zahl": (__ + 20) · 3 = 150 ; "gemischt" */
  gesucht: "ergebnis" | "zahl" | "gemischt";
};

export interface RechenregelnTask {
  baum: Knoten;
  ergebnis: number;
  /** Index der gesuchten Zahl (von links), null = Ergebnis gesucht */
  luecke: number | null;
}

export type RechenregelnAnswer = { x: string };

const OPS: Op[] = ["+", "-", "*", ":"];

/** Zufällige Baumform mit `ops` Rechenzeichen. */
function form(ops: number, rng: Rng): Knoten {
  if (ops === 0) return { n: 0 };
  const links = rng.int(0, ops - 1);
  return { op: rng.pick(OPS), l: form(links, rng), r: form(ops - 1 - links, rng) };
}

/**
 * Füllt die Baumform mit Zahlen. Jeder Teilausdruck bleibt ≤ `budget`, alles geht glatt auf
 * (ganze Zahlen ≥ 1, Division ohne Rest, Malaufgaben mit einem Faktor ≤ 10).
 */
function fuelle(k: Knoten, budget: number, max: number, rng: Rng): Knoten | null {
  if (budget < 1) return null;
  if (istBlatt(k)) return { n: rng.int(1, budget) };
  const v = (x: Knoten) => wert(x)!;
  switch (k.op) {
    case "+": {
      if (budget < 2) return null;
      const l = fuelle(k.l, budget - 1, max, rng);
      if (!l) return null;
      const r = fuelle(k.r, budget - v(l), max, rng);
      return r && { op: "+", l, r };
    }
    case "-": {
      const l = fuelle(k.l, max, max, rng);
      if (!l || v(l) < 2) return null;
      const r = fuelle(k.r, v(l) - 1, max, rng);
      if (!r || v(l) - v(r) > budget) return null;
      return { op: "-", l, r };
    }
    case "*": {
      const kleinLinks = rng.chance(0.5);
      const [gross, klein] = kleinLinks ? [k.r, k.l] : [k.l, k.r];
      const g = fuelle(gross, Math.floor(budget / 2), max, rng);
      if (!g || v(g) < 2) return null;
      const s = fuelle(klein, Math.min(10, Math.floor(budget / v(g))), max, rng);
      if (!s || v(s) < 2) return null;
      return kleinLinks ? { op: "*", l: s, r: g } : { op: "*", l: g, r: s };
    }
    case ":": {
      const r = fuelle(k.r, 10, max, rng);
      if (!r || v(r) < 2) return null;
      let l: Knoten | null;
      if (istBlatt(k.l)) {
        const qMax = Math.min(budget, Math.floor(max / v(r)));
        if (qMax < 2) return null;
        l = { n: v(r) * rng.int(2, qMax) };
      } else {
        l = fuelle(k.l, max, max, rng);
      }
      if (!l || v(l) % v(r) !== 0 || v(l) / v(r) > budget || v(l) / v(r) < 1) return null;
      return { op: ":", l, r };
    }
  }
}

/**
 * Klammern, die man weglassen könnte – 5 + (3 − 2) oder 4 · (6 : 3) – vermeiden.
 * Sinnvolle Klammern wie 50 − (12 + 8) oder 48 : (2 · 4) bleiben erlaubt.
 */
function ohneUnnoetigeKlammern(k: Knoten): boolean {
  if (istBlatt(k)) return true;
  if (k.op === "+" && !istBlatt(k.r) && !istPunkt(k.r.op)) return false;
  if (k.op === "*" && !istBlatt(k.r) && istPunkt(k.r.op)) return false;
  return ohneUnnoetigeKlammern(k.l) && ohneUnnoetigeKlammern(k.r);
}

/**
 * Gibt es genau eine Zahl (bis `grenze`), die an der Lücke passt? Nur für Tests: Da alle
 * Rechenarten in jedem Operanden streng monoton sind (Zahlen ≥ 1, Faktoren ≥ 2),
 * ist die Lücke immer eindeutig.
 */
export function eindeutig(baum: Knoten, luecke: number, ergebnis: number, grenze: number): boolean {
  let treffer = 0;
  for (let v = 0; v <= grenze && treffer < 2; v++) {
    if (wert(baum, { blatt: luecke, wert: v }) === ergebnis) treffer++;
  }
  return treffer === 1;
}

export function generate(config: RechenregelnConfig, rng: Rng): RechenregelnTask | null {
  const max = Number(config.zahlenraum);
  const baum = fuelle(form(Number(config.operationen), rng), max, max, rng);
  if (!baum || !ohneUnnoetigeKlammern(baum)) return null;

  // Nur Aufgaben, bei denen genau die ausgewählten Regeln vorkommen
  const r = regeln(baum);
  if (!r.punkt && !r.klammer) return null;
  if (r.punkt && !config.regeln.includes("punkt")) return null;
  if (r.klammer && !config.regeln.includes("klammer")) return null;

  const ergebnis = wert(baum)!;
  const zahlGesucht =
    config.gesucht === "zahl" || (config.gesucht === "gemischt" && rng.chance(0.5));
  if (!zahlGesucht) return { baum, ergebnis, luecke: null };

  const luecke = rng.int(0, anzahlBlaetter(baum) - 1);
  return { baum, ergebnis, luecke };
}

function blattWert(task: RechenregelnTask): number {
  let i = 0;
  let found = 0;
  const rek = (k: Knoten) => {
    if (istBlatt(k)) {
      if (i++ === task.luecke) found = k.n;
    } else {
      rek(k.l);
      rek(k.r);
    }
  };
  rek(task.baum);
  return found;
}

export const correctValue = (task: RechenregelnTask) =>
  task.luecke === null ? task.ergebnis : blattWert(task);

export function check(task: RechenregelnTask, answer: RechenregelnAnswer): CheckResult {
  const v = parseAnswer(answer.x);
  if (v === correctValue(task)) return { status: "richtig", wrongFields: [] };
  let errorTag: string | undefined = v === null ? undefined : "Verrechnet";
  if (v !== null && task.luecke === null && v === linksNachRechts(task.baum)) {
    errorTag = regeln(task.baum).klammer
      ? "Klammer nicht beachtet"
      : "Punkt vor Strich nicht beachtet";
  }
  return { status: "falsch", wrongFields: ["x"], errorTag };
}

export function solution(task: RechenregelnTask): SolutionStep[] {
  if (task.luecke === null) return rechenweg(task.baum).map((t) => ({ text: t }));
  const probe = { ...task, luecke: null };
  return [
    { text: "Rechne rückwärts:" },
    ...rueckwaerts(task.baum, task.luecke, task.ergebnis).map((t) => ({ text: t })),
    { text: `Probe: ${text(probe.baum)} = ${task.ergebnis}` },
  ];
}

export function hint(task: RechenregelnTask): string {
  if (task.luecke !== null)
    return "Rechne rückwärts: Was muss in der Klammer bzw. vor dem letzten Rechenzeichen herauskommen?";
  return regeln(task.baum).klammer
    ? "Was in der Klammer steht, wird zuerst gerechnet."
    : "Punkt vor Strich: Erst mal und geteilt, dann plus und minus.";
}
