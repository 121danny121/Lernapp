import type { AnyTaskType, Difficulty, SettingDef, SettingValue, TaskConfig } from "./types";
import type { TaskOutcome } from "./session";

/** Aktuelle Version des Speicherformats. Bei Änderungen erhöhen und Migration ergänzen. */
export const SCHEMA_VERSION = 1;

export type TaskMode = Difficulty | "individuell";

export interface TaskSetting {
  enabled: boolean;
  mode: TaskMode;
  /** Werte für "individuell" (fehlende Werte kommen aus den Voreinstellungen "mittel"). */
  custom: Record<string, SettingValue>;
}

export interface GeneralSettings {
  aufgabenProRunde: number;
  tipps: boolean;
  loesungsweg: boolean;
  toene: boolean;
  animationen: boolean;
}

export interface TaskProgress {
  /** Anzahl der bearbeiteten Aufgaben (ohne Wiederholungen). */
  geuebt: number;
  /** davon im ersten Versuch richtig */
  richtig: number;
  runden: number;
  /** beste erreichte Sternzahl (0 = noch nie geübt) */
  sterne: number;
  /** Häufigkeit der Fehlerkategorien */
  fehler: Record<string, number>;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  general: GeneralSettings;
  /** Pro Aufgabentyp (ID). Fehlende Einträge → Standard (an, "mittel"). */
  tasks: Record<string, TaskSetting>;
  progress: Record<string, TaskProgress>;
}

export interface AppData {
  schemaVersion: number;
  profiles: Profile[];
  activeProfileId: string | null;
}

export const GENERAL_SETTINGS: SettingDef[] = [
  { key: "aufgabenProRunde", label: "Aufgaben pro Runde", type: "range", min: 5, max: 30 },
  { key: "tipps", label: "Tipps anbieten", type: "toggle" },
  { key: "loesungsweg", label: "Lösungsweg zeigen", type: "toggle" },
  { key: "toene", label: "Töne", type: "toggle" },
  { key: "animationen", label: "Animationen", type: "toggle" },
];

export const DEFAULT_GENERAL: GeneralSettings = {
  aufgabenProRunde: 10,
  tipps: true,
  loesungsweg: true,
  toene: false,
  animationen: true,
};

export const AVATARE = ["🦊", "🐻", "🐼", "🐸", "🦁", "🐯", "🐨", "🐰", "🦄", "🐙", "🐢", "🦉"];

export function emptyData(): AppData {
  return { schemaVersion: SCHEMA_VERSION, profiles: [], activeProfileId: null };
}

export function newProfile(name: string, avatar: string): Profile {
  return {
    id: crypto.randomUUID(),
    name,
    avatar,
    general: { ...DEFAULT_GENERAL },
    tasks: {},
    progress: {},
  };
}

export function taskSetting(profile: Profile, typeId: string): TaskSetting {
  return profile.tasks[typeId] ?? { enabled: true, mode: "mittel", custom: {} };
}

/** Die Konfiguration, mit der für dieses Profil Aufgaben erzeugt werden. */
export function effectiveConfig(profile: Profile, type: AnyTaskType): TaskConfig {
  const s = taskSetting(profile, type.id);
  if (s.mode === "individuell") return { ...type.defaults.mittel, ...s.custom };
  return type.defaults[s.mode];
}

export function emptyProgress(): TaskProgress {
  return { geuebt: 0, richtig: 0, runden: 0, sterne: 0, fehler: {} };
}

/** Rechnet die Ergebnisse einer beendeten Runde in den Fortschritt ein. */
export function addRoundToProgress(
  progress: TaskProgress | undefined,
  outcomes: TaskOutcome[],
  stars: number,
): TaskProgress {
  const p = progress ?? emptyProgress();
  const fehler = { ...p.fehler };
  for (const o of outcomes) for (const tag of o.errorTags) fehler[tag] = (fehler[tag] ?? 0) + 1;
  return {
    geuebt: p.geuebt + outcomes.length,
    richtig: p.richtig + outcomes.filter((o) => o.solved && o.wrongAttempts === 0).length,
    runden: p.runden + 1,
    sterne: Math.max(p.sterne, stars),
    fehler,
  };
}
