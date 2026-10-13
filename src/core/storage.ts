import { get, set } from "idb-keyval";
import type { AppData } from "./data";
import { runMigrations } from "./migrations";

/** Alle Daten liegen lokal im IndexedDB des Geräts unter einem einzigen Schlüssel. */
const KEY = "mathe-lernapp:daten";

export async function loadData(): Promise<AppData> {
  const raw: unknown = await get(KEY);
  const data = runMigrations(raw);
  // Migrierte Daten sofort zurückschreiben.
  if (raw && (raw as { schemaVersion?: unknown }).schemaVersion !== data.schemaVersion) {
    await saveData(data);
  }
  return data;
}

export async function saveData(data: AppData): Promise<void> {
  await set(KEY, data);
}
