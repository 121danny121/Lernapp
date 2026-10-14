import { runStandardChecks } from "../testing";
import { kaestchen, restZeile, schritte, solution } from "./generator";
import { divisionSchriftlich } from "./index";

describe("division-schriftlich", () => {
  test("1.000er-Test: alle Bedingungen", () => {
    runStandardChecks(divisionSchriftlich, (task, config) => {
      expect(String(task.dividend)).toHaveLength(config.stellen);
      expect(config.divisoren).toContain(String(task.divisor));
      const s = schritte(task.dividend, task.divisor);
      expect(s.length).toBeGreaterThanOrEqual(2);
      // Verfahren stimmt: Quotient aus den Ziffern, Rest am Ende
      const q = Number(s.map((x) => x.q).join(""));
      const rest = s[s.length - 1]!.rest;
      expect(q * task.divisor + rest).toBe(task.dividend);
      expect(rest).toBeLessThan(task.divisor);
      if (!config.mitRest) expect(rest).toBe(0);
      for (const x of s) {
        expect(x.q).toBeLessThanOrEqual(9);
        expect(x.produkt).toBe(x.q * task.divisor);
        expect(x.rest).toBeLessThan(task.divisor);
      }
      // jede Ziffer ist wirklich eine Ziffer
      for (const k of kaestchen(task)) expect(k.ziffer).toMatch(/^\d$/);
      if (config.vorgabe === "alles") expect(task.gegeben).toEqual([]);
    });
  });

  test("Beispiel 156 : 4 = 39", () => {
    const s = schritte(156, 4);
    expect(s.map((x) => [x.teil, x.q, x.produkt, x.rest])).toEqual([
      [15, 3, 12, 3],
      [36, 9, 36, 0],
    ]);
    expect(restZeile(156, s, 0)).toBe("36");
    expect(
      solution({ dividend: 156, divisor: 4, mitRest: false, gegeben: [] }).map((x) => x.text),
    ).toEqual([
      "15 : 4 = 3, denn 3 · 4 = 12",
      "15 − 12 = 3, hole die nächste Ziffer herunter: 36",
      "36 : 4 = 9, denn 9 · 4 = 36",
      "36 − 36 = 0",
      "Ergebnis: 156 : 4 = 39",
    ]);
  });

  test("Null im Ergebnis: 1612 : 4 = 403", () => {
    const s = schritte(1612, 4);
    expect(s.map((x) => x.q).join("")).toBe("403");
    expect(restZeile(1612, s, 0)).toBe("01");
  });
});
