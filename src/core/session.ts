import type { CheckResult } from "./types";

/**
 * Rundenlogik als reine Funktionen (unabhängig von React, gut testbar).
 *
 * Ablauf pro Aufgabe:
 *  - richtig → Phase "richtig", danach weiter
 *  - 1. Fehlversuch → Phase "falsch" (nochmal versuchen, Tipp möglich)
 *  - 2. Fehlversuch → Phase "loesung" (Lösungsweg), Aufgabe kommt am Ende der Runde nochmal
 */

export const MAX_ATTEMPTS_PER_TASK = 2;

export type RoundPhase = "eingabe" | "falsch" | "richtig" | "loesung" | "fertig";

export interface RoundItem<T = unknown> {
  task: T;
  /** true, wenn die Aufgabe am Rundenende wiederholt wird. */
  repeat: boolean;
}

export interface TaskOutcome {
  /** Anzahl der Fehlversuche (0 = im ersten Versuch richtig). */
  wrongAttempts: number;
  solved: boolean;
  errorTags: string[];
}

export interface RoundState<T = unknown> {
  items: RoundItem<T>[];
  index: number;
  phase: RoundPhase;
  wrongAttempts: number;
  lastCheck: CheckResult | null;
  /** Ergebnisse der ursprünglichen (nicht wiederholten) Aufgaben, gleiche Reihenfolge. */
  outcomes: TaskOutcome[];
  /** Ob die aktuelle Aufgabe ans Ende angehängt wurde. */
  requeued: boolean;
}

export function startRound<T>(tasks: T[]): RoundState<T> {
  return {
    items: tasks.map((task) => ({ task, repeat: false })),
    index: 0,
    phase: tasks.length === 0 ? "fertig" : "eingabe",
    wrongAttempts: 0,
    lastCheck: null,
    outcomes: [],
    requeued: false,
  };
}

export function currentItem<T>(state: RoundState<T>): RoundItem<T> | undefined {
  return state.items[state.index];
}

/** Verarbeitet das Prüfergebnis einer abgegebenen Antwort. */
export function submitAnswer<T>(state: RoundState<T>, result: CheckResult): RoundState<T> {
  if (state.phase !== "eingabe" && state.phase !== "falsch") return state;
  const item = currentItem(state);
  if (!item) return state;

  if (result.status === "richtig") {
    return {
      ...state,
      phase: "richtig",
      lastCheck: result,
      outcomes: recordOutcome(state, item, true, undefined),
    };
  }

  const wrongAttempts = state.wrongAttempts + 1;
  if (wrongAttempts < MAX_ATTEMPTS_PER_TASK) {
    return {
      ...state,
      phase: "falsch",
      wrongAttempts,
      lastCheck: result,
      outcomes: recordOutcome(state, item, false, result.errorTag),
    };
  }

  // 2. Fehlversuch: Lösung zeigen, Aufgabe (einmal) am Ende wiederholen.
  const requeue = !item.repeat;
  return {
    ...state,
    phase: "loesung",
    wrongAttempts,
    lastCheck: result,
    requeued: requeue,
    items: requeue ? [...state.items, { task: item.task, repeat: true }] : state.items,
    outcomes: recordOutcome(state, item, false, result.errorTag),
  };
}

/** Zur nächsten Aufgabe (nach "richtig" oder "loesung"). */
export function nextTask<T>(state: RoundState<T>): RoundState<T> {
  if (state.phase !== "richtig" && state.phase !== "loesung") return state;
  const index = state.index + 1;
  return {
    ...state,
    index,
    phase: index >= state.items.length ? "fertig" : "eingabe",
    wrongAttempts: 0,
    lastCheck: null,
    requeued: false,
  };
}

/**
 * Trägt das Ergebnis für die aktuelle Aufgabe ein. Ursprüngliche Aufgaben stehen an den
 * Positionen 0..n-1, daher ist der Index zugleich die Position in `outcomes`.
 * Wiederholte Aufgaben ändern die Wertung nicht mehr – gezählt wird der erste Durchgang.
 */
function recordOutcome<T>(
  state: RoundState<T>,
  item: RoundItem<T>,
  solved: boolean,
  errorTag: string | undefined,
): TaskOutcome[] {
  if (item.repeat) return state.outcomes;
  const outcomes = [...state.outcomes];
  const prev = outcomes[state.index];
  outcomes[state.index] = {
    wrongAttempts: state.wrongAttempts + (solved ? 0 : 1),
    solved,
    errorTags: [...(prev?.errorTags ?? []), ...(!solved && errorTag ? [errorTag] : [])],
  };
  return outcomes;
}

/** Punkte: 1 für den ersten Versuch, ½ für den zweiten, 0 sonst. */
export function roundScore(outcomes: TaskOutcome[]): number {
  if (outcomes.length === 0) return 0;
  const points = outcomes.reduce(
    (sum, o) => sum + (o.solved ? (o.wrongAttempts === 0 ? 1 : 0.5) : 0),
    0,
  );
  return points / outcomes.length;
}

/** Sterne 1–3. Es gibt immer mindestens einen Stern. */
export function roundStars(outcomes: TaskOutcome[]): 1 | 2 | 3 {
  const score = roundScore(outcomes);
  if (score >= 0.9) return 3;
  if (score >= 0.6) return 2;
  return 1;
}
