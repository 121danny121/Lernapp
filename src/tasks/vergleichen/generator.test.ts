import { generateRound } from "../../core/generate";
import { runStandardChecks } from "../testing";
import { check, type Term } from "./generator";
import { vergleichen } from "./index";

const rechne = (t: Term) =>
  t.op === "+" ? t.a + t.b : t.op === "-" ? t.a - t.b : t.op === "*" ? t.a * t.b : t.a / t.b;

describe("vergleichen", () => {
  test("1.000er-Test: alle Bedingungen", () => {
    const ops: Record<string, string> = { "+": "plus", "-": "minus", "*": "mal", ":": "geteilt" };
    runStandardChecks(vergleichen, (task, config) => {
      for (const t of [task.links, task.rechts]) {
        expect(rechne(t)).toBe(t.wert);
        expect(t.wert).toBeLessThanOrEqual(Number(config.zahlenraum));
        expect(t.wert).toBeGreaterThanOrEqual(1);
        expect(config.rechenarten).toContain(ops[t.op]);
      }
    });
  });

  test("„=“ kommt etwa im eingestellten Anteil vor", () => {
    const tasks = generateRound(
      vergleichen,
      { ...vergleichen.defaults.mittel, anteilGleich: 50 },
      3,
      200,
    );
    const gleich = tasks.filter((t) => t.links.wert === t.rechts.wert).length;
    expect(gleich).toBeGreaterThan(50);
  });

  test("Beispiel 6 · 80 ◯ 40 · 9", () => {
    const t = {
      links: { a: 6, op: "*", b: 80, wert: 480 },
      rechts: { a: 40, op: "*", b: 9, wert: 360 },
    } as const;
    expect(check(t, { z: ">" }).status).toBe("richtig");
    expect(check(t, { z: "<" }).errorTag).toBe("Zeichen verdreht");
  });
});
