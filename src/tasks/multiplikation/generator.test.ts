import { runStandardChecks } from "../testing";
import { check, solution } from "./generator";
import { multiplikation } from "./index";

describe("multiplikation", () => {
  test("1.000er-Test: alle Bedingungen", () => {
    runStandardChecks(multiplikation, (task, config) => {
      expect(task.a * task.b).toBe(task.c);
      const passtArt = (gross: number) =>
        config.arten.some((art) => {
          if (art === "einmaleins") return gross >= 1 && gross <= 10;
          if (art === "zehner") return gross % 10 === 0 && gross >= 10 && gross <= 90;
          if (art === "zweistellig") return gross >= 11 && gross <= 99 && gross % 10 !== 0;
          if (art === "dreistellig") return gross >= 101 && gross <= 999 && gross % 10 !== 0;
          return false;
        });
      const ok = (klein: number, gross: number) =>
        config.reihen.includes(String(klein)) && passtArt(gross);
      expect(ok(task.a, task.b) || ok(task.b, task.a), JSON.stringify(task)).toBe(true);
      if (config.luecke === "ergebnis") expect(task.gap).toBe("c");
      if (config.luecke === "faktor") expect(task.gap).not.toBe("c");
      if (task.gap !== "c") expect(Math.min(task.a, task.b)).toBeGreaterThan(1);
    });
  });

  test("7 · 58 = 7 · 50 + 7 · 8", () => {
    const t = { a: 7, b: 58, c: 406, gap: "c" } as const;
    expect(solution(t).map((s) => s.text)).toEqual([
      "Zerlege 58 = 50 + 8",
      "7 · 50 = 350",
      "7 · 8 = 56",
      "350 + 56 = 406",
      "Also: 7 · 58 = 406",
    ]);
    expect(check(t, { x: "358" }).errorTag).toBe("Einer nicht malgenommen");
    expect(check(t, { x: "413" }).errorTag).toBe("Um eine Reihe verrutscht");
  });
});
