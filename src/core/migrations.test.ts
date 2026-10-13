import { SCHEMA_VERSION } from "./data";
import { FutureVersionError, runMigrations } from "./migrations";

describe("Migrationen", () => {
  test("keine Daten → leere Daten in aktueller Version", () => {
    expect(runMigrations(undefined)).toEqual({
      schemaVersion: SCHEMA_VERSION,
      profiles: [],
      activeProfileId: null,
    });
  });

  test("Migrationskette läuft der Reihe nach und behält Daten", () => {
    const data = runMigrations(
      { schemaVersion: 1, profiles: [{ name: "Mia" }] },
      {
        1: (d) => ({ ...d, a: 1 }),
        2: (d) => ({ ...d, b: (d.a as number) + 1 }),
      },
      3,
    ) as unknown as Record<string, unknown>;
    expect(data).toMatchObject({ schemaVersion: 3, a: 1, b: 2, profiles: [{ name: "Mia" }] });
  });

  test("fehlende Migration → Fehler statt Datenverlust", () => {
    expect(() => runMigrations({ schemaVersion: 1 }, {}, 2)).toThrow();
  });

  test("Daten aus einer neueren App-Version werden nicht überschrieben", () => {
    expect(() => runMigrations({ schemaVersion: 99 })).toThrow(FutureVersionError);
  });
});
