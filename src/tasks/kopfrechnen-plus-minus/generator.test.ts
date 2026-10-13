import { runStandardChecks } from "../testing";
import { check, solution, unitFor } from "./generator";
import { kopfrechnenPlusMinus } from "./index";

describe("kopfrechnen-plus-minus", () => {
  test("1.000er-Test: alle Bedingungen", () => {
    runStandardChecks(kopfrechnenPlusMinus, (task, config) => {
      const max = Number(config.zahlenraum);
      const unit = unitFor(config);
      const { a, b, c, op } = task;
      // Rechnung stimmt
      expect(op === "+" ? a + b : a - b).toBe(c);
      // Zahlenraum eingehalten, keine Null-Aufgaben
      for (const n of [a, b, c]) expect(n).toBeLessThanOrEqual(max);
      expect(a).toBeGreaterThan(0);
      expect(b).toBeGreaterThan(0);
      // Zehner-/Hunderterzahlen
      for (const n of [a, b, c]) expect(n % unit).toBe(0);
      // Rechenart
      if (config.rechenarten.length === 1) {
        expect(op).toBe(config.rechenarten[0] === "plus" ? "+" : "-");
      }
      // Lücke
      const gaps = { ergebnis: "c", erste: "a", zweite: "b" } as const;
      if (config.luecke !== "zufall") expect(task.gap).toBe(gaps[config.luecke]);
    });
  });

  test("Beispiele aus dem Übungsblatt", () => {
    expect(check({ a: 470, b: 260, op: "+", c: 730, gap: "c" }, { x: "730" }).status).toBe(
      "richtig",
    );
    expect(check({ a: 380, b: 270, op: "+", c: 650, gap: "b" }, { x: "270" }).status).toBe(
      "richtig",
    );
    expect(check({ a: 550, b: 480, op: "-", c: 70, gap: "a" }, { x: "550" }).status).toBe(
      "richtig",
    );
  });

  test("Fehlerkategorien", () => {
    const t = { a: 470, b: 260, op: "+", c: 730, gap: "c" } as const;
    expect(check(t, { x: "630" }).errorTag).toBe("Zehner-/Hunderterübergang");
    expect(check(t, { x: "210" }).errorTag).toBe("Plus und Minus verwechselt");
    expect(check(t, { x: "" }).status).toBe("falsch");
  });

  test("Lösungsweg rechnet schrittweise", () => {
    expect(solution({ a: 470, b: 260, op: "+", c: 730, gap: "c" }).map((s) => s.text)).toEqual([
      "Zerlege 260 = 200 + 60",
      "470 + 200 = 670",
      "670 + 60 = 730",
      "Also: 470 + 260 = 730",
    ]);
    expect(solution({ a: 550, b: 480, op: "-", c: 70, gap: "a" })[0]!.text).toBe(
      "Rechne mit der Umkehraufgabe: 70 + 480",
    );
  });
});
