import { runStandardChecks } from "../testing";
import { check, solution } from "./generator";
import { division } from "./index";

describe("division", () => {
  test("1.000er-Test: alle Bedingungen", () => {
    runStandardChecks(division, (task, config) => {
      const lo = Math.min(config.dividendVon, config.dividendBis);
      const hi = Math.max(config.dividendVon, config.dividendBis);
      expect(task.dividend).toBeGreaterThanOrEqual(lo);
      expect(task.dividend).toBeLessThanOrEqual(hi);
      expect(task.divisor).toBeGreaterThanOrEqual(2);
      expect(task.divisor).toBeLessThanOrEqual(9);
      expect(config.divisoren).toContain(String(task.divisor));
      expect(task.quotient).toBeGreaterThanOrEqual(1);
      expect(task.quotient * task.divisor + task.rest).toBe(task.dividend);
      expect(task.rest).toBeLessThan(task.divisor);
      // Ohne „mit Rest“ geht die Division immer auf.
      if (!config.mitRest) expect(task.rest).toBe(0);
      expect(task.mitRest).toBe(config.mitRest);
    });
  });

  test("Beispiel 156 : 4 = 39", () => {
    const t = { dividend: 156, divisor: 4, quotient: 39, rest: 0, mitRest: false };
    expect(check(t, { q: "39", r: "" }).status).toBe("richtig");
    expect(check(t, { q: "38", r: "" })).toMatchObject({
      status: "falsch",
      errorTag: "Um eins daneben",
    });
    expect(solution(t).map((s) => s.text)).toEqual([
      "Zerlege 156 = 120 + 36",
      "120 : 4 = 30",
      "36 : 4 = 9",
      "30 + 9 = 39",
      "Also: 156 : 4 = 39",
      "Probe: 39 · 4 = 156",
    ]);
  });

  test("mit Rest: teilweise richtig markiert nur das falsche Feld", () => {
    const t = { dividend: 159, divisor: 4, quotient: 39, rest: 3, mitRest: true };
    expect(check(t, { q: "39", r: "3" }).status).toBe("richtig");
    expect(check(t, { q: "39", r: "2" })).toMatchObject({
      status: "teilweise",
      wrongFields: ["r"],
      errorTag: "Rest falsch",
    });
    expect(check(t, { q: "38", r: "7" })).toMatchObject({
      wrongFields: ["q", "r"],
      errorTag: "Rest zu groß",
    });
  });
});
