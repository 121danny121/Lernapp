import { generateTask } from "../../core/generate";
import { createRng } from "../../core/rng";
import { runStandardChecks } from "../testing";
import {
  istErgebnis,
  kaestchen,
  normalisiereVorgabe,
  restZeile,
  schritte,
  solution,
} from "./generator";
import { zerlege } from "./zerlegen";
import { divisionSchriftlich } from "./index";

describe("division-schriftlich", () => {
  test("1.000er-Test: alle Bedingungen", () => {
    runStandardChecks(divisionSchriftlich, (task, config) => {
      expect(String(task.dividend)).toHaveLength(config.stellen);
      expect(config.divisoren).toContain(String(task.divisor));
      if (config.methode !== "gemischt") expect(task.methode).toBe(config.methode);
      if (task.methode === "normal") {
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
      } else {
        const z = zerlege(task.dividend, task.divisor)!;
        expect(z.teil1 + z.teil2).toBe(task.dividend);
        expect(z.teil1).toBe(z.q1 * task.divisor);
        expect(z.teil2).toBe(z.q2 * task.divisor + z.rest);
        expect(z.q1 % 10).toBe(0);
        expect(z.q2).toBeGreaterThanOrEqual(1);
        expect(z.q2).toBeLessThanOrEqual(9);
        expect(z.q1 + z.q2).toBe(z.q);
        if (!config.mitRest) expect(z.rest).toBe(0);
        // Die Zerlegung ist eindeutig: Teilergebnis und (erster Teil oder Teiler) stehen da
        const b = kaestchen(task)
          .filter((k) => k.name.startsWith("b"))
          .map((k) => k.name);
        for (const n of b) expect(task.gegeben).toContain(n);
        const a = kaestchen(task)
          .filter((k) => k.name.startsWith("a"))
          .map((k) => k.name);
        const teilerOderTeil =
          task.gegeben.includes("t1") || a.every((n) => task.gegeben.includes(n));
        expect(teilerOderTeil).toBe(true);
      }
      // jede Ziffer ist wirklich eine Ziffer
      for (const k of kaestchen(task)) expect(k.ziffer).toMatch(/^\d$/);
      const alle = kaestchen({ ...task, gegeben: [] }).map((k) => k.name);
      for (const g of task.gegeben) expect(alle).toContain(g);
      const offen = alle.filter((k) => !task.gegeben.includes(k));
      switch (normalisiereVorgabe(config.vorgabe)) {
        case "keine":
          expect(offen.length).toBeGreaterThanOrEqual(3);
          break;
        case "ergebnis":
          expect(offen.some(istErgebnis)).toBe(false);
          expect(offen.length).toBeGreaterThan(0);
          break;
        case "rechenweg":
          expect(offen.every(istErgebnis)).toBe(true);
          break;
        default:
          expect(offen.length).toBeGreaterThanOrEqual(3);
          expect(offen.some(istErgebnis)).toBe(true);
          expect(task.gegeben.length).toBeGreaterThan(0);
      }
      if (normalisiereVorgabe(config.vorgabe) === "keine" && task.methode === "normal") {
        expect(task.gegeben).toEqual([]);
      }
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
      solution({ methode: "normal", dividend: 156, divisor: 4, mitRest: false, gegeben: [] }).map(
        (x) => x.text,
      ),
    ).toEqual([
      "15 : 4 = 3, denn 3 · 4 = 12",
      "15 − 12 = 3, hole die nächste Ziffer herunter: 36",
      "36 : 4 = 9, denn 9 · 4 = 36",
      "36 − 36 = 0",
      "Ergebnis: 156 : 4 = 39",
    ]);
  });

  test("Lücken-Varianten: Ergebnis vorgegeben bzw. Rechenweg vorgegeben", () => {
    const rng = createRng(1);
    const cfg = { ...divisionSchriftlich.defaults.mittel };
    const mitErgebnis = generateTask(divisionSchriftlich, { ...cfg, vorgabe: "ergebnis" }, rng)!;
    expect(Object.keys(divisionSchriftlich.emptyAnswer(mitErgebnis)).some(istErgebnis)).toBe(false);
    const mitWeg = generateTask(divisionSchriftlich, { ...cfg, vorgabe: "rechenweg" }, rng)!;
    expect(Object.keys(divisionSchriftlich.emptyAnswer(mitWeg)).every(istErgebnis)).toBe(true);
  });

  test("alte Einstellungen werden weiter verstanden", () => {
    expect(normalisiereVorgabe("alles")).toBe("keine");
    expect(normalisiereVorgabe("luecken")).toBe("einige");
  });

  test("Zerlegen wie im Übungsblatt: 228 : 6 = 38", () => {
    expect(zerlege(228, 6)).toEqual({ q: 38, rest: 0, teil1: 180, q1: 30, teil2: 48, q2: 8 });
    expect(zerlege(456, 8)).toMatchObject({ teil1: 400, q1: 50, teil2: 56, q2: 7 });
    expect(zerlege(240, 6)).toBeNull(); // 40 = 40 + 0 – keine echte Zerlegung
    const task = {
      methode: "zerlegen",
      dividend: 228,
      divisor: 6,
      mitRest: false,
      gegeben: ["a0", "a1", "a2", "b0", "b1"],
    } as const;
    const t = { ...task, gegeben: [...task.gegeben] };
    expect(divisionSchriftlich.correctAnswer(t)).toEqual({
      t1: "6",
      c0: "4",
      c1: "8",
      t2: "6",
      f0: "8",
      t0: "6",
      e0: "3",
      e1: "8",
    });
    expect(solution(t).map((x) => x.text)).toEqual([
      "Zerlege 228 = 180 + 48 – 180 lässt sich leicht durch 6 teilen.",
      "180 : 6 = 30",
      "48 : 6 = 8",
      "30 + 8 = 38",
      "Also: 228 : 6 = 38",
    ]);
    const falsch = divisionSchriftlich.check(t, {
      ...divisionSchriftlich.correctAnswer(t),
      c1: "9",
    });
    expect(falsch).toMatchObject({
      status: "teilweise",
      wrongFields: ["c1"],
      errorTag: "Zerlegung falsch",
    });
  });

  test("Null im Ergebnis: 1612 : 4 = 403", () => {
    const s = schritte(1612, 4);
    expect(s.map((x) => x.q).join("")).toBe("403");
    expect(restZeile(1612, s, 0)).toBe("01");
  });
});
