import { runStandardChecks } from "../testing";
import { baue, check, loesen } from "./generator";
import { rechenpyramide } from "./index";

describe("rechenpyramide", () => {
  test("1.000er-Test: alle Bedingungen", () => {
    runStandardChecks(rechenpyramide, (task, config) => {
      const n = Number(config.stufen);
      expect(task.steine).toHaveLength(n);
      // Jeder Stein ist die Summe der beiden darunter
      for (let r = 1; r < n; r++)
        task.steine[r]!.forEach((v, i) =>
          expect(v).toBe(task.steine[r - 1]![i]! + task.steine[r - 1]![i + 1]!),
        );
      expect(task.steine[n - 1]![0]).toBeLessThanOrEqual(Number(config.zahlenraum));
      for (const v of task.steine[0]!) expect(v).toBeGreaterThan(0);
      // eindeutig lösbar
      expect(loesen(task)).not.toBeNull();
      const anzahlGegeben = task.gegeben.flat().filter(Boolean).length;
      expect(anzahlGegeben).toBe(n);
      if (config.vorgabe === "unten") expect(task.gegeben[0]!.every(Boolean)).toBe(true);
      else expect(task.gegeben[0]!.every(Boolean)).toBe(false);
    });
  });

  test("Rückwärts rechnen", () => {
    const steine = baue([3, 5, 2]); // [[3,5,2],[8,7],[15]]
    const task = { steine, gegeben: [[true, false, false], [false, true], [true]] };
    expect(loesen(task)!.map((s) => s.text)).toEqual(["15 − 7 = 8", "8 − 3 = 5", "7 − 5 = 2"]);
    expect(check(task, { s0_1: "5", s0_2: "2", s1_0: "8" }).status).toBe("richtig");
    expect(check(task, { s0_1: "5", s0_2: "3", s1_0: "8" })).toMatchObject({
      status: "teilweise",
      wrongFields: ["s0_2"],
    });
  });
});
