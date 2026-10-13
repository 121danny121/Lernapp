import { nextTask, roundStars, startRound, submitAnswer, type RoundState } from "./session";
import type { CheckResult } from "./types";

const ok: CheckResult = { status: "richtig", wrongFields: [] };
const bad: CheckResult = { status: "falsch", wrongFields: ["x"], errorTag: "Übertrag vergessen" };

describe("Rundenlogik", () => {
  test("richtig → weiter → fertig", () => {
    let s: RoundState<string> = startRound(["a"]);
    s = submitAnswer(s, ok);
    expect(s.phase).toBe("richtig");
    s = nextTask(s);
    expect(s.phase).toBe("fertig");
    expect(s.outcomes).toEqual([{ wrongAttempts: 0, solved: true, errorTags: [] }]);
    expect(roundStars(s.outcomes)).toBe(3);
  });

  test("1. Fehlversuch → nochmal, dann richtig zählt halb", () => {
    let s = startRound(["a", "b"]);
    s = submitAnswer(s, bad);
    expect(s.phase).toBe("falsch");
    s = submitAnswer(s, ok);
    expect(s.phase).toBe("richtig");
    expect(s.outcomes[0]).toEqual({
      wrongAttempts: 1,
      solved: true,
      errorTags: ["Übertrag vergessen"],
    });
  });

  test("2. Fehlversuch → Lösung, Aufgabe kommt am Ende nochmal (nur einmal)", () => {
    let s = startRound(["a", "b"]);
    s = submitAnswer(s, bad);
    s = submitAnswer(s, bad);
    expect(s.phase).toBe("loesung");
    expect(s.items.map((i) => i.task)).toEqual(["a", "b", "a"]);
    s = nextTask(s);
    s = nextTask(submitAnswer(s, ok)); // b
    expect(s.items[s.index]).toEqual({ task: "a", repeat: true });
    s = submitAnswer(submitAnswer(s, bad), bad);
    expect(s.phase).toBe("loesung");
    expect(s.items).toHaveLength(3); // nicht erneut angehängt
    s = nextTask(s);
    expect(s.phase).toBe("fertig");
    // Wertung nur aus dem ersten Durchgang
    expect(s.outcomes).toHaveLength(2);
    expect(s.outcomes[0]!.solved).toBe(false);
    expect(s.outcomes[0]!.errorTags).toHaveLength(2);
  });

  test("Sterne", () => {
    const o = (solved: boolean, wrongAttempts = 0) => ({ solved, wrongAttempts, errorTags: [] });
    expect(roundStars(Array(10).fill(o(true)))).toBe(3);
    expect(roundStars([...Array(7).fill(o(true)), ...Array(3).fill(o(false, 2))])).toBe(2);
    expect(roundStars(Array(10).fill(o(false, 2)))).toBe(1);
  });

  test("leere Runde ist sofort fertig", () => {
    expect(startRound([]).phase).toBe("fertig");
  });
});
