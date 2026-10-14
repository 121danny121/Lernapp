import { MINUS, PLUS, parseAnswer } from "../../core/format";
import type { Rng } from "../../core/rng";
import type { CheckResult, SolutionStep } from "../../core/types";

export type PyramideConfig = {
  stufen: "3" | "4";
  zahlenraum: "20" | "100" | "1000";
  /** "unten": die unterste Reihe ist vorgegeben; "gemischt": verteilte Steine, auch rückwärts rechnen */
  vorgabe: "unten" | "gemischt";
};

/**
 * Steine Reihe für Reihe von unten nach oben: steine[0] ist die unterste Reihe.
 * Jeder Stein ist die Summe der beiden Steine darunter.
 */
export interface PyramideTask {
  steine: number[][];
  /** gleiche Form wie `steine`: true = Zahl steht schon da */
  gegeben: boolean[][];
}

export type PyramideAnswer = Record<string, string>;

export const feldName = (r: number, i: number) => `s${r}_${i}`;

export function baue(basis: number[]): number[][] {
  const steine = [basis];
  while (steine[steine.length - 1]!.length > 1) {
    const unten = steine[steine.length - 1]!;
    steine.push(unten.slice(1).map((v, i) => unten[i]! + v));
  }
  return steine;
}

export interface Schritt {
  r: number;
  i: number;
  text: string;
}

/**
 * Löst die Pyramide schrittweise, so wie ein Kind es tun würde: Sind zwei von drei Steinen
 * (ein Stein und die zwei darunter) bekannt, ergibt sich der dritte. Liefert die Reihenfolge
 * der Schritte oder null, wenn so nicht alle Steine gefunden werden (dann nicht eindeutig lösbar).
 */
export function loesen(task: PyramideTask): Schritt[] | null {
  const { steine } = task;
  const bekannt = task.gegeben.map((r) => [...r]);
  const schritte: Schritt[] = [];
  let weiter = true;
  while (weiter) {
    weiter = false;
    for (let r = 1; r < steine.length; r++) {
      for (let i = 0; i < steine[r]!.length; i++) {
        const o = bekannt[r]![i]!;
        const l = bekannt[r - 1]![i]!;
        const rr = bekannt[r - 1]![i + 1]!;
        const [vo, vl, vr] = [steine[r]![i]!, steine[r - 1]![i]!, steine[r - 1]![i + 1]!];
        if (!o && l && rr) {
          bekannt[r]![i] = true;
          schritte.push({ r, i, text: `${vl} ${PLUS} ${vr} = ${vo}` });
          weiter = true;
        } else if (o && l && !rr) {
          bekannt[r - 1]![i + 1] = true;
          schritte.push({ r: r - 1, i: i + 1, text: `${vo} ${MINUS} ${vl} = ${vr}` });
          weiter = true;
        } else if (o && !l && rr) {
          bekannt[r - 1]![i] = true;
          schritte.push({ r: r - 1, i, text: `${vo} ${MINUS} ${vr} = ${vl}` });
          weiter = true;
        }
      }
    }
  }
  return bekannt.every((r) => r.every(Boolean)) ? schritte : null;
}

export function generate(config: PyramideConfig, rng: Rng): PyramideTask | null {
  const n = Number(config.stufen);
  const max = Number(config.zahlenraum);
  // Spitze = Summe der Basis mit Binomialgewichten (1 2 1 bzw. 1 3 3 1)
  const gewicht = 2 ** (n - 1);
  const obergrenze = Math.max(1, Math.floor((max / gewicht) * 1.5));
  const basis = Array.from({ length: n }, () => rng.int(1, obergrenze));
  const steine = baue(basis);
  if (steine[n - 1]![0]! > max) return null;

  let gegeben: boolean[][];
  if (config.vorgabe === "unten") {
    gegeben = steine.map((reihe, r) => reihe.map(() => r === 0));
  } else {
    // n zufällige Steine vorgeben – aber nicht nur die unterste Reihe
    const alle = steine.flatMap((reihe, r) => reihe.map((_, i) => [r, i] as const));
    const wahl = new Set(
      rng
        .shuffle(alle)
        .slice(0, n)
        .map(([r, i]) => feldName(r, i)),
    );
    gegeben = steine.map((reihe, r) => reihe.map((_, i) => wahl.has(feldName(r, i))));
    if (gegeben[0]!.every(Boolean)) return null;
  }
  const task = { steine, gegeben };
  return loesen(task) ? task : null;
}

export function felder(task: PyramideTask): string[] {
  // Reihenfolge des Lösungswegs = Reihenfolge, in der das Kind die Steine findet
  return (loesen(task) ?? []).map((s) => feldName(s.r, s.i));
}

export function correctAnswer(task: PyramideTask): PyramideAnswer {
  const a: PyramideAnswer = {};
  task.steine.forEach((reihe, r) =>
    reihe.forEach((v, i) => {
      if (!task.gegeben[r]![i]) a[feldName(r, i)] = String(v);
    }),
  );
  return a;
}

export function emptyAnswer(task: PyramideTask): PyramideAnswer {
  return Object.fromEntries(Object.keys(correctAnswer(task)).map((k) => [k, ""]));
}

export function check(task: PyramideTask, answer: PyramideAnswer): CheckResult {
  const richtig = correctAnswer(task);
  const wrongFields = Object.keys(richtig).filter(
    (k) => parseAnswer(answer[k]) !== Number(richtig[k]),
  );
  if (wrongFields.length === 0) return { status: "richtig", wrongFields };
  const status = wrongFields.length < Object.keys(richtig).length ? "teilweise" : "falsch";
  const unten = wrongFields.some((f) => {
    const [r, i] = f.slice(1).split("_").map(Number);
    return task.gegeben[r! + 1]?.some((g, j) => g && (j === i || j === i! - 1));
  });
  return { status, wrongFields, errorTag: unten ? "Rückwärts rechnen (Minus)" : "Verrechnet" };
}

export function solution(task: PyramideTask): SolutionStep[] {
  return [
    { text: "Jeder Stein ist die Summe der beiden Steine darunter." },
    ...(loesen(task) ?? []).map((s) => ({ text: s.text })),
  ];
}

export function hint(task: PyramideTask): string {
  return task.gegeben[0]!.every(Boolean)
    ? "Zähle immer zwei Steine nebeneinander zusammen – das Ergebnis kommt in den Stein darüber."
    : "Suche einen Stein, bei dem du schon zwei von drei Zahlen kennst. Fehlt unten eine Zahl, rechne Minus.";
}
