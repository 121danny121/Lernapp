import { runStandardChecks } from "../testing";
import { check, solution, stellenVon, uebertraege, type SchriftlichTask } from "./generator";
import { schriftlichAddSub } from "./index";

describe("schriftlich-add-sub", () => {
  test("1.000er-Test: alle Bedingungen", () => {
    runStandardChecks(schriftlichAddSub, (task, config) => {
      const [a, ...rest] = task.zahlen;
      expect(task.ergebnis).toBe(
        task.op === "+" ? task.zahlen.reduce((s, z) => s + z, 0) : rest.reduce((s, z) => s - z, a!),
      );
      expect(task.ergebnis).toBeGreaterThan(0);
      expect(task.zahlen).toHaveLength(config.zahlen);
      expect(stellenVon(a!)).toBe(config.stellen);
      for (const z of rest) expect(stellenVon(z)).toBeGreaterThanOrEqual(config.stellen - 1);
      for (const z of rest) expect(stellenVon(z)).toBeLessThanOrEqual(config.stellen);
      if (config.rechenarten.length === 1)
        expect(task.op).toBe(config.rechenarten[0] === "plus" ? "+" : "-");
      const mit = uebertraege(task).some((u) => u > 0);
      if (config.uebertrag === "mit") expect(mit).toBe(true);
      if (config.uebertrag === "ohne") expect(mit).toBe(false);
    });
  });

  test("Beispiel 458 + 367 = 825", () => {
    const t: SchriftlichTask = { zahlen: [458, 367], op: "+", ergebnis: 825 };
    expect(uebertraege(t)).toEqual([0, 1, 1, 0]);
    expect(check(t, { e0: "5", e1: "2", e2: "8" }).status).toBe("richtig");
    // Übertrag vergessen: 458 + 367 → 715
    expect(check(t, { e0: "5", e1: "1", e2: "7" })).toMatchObject({
      status: "teilweise",
      errorTag: "Übertrag vergessen",
    });
    expect(solution(t).map((s) => s.text)).toEqual([
      "Fang rechts bei den Einern an.",
      "Einer: 8 + 7 = 15, schreibe 5, Übertrag 1",
      "Zehner: 5 + 6 + 1 = 12, schreibe 2, Übertrag 1",
      "Hunderter: 4 + 3 + 1 = 8",
      "Ergebnis: 825",
    ]);
  });

  test("Minus mit Übertrag: 532 − 187 = 345", () => {
    const t: SchriftlichTask = { zahlen: [532, 187], op: "-", ergebnis: 345 };
    expect(uebertraege(t)).toEqual([0, 1, 1, 0]);
    expect(solution(t)[1]!.text).toBe("Einer: 12 − 7 = 5 (Übertrag 1)");
  });
});
