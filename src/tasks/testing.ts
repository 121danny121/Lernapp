import { expect } from "vitest";
import { generateRound, generateTask } from "../core/generate";
import { createRng, type Rng } from "../core/rng";
import {
  DIFFICULTIES,
  type Answer,
  type SettingDef,
  type TaskConfig,
  type TaskType,
} from "../core/types";

/** Erzeugt eine zufällige, aber gültige Konfiguration aus den Einstellungs-Definitionen. */
export function sampleConfig(settings: SettingDef[], base: TaskConfig, rng: Rng): TaskConfig {
  const config: TaskConfig = { ...base };
  for (const s of settings) {
    switch (s.type) {
      case "range": {
        const step = s.step ?? 1;
        config[s.key] = s.min + step * rng.int(0, Math.floor((s.max - s.min) / step));
        break;
      }
      case "select":
        config[s.key] = rng.pick(s.options).value;
        break;
      case "toggle":
        config[s.key] = rng.chance(0.5);
        break;
      case "multiselect": {
        const chosen = s.options.filter(() => rng.chance(0.5)).map((o) => o.value);
        config[s.key] = chosen.length > 0 ? chosen : [rng.pick(s.options).value];
        break;
      }
    }
  }
  return config;
}

/** Prüft rekursiv: alle Zahlen in der Aufgabe sind ganze Zahlen ≥ 0. */
export function expectNonNegativeIntegers(value: unknown, path = "task"): void {
  if (typeof value === "number") {
    expect(Number.isInteger(value), `${path} = ${value} ist nicht ganzzahlig`).toBe(true);
    expect(value, `${path} ist negativ`).toBeGreaterThanOrEqual(0);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => expectNonNegativeIntegers(v, `${path}[${i}]`));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) expectNonNegativeIntegers(v, `${path}.${k}`);
  }
}

/**
 * Standardtest für jeden Aufgabentyp: je 1.000 Aufgaben für leicht/mittel/schwer und
 * 1.000 Aufgaben mit zufälligen individuellen Einstellungen. Geprüft wird:
 *  - eine Aufgabe wird gefunden
 *  - alle Zahlen sind ganz und ≥ 0
 *  - check(task, correctAnswer) === "richtig", leere Antwort ist nicht richtig
 *  - Lösungsweg ist nicht leer
 *  - typspezifische Bedingungen (`invariant`)
 *  - eine Runde enthält keine identischen Aufgaben
 */
export function runStandardChecks<C extends TaskConfig, T, A extends Answer>(
  type: TaskType<C, T, A>,
  invariant: (task: T, config: C) => void,
  count = 1000,
): void {
  const configs: { name: string; config: () => C }[] = DIFFICULTIES.map((d) => ({
    name: d,
    config: () => type.defaults[d],
  }));
  const configRng = createRng(12345);
  configs.push({
    name: "individuell (zufällig)",
    config: () => sampleConfig(type.settings, type.defaults.mittel, configRng) as C,
  });

  for (const { name, config: makeConfig } of configs) {
    const rng = createRng(name.length * 1000 + 7);
    for (let i = 0; i < count; i++) {
      const config = makeConfig();
      const task = generateTask(type, config, rng);
      if (task === null) {
        // Bei zufälligen individuellen Einstellungen darf der Aufgabenraum leer sein.
        expect(name, `Keine Aufgabe für ${JSON.stringify(config)}`).toBe("individuell (zufällig)");
        continue;
      }
      expectNonNegativeIntegers(task);
      invariant(task, config);
      const correct = type.correctAnswer(task);
      expect(type.check(task, correct).status, JSON.stringify(task)).toBe("richtig");
      expect(type.check(task, type.emptyAnswer(task)).status).not.toBe("richtig");
      expect(type.solution(task).length).toBeGreaterThan(0);
    }
  }

  for (const d of DIFFICULTIES) {
    const round = generateRound(type, type.defaults[d], 99, 20);
    expect(round).toHaveLength(20);
    expect(new Set(round.map((t) => JSON.stringify(t))).size).toBe(20);
  }
}
