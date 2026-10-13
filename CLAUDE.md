# Mathe-Lernapp – Projektregeln

Mathe-Lernapp für Grundschulkinder (Klasse 1–4) als **PWA für das iPad**. Oberfläche komplett
auf **Deutsch**. Vollständige Anforderungen: `docs/ANFORDERUNGEN.md`.

## Befehle

```bash
npm run dev            # Entwicklungsserver (iPad im WLAN: npm run dev -- --host)
npm run test           # Vitest (muss grün sein)
npm run build          # tsc + Vite-Build inkl. Service Worker (muss grün sein)
npm run lint           # ESLint
npm run format         # Prettier
```

Nach jedem fertigen Schritt: `npm run test` und `npm run build` grün → Git-Commit mit
verständlicher deutscher Nachricht.

## Technik

React 18 + TypeScript strict (`noUncheckedIndexedAccess`) + Vite, Tailwind CSS v4
(Design-Tokens in `src/index.css` unter `@theme`), `vite-plugin-pwa` (generateSW, alles
vorab gecacht → offline), `idb-keyval` (IndexedDB), Vitest + Testing Library.
**Kein Backend, keine externen Anfragen** (auch keine Web-Fonts/CDNs), kein Tracking.
Neue Abhängigkeiten nur, wenn nötig, mit kurzer Begründung.

## Architektur

```
src/
  core/         reine Logik, ohne React (außer Typen)
    types.ts      TaskType-Interface (Plugin-Vertrag), SettingDef, CheckResult …
    rng.ts        seeded Zufall (Mulberry32) – nie Math.random in Generatoren
    generate.ts   verwerfen & neu erzeugen (MAX_ATTEMPTS), Runde ohne Duplikate
    session.ts    Rundenlogik (Reducer-Funktionen): 2 Versuche, dann Lösungsweg + Wiederholung am Ende, Sterne
    data.ts       Datenmodell (AppData, Profile, Einstellungen, Fortschritt), SCHEMA_VERSION
    migrations.ts Migrationen zwischen Schema-Versionen
    storage.ts    Laden/Speichern (IndexedDB, ein Schlüssel)
    format.ts     Rechenzeichen (− · :), Stellenwerte, parseAnswer
  ui/           wiederverwendbare Bausteine: Numpad, AnswerBox, useFieldInput, TaskLayout,
                SettingsForm (automatisch aus SettingDef), Layout (Screen, Button, Stars), sound
  screens/      ProfilWahl, Uebersicht, Uebung, RundenEnde, Eltern/Einstellungen
  tasks/
    registry.ts   EINZIGE Stelle zum Registrieren neuer Aufgabentypen
    testing.ts    runStandardChecks (1.000er-Test) für alle Typen
    <id>/         index.ts, generator.ts, View.tsx, generator.test.ts
  AppStore.tsx  React-Context: Daten laden/speichern, aktives Profil
  App.tsx       Navigation (einfacher Zustandsautomat, kein Router)
```

### Aufgabentypen (Plugins)

Anleitung: **`docs/NEUER_AUFGABENTYP.md`** (bei Änderungen pflegen!).

| ID                       | Name           | Eingabe                                     |
| ------------------------ | -------------- | ------------------------------------------- |
| `kopfrechnen-plus-minus` | Plus und Minus | Ziffernfeld, 1 Feld (Lücke an a/b/Ergebnis) |
| `division`               | Dividieren     | Ziffernfeld, Ergebnis (+ Rest)              |

Wichtige Entscheidungen:

- `generate()` gibt `Task | null` zurück; `null` = verwerfen, der Kern versucht es neu.
- Antworten sind immer `Record<Feldname, string>` → einheitliche Eingabe/Markierung.
- `correctAnswer(task)` wird für Tests und für die Lösungsanzeige genutzt.
- Rückmeldung/Lösungsweg kommen vom Übungsbildschirm als `panel` in die View und werden
  über `TaskLayout` angezeigt.
- Einstellungen pro Profil und Typ: `leicht | mittel | schwer | individuell`;
  „individuell“ = `{...defaults.mittel, ...custom}`. Fehlt ein Eintrag (neuer Typ), gilt: an, mittel.
- Ist der Aufgabenraum kleiner als die Rundenlänge, wird die Runde kürzer (keine Duplikate).

### Daten & Migrationen

Alle Daten in einem Objekt `AppData` mit `schemaVersion`. Bei Formatänderungen:
`SCHEMA_VERSION` erhöhen, Migration in `migrations.ts` ergänzen, Test schreiben.
Nie Daten verwerfen. Daten aus einer neueren Version werden nicht überschrieben.

## Konventionen

- Code-Bezeichner für Fachbegriffe auf Deutsch (z. B. `Uebung`, `zahlenraum`), technische
  Begriffe englisch. Kommentare auf Deutsch.
- UI: Tasten ≥ 64 × 64 pt (Numpad 72 px), Aufgaben ≥ 28 pt, Ziffern `.zahl` (tabular-nums),
  keine `<input>`-Felder für Kinder-Antworten (iOS-Tastatur!), nichts blinkt,
  Animationen kurz (`.einblenden`), abschaltbar (`ohne-animation`, `prefers-reduced-motion`).
  Töne standardmäßig aus. Keine Bestenlisten, kein Zeitdruck.
- Hoch- und Querformat (`landscape:`-Varianten), Safe-Area über `Screen`, nie seitlich scrollen.

## Deployment

`.github/workflows/deploy.yml`: bei Push auf `main` → lint, test, build mit
`BASE_PATH=/<repo>/` → GitHub Pages. In den Repo-Einstellungen muss unter
_Settings → Pages → Source_ „GitHub Actions“ gewählt sein.

## Stand / nächste Schritte

- [x] Phase 1: Grundgerüst, Typen 1 (Kopfrechnen) und 5 (Division), ein Profil, Einstellungen
- [ ] Phase 2: Kästchen-Gitter + Typen 2, 3, 6; Typen 4, 7, 8, 9, 10; mehrere Profile,
      PIN-Eltern-Bereich, Statistik (Fehlerkategorien werden schon gesammelt), Export/Import
- [ ] Phase 3: adaptive Schwierigkeit, Arbeitsblatt-PDF (Seed!), Apple Pencil
