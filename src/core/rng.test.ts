import { createRng } from "./rng";

describe("Rng", () => {
  test("gleicher Seed → gleiche Folge", () => {
    const a = createRng(42);
    const b = createRng(42);
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next());
  });

  test("int bleibt im Bereich (inklusive) und trifft beide Ränder", () => {
    const rng = createRng(1);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const n = rng.int(3, 7);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(7);
      seen.add(n);
    }
    expect([...seen].sort()).toEqual([3, 4, 5, 6, 7]);
  });

  test("shuffle behält alle Elemente", () => {
    const rng = createRng(7);
    expect(rng.shuffle([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
