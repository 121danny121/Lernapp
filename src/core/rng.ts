/** Seeded Zufallsgenerator (Mulberry32): gleicher Seed → gleiche Aufgaben. */
export interface Rng {
  /** Zahl in [0, 1). */
  next(): number;
  /** Ganze Zahl in [min, max] (beide inklusive). */
  int(min: number, max: number): number;
  /** Zufälliges Element eines nicht-leeren Arrays. */
  pick<T>(items: readonly T[]): T;
  /** true mit Wahrscheinlichkeit p. */
  chance(p: number): boolean;
  /** Neues, gemischtes Array. */
  shuffle<T>(items: readonly T[]): T[];
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => {
    const lo = Math.ceil(Math.min(min, max));
    const hi = Math.floor(Math.max(min, max));
    return lo + Math.floor(next() * (hi - lo + 1));
  };
  return {
    next,
    int,
    pick: (items) => {
      if (items.length === 0) throw new Error("pick() auf leerem Array");
      return items[int(0, items.length - 1)]!;
    },
    chance: (p) => next() < p,
    shuffle: (items) => {
      const a = [...items];
      for (let i = a.length - 1; i > 0; i--) {
        const j = int(0, i);
        [a[i], a[j]] = [a[j]!, a[i]!];
      }
      return a;
    },
  };
}

/** Neuer zufälliger Seed (für eine Übungsrunde). */
export function randomSeed(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0]!;
}
