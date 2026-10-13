/** Rechenzeichen, wie sie in der Grundschule geschrieben werden. */
export const PLUS = "+";
export const MINUS = "−";
export const MAL = "·";
export const GETEILT = ":";

/** Zerlegt eine Zahl in ihre Stellenwerte (ohne Nullen), z. B. 365 → [300, 60, 5]. */
export function stellenwerte(n: number): number[] {
  const parts: number[] = [];
  let factor = 1;
  let rest = n;
  while (rest > 0) {
    const digit = rest % 10;
    if (digit !== 0) parts.unshift(digit * factor);
    rest = Math.floor(rest / 10);
    factor *= 10;
  }
  return parts;
}

/** Wandelt eine Eingabe in eine Zahl um; leere Eingabe → null. */
export function parseAnswer(value: string | undefined): number | null {
  if (value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
}
