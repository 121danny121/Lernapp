import type { FC, ReactNode } from "react";
import type { Rng } from "./rng";

export type Difficulty = "leicht" | "mittel" | "schwer";
export const DIFFICULTIES: Difficulty[] = ["leicht", "mittel", "schwer"];

/** Werte, die eine Einstellung annehmen kann. */
export type SettingValue = number | string | boolean | string[];

/** Ein Konfigurationsobjekt besteht nur aus Einstellungswerten. */
export type TaskConfig = { [key: string]: SettingValue };

export type SettingOption = { value: string; label: string };

/** Deklarative Beschreibung einer Einstellung. Daraus wird die Einstellungs-UI automatisch gebaut. */
export type SettingDef =
  | { key: string; label: string; type: "range"; min: number; max: number; step?: number }
  | { key: string; label: string; type: "select"; options: SettingOption[] }
  | { key: string; label: string; type: "toggle" }
  | { key: string; label: string; type: "multiselect"; options: SettingOption[] };

export type CheckStatus = "richtig" | "falsch" | "teilweise";

export interface CheckResult {
  status: CheckStatus;
  /** Namen der Eingabefelder, die falsch sind (werden markiert). */
  wrongFields: string[];
  /** Kurze Fehlerkategorie für die Statistik, z. B. "Übertrag vergessen". */
  errorTag?: string;
}

export interface SolutionStep {
  text: string;
}

/**
 * Antworten sind immer eine Sammlung benannter Eingabefelder (Feldname → eingegebene Ziffern).
 * So können Ziffernfeld, Kästchen und Auswahl-Tasten einheitlich behandelt werden.
 */
export type Answer = Record<string, string>;

export interface TaskViewProps<Task, A extends Answer> {
  task: Task;
  answer: A;
  setAnswer: (answer: A) => void;
  /**
   * Antwort abgeben (prüfen lassen). Optional mit einer neuen Antwort, z. B. wenn ein Tipp
   * auf eine Auswahl-Taste (< = >) gleichzeitig antwortet und abgibt.
   */
  submit: (answer?: A) => void;
  /** Felder, die beim letzten Versuch falsch waren. */
  wrongFields: string[];
  /** true, wenn keine Eingabe möglich ist (Rückmeldung oder Lösung wird gezeigt). */
  locked: boolean;
  /** true, wenn die richtige Lösung angezeigt wird. */
  revealed: boolean;
  /**
   * Rückmeldung, Tipp und Lösungsweg vom Übungsbildschirm. Die Ansicht gibt ihn an
   * `TaskLayout` weiter, das ihn neben bzw. unter der Aufgabe anzeigt.
   */
  panel: ReactNode;
}

export interface TaskType<Config extends TaskConfig, Task, A extends Answer> {
  /** Eindeutige ID, gleich dem Ordnernamen, z. B. "division". */
  id: string;
  /** Anzeigename für Kinder, z. B. "Dividieren". */
  name: string;
  /** Kurztext für Eltern. */
  description: string;
  category:
    | "addition"
    | "subtraktion"
    | "multiplikation"
    | "division"
    | "gemischt"
    | "vergleichen"
    | "geometrie"
    | "sachaufgaben"
    | (string & {});
  /** Geeignete Klassenstufen. */
  grades: number[];
  /** Ein Zeichen für die Kachel, z. B. "÷". */
  symbol: string;

  settings: SettingDef[];
  defaults: Record<Difficulty, Config>;

  /**
   * Erzeugt EINE Aufgabe. Gibt `null` zurück, wenn der Zufallsversuch die Bedingungen
   * nicht erfüllt – der Kern verwirft ihn dann und versucht es erneut (mit Limit).
   */
  generate(config: Config, rng: Rng): Task | null;
  /** Leere Antwort (alle Felder ""). */
  emptyAnswer(task: Task): A;
  /** Die richtige Antwort (für Tests und zum Anzeigen der Lösung). */
  correctAnswer(task: Task): A;
  check(task: Task, answer: A): CheckResult;
  /** Lösungsweg in kindgerechten Schritten. */
  solution(task: Task): SolutionStep[];
  hint?(task: Task): string;

  Component: FC<TaskViewProps<Task, A>>;
}

/** Typ für die Registry, in der Aufgabentypen mit unterschiedlichen Typparametern liegen. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTaskType = TaskType<any, any, any>;

/** Hilfsfunktion, damit TypeScript die Typparameter eines Aufgabentyps ableitet. */
export function defineTaskType<Config extends TaskConfig, Task, A extends Answer>(
  t: TaskType<Config, Task, A>,
): TaskType<Config, Task, A> {
  return t;
}
