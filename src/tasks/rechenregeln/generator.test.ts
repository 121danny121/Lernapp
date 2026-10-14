import { runStandardChecks } from "../testing";
import {
  anzahlBlaetter,
  istBlatt,
  rechenweg,
  regeln,
  rueckwaerts,
  text,
  wert,
  type Knoten,
} from "./ausdruck";
import { check, eindeutig, solution } from "./generator";
import { rechenregeln } from "./index";

const ops = (k: Knoten): number => (istBlatt(k) ? 0 : 1 + ops(k.l) + ops(k.r));

describe("rechenregeln", () => {
  test("1.000er-Test: alle Bedingungen", () => {
    let eindeutigGeprueft = 0;
    runStandardChecks(rechenregeln, (task, config) => {
      const max = Number(config.zahlenraum);
      expect(wert(task.baum)).toBe(task.ergebnis);
      expect(task.ergebnis).toBeLessThanOrEqual(max);
      expect(task.ergebnis).toBeGreaterThanOrEqual(1);
      expect(ops(task.baum)).toBe(Number(config.operationen));
      const r = regeln(task.baum);
      expect(r.punkt || r.klammer).toBe(true);
      if (r.punkt) expect(config.regeln).toContain("punkt");
      if (r.klammer) expect(config.regeln).toContain("klammer");
      if (config.gesucht === "ergebnis") expect(task.luecke).toBeNull();
      if (config.gesucht === "zahl") expect(task.luecke).not.toBeNull();
      if (task.luecke !== null) {
        expect(task.luecke).toBeLessThan(anzahlBlaetter(task.baum));
        if (eindeutigGeprueft++ < 300)
          expect(eindeutig(task.baum, task.luecke, task.ergebnis, 10 * max)).toBe(true);
      }
      // Rechenweg endet beim Ergebnis
      const weg = rechenweg(task.baum);
      expect(weg[weg.length - 1]).toMatch(new RegExp(`= ${task.ergebnis}$`));
    });
  });

  const b = (op: "+" | "-" | "*" | ":", l: Knoten | number, r: Knoten | number): Knoten => ({
    op,
    l: typeof l === "number" ? { n: l } : l,
    r: typeof r === "number" ? { n: r } : r,
  });

  test("Punkt vor Strich: 7 · 8 + 26", () => {
    const baum = b("+", b("*", 7, 8), 26);
    expect(text(baum)).toBe("7 · 8 + 26");
    expect(rechenweg(baum)).toEqual([
      "Punkt vor Strich: 7 · 8 = 56   →   56 + 26",
      "Dann: 56 + 26 = 82",
    ]);
    // Typischer Fehler: 26 + 7 · 8 von links nach rechts → 33 · 8 = 264
    const task = { baum: b("+", 26, b("*", 7, 8)), ergebnis: 82, luecke: null };
    expect(check(task, { x: "264" }).errorTag).toBe("Punkt vor Strich nicht beachtet");
  });

  test("Klammer: 240 : (11 − 5)", () => {
    const baum = b(":", 240, b("-", 11, 5));
    expect(text(baum)).toBe("240 : (11 − 5)");
    expect(rechenweg(baum)[0]).toBe("Klammer zuerst: 11 − 5 = 6   →   240 : 6");
  });

  test("Platzhalter: (__ + 20) · 3 = 150", () => {
    const baum = b("*", b("+", 30, 20), 3);
    expect(text(baum, 0)).toBe("(□ + 20) · 3");
    expect(rueckwaerts(baum, 0, 150)).toEqual(["□ + 20 = 150 : 3 = 50", "□ = 50 − 20 = 30"]);
    const task = { baum, ergebnis: 150, luecke: 0 };
    expect(check(task, { x: "30" }).status).toBe("richtig");
    expect(solution(task)[solution(task).length - 1]!.text).toBe("Probe: (30 + 20) · 3 = 150");
  });
});
