import { createRng, type Rng } from "./rng";
import type { TaskConfig, TaskType, Answer } from "./types";

/** Höchstzahl an Versuchen, eine gültige (und neue) Aufgabe zu erzeugen. */
export const MAX_ATTEMPTS = 500;

export function taskKey(task: unknown): string {
  return JSON.stringify(task);
}

/**
 * Erzeugt eine gültige Aufgabe. Verworfene (null) und bereits vorhandene Aufgaben
 * werden neu erzeugt. Nach MAX_ATTEMPTS Versuchen: null.
 */
export function generateTask<C extends TaskConfig, T, A extends Answer>(
  type: TaskType<C, T, A>,
  config: C,
  rng: Rng,
  exclude: ReadonlySet<string> = new Set(),
): T | null {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const task = type.generate(config, rng);
    if (task !== null && !exclude.has(taskKey(task))) return task;
  }
  return null;
}

/**
 * Erzeugt eine Übungsrunde ohne identische Aufgaben. Ist der Aufgabenraum kleiner als
 * `count` (z. B. sehr enge Einstellungen), enthält die Runde entsprechend weniger Aufgaben.
 */
export function generateRound<C extends TaskConfig, T, A extends Answer>(
  type: TaskType<C, T, A>,
  config: C,
  seed: number,
  count: number,
): T[] {
  const rng = createRng(seed);
  const seen = new Set<string>();
  const tasks: T[] = [];
  while (tasks.length < count) {
    const task = generateTask(type, config, rng, seen);
    if (task === null) break;
    seen.add(taskKey(task));
    tasks.push(task);
  }
  return tasks;
}
