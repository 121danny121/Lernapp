import { MINUS, PLUS } from "../../core/format";
import type { Rng } from "../../core/rng";
import type { CheckResult, SolutionStep } from "../../core/types";

export type SchriftlichConfig = {
  rechenarten: string[]; // "plus" | "minus"
  zahlen: number; // 2 oder 3 Zahlen untereinander
  stellen: number; // Stellen der ersten Zahl (2–5)
  uebertrag: "egal" | "mit" | "ohne";
};

export interface SchriftlichTask {
  zahlen: number[];
  op: "+" | "-";
  ergebnis: number;
}

export type SchriftlichAnswer = Record<string, string>;

export const ziffer = (n: number, k: number) => Math.floor(n / 10 ** k) % 10;
export const stellenVon = (n: number) => String(n).length;
/** Ergebnis-Kästchen (k = Stelle von rechts) und Übertrags-Kästchen */
export const ergebnisFeld = (k: number) => `e${k}`;
export const uebertragFeld = (k: number) => `u${k}`;

/** Überträge je Stelle: uebertraege[k] wird in Stelle k übertragen. */
export function uebertraege(task: SchriftlichTask): number[] {
  const breite = Math.max(...task.zahlen.map(stellenVon), stellenVon(task.ergebnis));
  const u = [0];
  for (let k = 0; k < breite; k++) {
    if (task.op === "+") {
      const summe = task.zahlen.reduce((s, z) => s + ziffer(z, k), 0) + u[k]!;
      u.push(Math.floor(summe / 10));
    } else {
      const [a, ...rest] = task.zahlen;
      const x = ziffer(a!, k) - rest.reduce((s, z) => s + ziffer(z, k), 0) - u[k]!;
      u.push(x < 0 ? Math.ceil(-x / 10) : 0);
    }
  }
  return u;
}

function zufallsZahl(rng: Rng, stellen: number): number {
  return rng.int(10 ** (stellen - 1), 10 ** stellen - 1);
}

/** Baut Zahlen Stelle für Stelle so, dass es nirgends einen Übertrag gibt. */
function ohneUebertrag(op: "+" | "-", laengen: number[], rng: Rng): number[] {
  const zahlen = laengen.map(() => 0);
  for (let k = 0; k < laengen[0]!; k++) {
    const aktiv = laengen.map((l, i) => (k < l ? i : -1)).filter((i) => i >= 0);
    const min = (i: number) => (k === laengen[i]! - 1 ? 1 : 0); // führende Ziffer ≥ 1
    if (op === "+") {
      let platz = 9;
      for (const i of rng.shuffle(aktiv)) {
        const rest = aktiv.filter((j) => j !== i).reduce((s, j) => s + min(j), 0);
        const d = rng.int(min(i), Math.max(min(i), platz - rest));
        zahlen[i] = zahlen[i]! + d * 10 ** k;
        platz -= d;
      }
    } else {
      // erste Zahl oben: ihre Ziffer muss mindestens so groß sein wie die Summe darunter
      let summe = 0;
      for (const i of aktiv.filter((i) => i !== 0)) {
        const d = rng.int(min(i), Math.max(min(i), 9 - summe - min(0)));
        zahlen[i] = zahlen[i]! + d * 10 ** k;
        summe += d;
      }
      zahlen[0] = zahlen[0]! + rng.int(Math.max(summe, min(0)), 9) * 10 ** k;
    }
  }
  return zahlen;
}

export function generate(config: SchriftlichConfig, rng: Rng): SchriftlichTask | null {
  const erlaubt = (["plus", "minus"] as const).filter((r) => config.rechenarten.includes(r));
  const op =
    rng.pick(erlaubt.length > 0 ? erlaubt : (["plus", "minus"] as const)) === "plus" ? "+" : "-";
  const stellen = Math.min(5, Math.max(2, config.stellen));
  const anzahl = Math.min(3, Math.max(2, config.zahlen));
  // erste Zahl hat genau `stellen` Stellen, die anderen gleich viele oder eine weniger
  const laengen = [
    stellen,
    ...Array.from({ length: anzahl - 1 }, () => rng.int(stellen - 1, stellen)),
  ];

  const zahlen =
    config.uebertrag === "ohne"
      ? ohneUebertrag(op, laengen, rng)
      : laengen.map((l) => zufallsZahl(rng, l));
  const ergebnis =
    op === "+"
      ? zahlen.reduce((s, z) => s + z, 0)
      : zahlen.slice(1).reduce((s, z) => s - z, zahlen[0]!);
  if (ergebnis < 1) return null;

  const task = { zahlen, op, ergebnis } as SchriftlichTask;
  const mitUebertrag = uebertraege(task).some((u) => u > 0);
  if (config.uebertrag === "mit" && !mitUebertrag) return null;
  if (config.uebertrag === "ohne" && mitUebertrag) return null;
  return task;
}

export function correctAnswer(task: SchriftlichTask): SchriftlichAnswer {
  const a: SchriftlichAnswer = {};
  for (let k = 0; k < stellenVon(task.ergebnis); k++)
    a[ergebnisFeld(k)] = String(ziffer(task.ergebnis, k));
  uebertraege(task).forEach((u, k) => {
    if (k > 0 && k < stellenVon(task.ergebnis)) a[uebertragFeld(k)] = u > 0 ? String(u) : "";
  });
  return a;
}

export function emptyAnswer(task: SchriftlichTask): SchriftlichAnswer {
  return Object.fromEntries(Object.keys(correctAnswer(task)).map((k) => [k, ""]));
}

/** Das käme heraus, wenn man alle Überträge vergisst. */
function ohneUebertraegeGerechnet(task: SchriftlichTask): number {
  let n = 0;
  for (let k = 0; k < stellenVon(task.ergebnis); k++) {
    const [a, ...rest] = task.zahlen;
    const s = rest.reduce((s, z) => s + ziffer(z, k), 0);
    const d = task.op === "+" ? (ziffer(a!, k) + s) % 10 : Math.abs(ziffer(a!, k) - s) % 10;
    n += d * 10 ** k;
  }
  return n;
}

export function check(task: SchriftlichTask, answer: SchriftlichAnswer): CheckResult {
  const stellen = stellenVon(task.ergebnis);
  const wrongFields: string[] = [];
  let eingabe = 0;
  for (let k = 0; k < stellen; k++) {
    const v = answer[ergebnisFeld(k)];
    if (v !== String(ziffer(task.ergebnis, k))) wrongFields.push(ergebnisFeld(k));
    eingabe += Number(v || 0) * 10 ** k;
  }
  if (wrongFields.length === 0) return { status: "richtig", wrongFields };
  const leer = wrongFields.every((f) => !answer[f]);
  return {
    status: wrongFields.length < stellen ? "teilweise" : "falsch",
    wrongFields,
    errorTag: leer
      ? undefined
      : eingabe === ohneUebertraegeGerechnet(task)
        ? "Übertrag vergessen"
        : "Verrechnet",
  };
}

const STELLEN = ["Einer", "Zehner", "Hunderter", "Tausender", "Zehntausender"];

export function solution(task: SchriftlichTask): SolutionStep[] {
  const u = uebertraege(task);
  const steps: SolutionStep[] = [{ text: "Fang rechts bei den Einern an." }];
  for (let k = 0; k < stellenVon(task.ergebnis); k++) {
    const [a, ...rest] = task.zahlen;
    const ziffern = rest.filter((z) => stellenVon(z) > k).map((z) => ziffer(z, k));
    const ue = u[k]! > 0 ? [u[k]!] : [];
    const e = ziffer(task.ergebnis, k);
    const name = STELLEN[k] ?? `${k + 1}. Stelle`;
    if (task.op === "+") {
      const teile = [ziffer(a!, k), ...ziffern, ...ue].filter(
        (d, i) => i === 0 || d > 0 || stellenVon(a!) <= k,
      );
      const summe = teile.reduce((s, d) => s + d, 0);
      steps.push({
        text: `${name}: ${teile.join(` ${PLUS} `)} = ${summe}${u[k + 1]! > 0 ? `, schreibe ${e}, Übertrag ${u[k + 1]}` : ""}`,
      });
    } else {
      const unten = [...ziffern, ...ue];
      const oben = ziffer(a!, k) + 10 * u[k + 1]!;
      steps.push({
        text: `${name}: ${oben} ${MINUS} ${unten.join(` ${MINUS} `) || "0"} = ${e}${u[k + 1]! > 0 ? ` (Übertrag ${u[k + 1]})` : ""}`,
      });
    }
  }
  steps.push({ text: `Ergebnis: ${task.ergebnis}` });
  return steps;
}

export function hint(task: SchriftlichTask): string {
  return task.op === "+"
    ? "Rechne von rechts nach links. Ist eine Summe 10 oder mehr, schreibe den Übertrag klein in die nächste Spalte."
    : "Rechne von rechts nach links. Ist die obere Ziffer zu klein, nimm 10 dazu und schreibe einen Übertrag.";
}
