import { SCHEMA_VERSION, emptyData, type AppData } from "./data";

/**
 * Migrationen: MIGRATIONS[n] wandelt Daten von Version n in Version n+1 um.
 * Beim Ändern des Speicherformats:
 *  1. SCHEMA_VERSION in data.ts erhöhen
 *  2. hier eine Funktion für die alte Version ergänzen
 *  3. Test in migrations.test.ts ergänzen
 * Nie Daten wegwerfen – Fortschritte der Kinder sollen erhalten bleiben.
 */
export type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

export const MIGRATIONS: Record<number, Migration> = {
  // 1 → 2: Sternesammlung. Bisher war nur die beste Sternzahl gespeichert –
  // sie wird als Startwert übernommen, damit kein Kind bei null anfängt.
  1: (d) => ({
    ...d,
    profiles: ((d.profiles as Record<string, unknown>[] | undefined) ?? []).map((p) => ({
      ...p,
      progress: Object.fromEntries(
        Object.entries(
          (p.progress as Record<string, Record<string, unknown>> | undefined) ?? {},
        ).map(([id, prog]) => [id, { ...prog, sterneSumme: prog.sterne ?? 0 }]),
      ),
    })),
  }),
};

export class FutureVersionError extends Error {
  constructor(version: number) {
    super(
      `Die gespeicherten Daten haben Version ${version}, diese App kennt nur bis ${SCHEMA_VERSION}.`,
    );
  }
}

export function runMigrations(
  raw: unknown,
  migrations: Record<number, Migration> = MIGRATIONS,
  target: number = SCHEMA_VERSION,
): AppData {
  if (raw === null || typeof raw !== "object") return emptyData();
  let data = raw as Record<string, unknown>;
  let version = typeof data.schemaVersion === "number" ? data.schemaVersion : 1;
  if (version > target) throw new FutureVersionError(version);
  while (version < target) {
    const migrate = migrations[version];
    if (!migrate) throw new Error(`Keine Migration von Version ${version} vorhanden.`);
    data = migrate(data);
    version++;
    data.schemaVersion = version;
  }
  return data as unknown as AppData;
}
