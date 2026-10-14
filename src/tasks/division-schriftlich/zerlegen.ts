import { GETEILT, PLUS } from "../../core/format";
import type { Rng } from "../../core/rng";
import type { SolutionStep } from "../../core/types";

/**
 * Halbschriftliche Division durch Zerlegen – wie auf vielen Übungsblättern:
 *
 *   228 : 6 = 38
 *   180 : 6 = 30
 *    48 : 6 =  8
 *
 * Der Dividend wird in eine Zehner-Zahl (bzw. Hunderter) mal Divisor und den Rest zerlegt.
 */
export interface Zerlegung {
  q: number;
  rest: number;
  /** erster Teil (z. B. 180) und sein Ergebnis (30) */
  teil1: number;
  q1: number;
  /** zweiter Teil (z. B. 48) und sein Ergebnis (8) */
  teil2: number;
  q2: number;
}

export function zerlege(dividend: number, divisor: number): Zerlegung | null {
  const q = Math.floor(dividend / divisor);
  const rest = dividend % divisor;
  const q2 = q % 10;
  const q1 = q - q2;
  // Beide Teile müssen sinnvoll sein: 30 und 8, nicht 0 oder 30 und 0
  if (q1 < 10 || q2 < 1) return null;
  const teil1 = q1 * divisor;
  return { q, rest, teil1, q1, teil2: dividend - teil1, q2 };
}

export interface ZerlegenKaestchen {
  name: string;
  ziffer: string;
}

/**
 * Alle Kästchen in Ausfüll-Reihenfolge: erst die Zerlegung (Zeile 2 und 3), dann das Ergebnis.
 * Namen: t0/t1/t2 = Teiler je Zeile, a/b = Teil 1 und Ergebnis, c/f = Teil 2 und Ergebnis,
 * e = Gesamtergebnis, R2/R0 = Rest.
 */
export function zerlegenKaestchen(
  dividend: number,
  divisor: number,
  mitRest: boolean,
): ZerlegenKaestchen[] {
  const z = zerlege(dividend, divisor)!;
  const ziffern = (prefix: string, n: number) =>
    String(n)
      .split("")
      .map((ziffer, j) => ({ name: `${prefix}${j}`, ziffer }));
  const d = String(divisor);
  return [
    { name: "t1", ziffer: d },
    ...ziffern("a", z.teil1),
    ...ziffern("b", z.q1),
    ...ziffern("c", z.teil2),
    { name: "t2", ziffer: d },
    ...ziffern("f", z.q2),
    ...(mitRest ? [{ name: "R2", ziffer: String(z.rest) }] : []),
    { name: "t0", ziffer: d },
    ...ziffern("e", z.q),
    ...(mitRest ? [{ name: "R0", ziffer: String(z.rest) }] : []),
  ];
}

/**
 * Vorgaben wie auf dem Übungsblatt: In der zweiten Zeile steht immer das Teilergebnis und
 * entweder der erste Teil (180 : __ = 30) oder der Teiler (__ : 7 = 30). Damit ist die
 * Zerlegung eindeutig – ohne diese Vorgabe könnte man auch anders zerlegen.
 */
export function grundVorgabe(
  dividend: number,
  divisor: number,
  mitRest: boolean,
  rng: Rng,
): string[] {
  const namen = zerlegenKaestchen(dividend, divisor, mitRest).map((k) => k.name);
  const b = namen.filter((n) => n.startsWith("b"));
  return rng.chance(0.5) ? [...namen.filter((n) => n.startsWith("a")), ...b] : ["t1", ...b];
}

export const zerlegenFehler = (feld: string): string => {
  if (feld.startsWith("a") || feld.startsWith("c")) return "Zerlegung falsch";
  if (feld.startsWith("b") || feld.startsWith("f") || feld === "R2") return "Teilergebnis falsch";
  if (feld.startsWith("t")) return "Teiler falsch";
  return "Ergebnis falsch";
};

export function zerlegenLoesung(
  dividend: number,
  divisor: number,
  mitRest: boolean,
): SolutionStep[] {
  const z = zerlege(dividend, divisor)!;
  const rest = mitRest && z.rest > 0 ? ` Rest ${z.rest}` : "";
  return [
    {
      text: `Zerlege ${dividend} = ${z.teil1} ${PLUS} ${z.teil2} – ${z.teil1} lässt sich leicht durch ${divisor} teilen.`,
    },
    { text: `${z.teil1} ${GETEILT} ${divisor} = ${z.q1}` },
    { text: `${z.teil2} ${GETEILT} ${divisor} = ${z.q2}${rest}` },
    { text: `${z.q1} ${PLUS} ${z.q2} = ${z.q}` },
    { text: `Also: ${dividend} ${GETEILT} ${divisor} = ${z.q}${mitRest ? ` Rest ${z.rest}` : ""}` },
  ];
}

export function zerlegenTipp(dividend: number, divisor: number): string {
  const z = zerlege(dividend, divisor)!;
  return `Zerlege die große Aufgabe in zwei leichte: Welche Zehnerzahl mal ${divisor} passt in ${dividend}? Zum Beispiel ${z.q1} · ${divisor} = ${z.teil1}.`;
}
