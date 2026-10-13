# Anweisung für Claude Code: Mathe-Lernapp für Grundschulkinder (iPad)

> **So benutzt du diese Datei:** Lege sie in einen leeren Projektordner und starte Claude Code dort mit:
> „Lies `Lernapp_Anweisung_Claude_Code.md` vollständig und setze Phase 1 um. Stelle mir vorher deinen Plan vor.“

---

## 1. Ziel

Baue eine Mathe-Lernapp für Grundschulkinder (Klasse 1–4), die auf dem **iPad** läuft. Die App erzeugt Übungsaufgaben automatisch, prüft die Antworten und gibt kindgerechte Rückmeldung.

Das wichtigste Ziel ist die **Erweiterbarkeit**: Ich will nach und nach neue Aufgabentypen ergänzen. Ein neuer Aufgabentyp soll **in einem eigenen Ordner** entstehen und mit **einer Zeile** registriert werden. Dafür darf kein anderer Code angepasst werden müssen.

Die Eltern können einstellen, was geübt wird: Rechenarten, Zahlenraum, Schwierigkeit, Anzahl der Aufgaben und Hilfen.

Die gesamte Oberfläche ist auf **Deutsch**.

---

## 2. Technik (bitte so umsetzen)

| Bereich | Entscheidung | Begründung |
|---|---|---|
| Plattform | **Progressive Web App (PWA)** | Läuft auf dem iPad über Safari → „Zum Home-Bildschirm“. Kein Mac, kein Xcode und kein App Store nötig. Funktioniert offline. |
| Framework | React 18 + TypeScript (strict) + Vite | Typsicherheit hilft beim späteren Erweitern. |
| PWA | `vite-plugin-pwa` (Service Worker, Manifest, Icons) | Offline-Betrieb, Vollbild-Start |
| Styling | Tailwind CSS | Schnelle, einheitliche Gestaltung |
| Speicher | IndexedDB über `idb-keyval` oder `dexie` | Profile, Einstellungen und Fortschritt bleiben lokal auf dem Gerät. |
| Tests | Vitest (+ React Testing Library) | Die Aufgaben-Generatoren **müssen** getestet sein. |
| Backend | **keins** | Keine Konten, kein Tracking, keine Werbung, keine externen Anfragen (Kinder-Datenschutz/DSGVO) |

Verwende keine schweren UI-Bibliotheken. Für zusätzliche Abhängigkeiten gilt: nur wenn nötig und mit kurzer Begründung.

---

## 3. Architektur: Aufgabentypen als Plugins

Das ist der Kern der App. Jeder Aufgabentyp ist ein eigenständiges Modul und erfüllt dieses Interface (sinngemäß, Details darfst du verbessern):

```ts
// src/core/types.ts
export interface TaskType<Config, Task, Answer> {
  id: string;                      // z. B. "division-schriftlich"
  name: string;                    // "Dividieren"
  description: string;             // Kurztext für Eltern
  category: "addition" | "subtraktion" | "multiplikation" | "division"
          | "gemischt" | "vergleichen" | "geometrie" | "sachaufgaben" | string;
  grades: number[];                // geeignete Klassenstufen, z. B. [3, 4]

  settings: SettingDef[];          // DEKLARATIV → die Einstellungs-UI wird daraus automatisch gebaut
  defaults: Record<Difficulty, Config>;  // Voreinstellungen für leicht / mittel / schwer

  generate(config: Config, rng: Rng): Task;         // erzeugt EINE Aufgabe
  check(task: Task, answer: Answer): CheckResult;    // richtig / falsch / teilweise + welche Felder falsch
  solution(task: Task): SolutionStep[];             // Lösungsweg in kindgerechten Schritten
  hint?(task: Task): string;                        // optionaler Tipp

  Component: React.FC<TaskViewProps<Task, Answer>>; // Darstellung + Eingabe
}

export type Difficulty = "leicht" | "mittel" | "schwer";

export type SettingDef =
  | { key: string; label: string; type: "range";  min: number; max: number; step?: number }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[] }
  | { key: string; label: string; type: "toggle" }
  | { key: string; label: string; type: "multiselect"; options: { value: string; label: string }[] };
```

**Registrierung** (die einzige Stelle, die beim Hinzufügen geändert wird):

```ts
// src/tasks/registry.ts
export const taskTypes = [
  kopfrechnenPlusMinus,
  schriftlichAddSub,
  // ← neue Aufgabentypen hier anhängen
];
```

**Regeln für alle Generatoren:**
- Verwende einen **seeded Zufallsgenerator** (`Rng`), damit dieselbe Aufgabe reproduzierbar ist. Das hilft beim Testen und bei Arbeitsblättern.
- Ergebnisse sind immer **ganze Zahlen ≥ 0**, außer eine Einstellung erlaubt ausdrücklich etwas anderes.
- Division geht **ohne Rest** auf, außer die Einstellung „mit Rest“ ist aktiv.
- Zahlenraum, Übertrag ja/nein usw. werden **garantiert** eingehalten. Falsche Aufgaben werden verworfen und neu erzeugt, mit einem Limit für die Versuche.
- Innerhalb einer Übungsrunde gibt es keine identischen Aufgaben.
- Zu jedem Generator gehört ein **Test, der 1.000 Aufgaben erzeugt** und alle Bedingungen prüft (Wertebereich, ganzzahlig, `check(task, korrekteLösung) === richtig`).

---

## 4. Erste Aufgabentypen (aus echten Übungsblättern Klasse 4)

| # | ID | Beispiel | Einstellungen |
|---|---|---|---|
| 1 | `kopfrechnen-plus-minus` | 470 + 260 = __ · 380 + __ = 650 · __ − 480 = 70 | Zahlenraum (20/100/1000), Plus/Minus, Lücke an Position (Ergebnis/1. Zahl/2. Zahl/zufällig), Zehner/Hunderter-Zahlen |
| 2 | `schriftlich-add-sub` | 458 + 367 stellengerecht untereinander | Rechenart, Anzahl Summanden (2–3), Stellen, Übertrag ja/nein |
| 3 | `klecks-ziffern` | 3□8 + □76 = 644 (fehlende Ziffern) | Rechenart, Anzahl fehlender Ziffern (1–3) |
| 4 | `mal-zerlegen` | 7 · 58 = 7 · 50 + 7 · 8 | Faktorbereich, Zerlegungsschritte anzeigen ja/nein |
| 5 | `division` | 156 : 4 = 39 | Dividend-Bereich, Divisor (2–9), mit Rest ja/nein |
| 6 | `division-zerlegen` | 168 : 7 → 140 : 7 + 28 : 7 | Bereich, welche Teile vorgegeben sind |
| 7 | `vergleichen` | 6 · 80 ◯ 40 · 9 → >, <, = | Rechenarten auf beiden Seiten, Anteil „=“ |
| 8 | `rechenregeln` | 7 · 8 + 26, 240 : (11 − 5) | Punkt vor Strich, Klammern, Anzahl Operationen (2–3) |
| 9 | `platzhalter-klammer` | (__ + 20) · 3 = 150 | Position der Lücke, Rechenarten, Zahlenbereich |
| 10 | `einmaleins` | 7 · 8, 56 : 8 | Reihen auswählen (Multiselect), mal/geteilt/gemischt |

---

## 5. Eingabe und Darstellung auf dem iPad

- **Eigenes Ziffernfeld** (0–9, Löschen, OK) mit großen Tasten von mindestens 64 × 64 pt. Die iOS-Tastatur wird **nie** eingeblendet.
- **Kästchen-Ansicht** für schriftliches Rechnen (Typ 2, 3, 6): Die Kinder tippen auf ein Kästchen und geben eine Ziffer ein. Danach springt der Cursor **von rechts nach links**, wie beim schriftlichen Rechnen. Übertrags-Kästchen sind klein und optional. Das Aussehen orientiert sich an kariertem Heftpapier.
- **Vergleichen**: drei große Tasten `<` `=` `>`.
- Hoch- und Querformat werden unterstützt. Der Inhalt darf nie seitlich scrollen. Safe-Area beachten.
- Schrift: gut lesbar und kindgerecht, mindestens 28 pt für Aufgaben. Die Ziffern sind gleich breit (tabular).
- Ruhige Farben und nichts blinkt. Animationen sind kurz und können abgeschaltet werden („Bewegung reduzieren“ beachten).
- Töne sind optional und standardmäßig **aus**.

## 6. Ablauf einer Übungsrunde

1. Startseite: das Kind wählt sein Profil (Avatar und Name).
2. Übersicht mit Kacheln, eine pro freigeschaltetem Aufgabentyp, mit Fortschrittssternen.
3. Übungsrunde mit N Aufgaben (einstellbar, Standard 10). Oben sieht das Kind eine Fortschrittsleiste.
4. Rückmeldung pro Aufgabe:
   - Richtig: freundliche kurze Bestätigung, dann geht es weiter.
   - Falsch: „Fast! Versuch es nochmal.“ Die falschen Kästchen werden markiert. Auf Wunsch gibt es einen Tipp.
   - Nach dem 2. Fehlversuch wird der **Lösungsweg Schritt für Schritt** gezeigt. Die Aufgabe kommt am Ende der Runde noch einmal.
5. Rundenende: Sterne (1–3) und ein Lob. Es gibt **keine** Bestenlisten, keinen Zeitdruck und keine Strafen.

## 7. Eltern-Bereich

- Er ist geschützt, zum Beispiel durch eine 4-stellige PIN. Diese wird beim ersten Start festgelegt.
- Profile anlegen, bearbeiten und löschen (mehrere Kinder)
- **Pro Profil** für jeden Aufgabentyp: an/aus, Schwierigkeit (leicht/mittel/schwer) **oder** „Individuell“ mit allen Einstellungen. Die Einstellungs-Oberfläche wird **automatisch** aus `settings` erzeugt.
- Allgemein: Aufgaben pro Runde, Tipps an/aus, Töne an/aus, Lösungsweg zeigen an/aus
- Statistik pro Kind und Aufgabentyp: geübte Aufgaben, Richtig-Quote und häufige Fehler, zum Beispiel „Übertrag vergessen“.
- Datensicherung: Export und Import als JSON-Datei
- Alle gespeicherten Daten tragen eine **Versionsnummer**. Ändert sich das Format, sorgen Migrationen dafür, dass keine Fortschritte verloren gehen.

---

## 8. Projektstruktur (Vorschlag)

```
src/
  core/          types.ts, rng.ts, session.ts (Rundenlogik), storage.ts, migrations.ts
  ui/            Numpad, KaestchenGitter, Feedback, SettingsForm (auto aus SettingDef), Layout
  screens/       ProfilWahl, Uebersicht, Uebung, RundenEnde, Eltern/*
  tasks/
    registry.ts
    kopfrechnen-plus-minus/   index.ts, generator.ts, View.tsx, generator.test.ts
    schriftlich-add-sub/      …
docs/
  NEUER_AUFGABENTYP.md        Schritt-für-Schritt-Anleitung (pflegen!)
CLAUDE.md                     Projektregeln für zukünftige Sitzungen (pflegen!)
```

---

## 9. Umsetzung in Phasen

**Phase 1: Grundgerüst (MVP)**
- Projekt aufsetzen (Vite, TS strict, Tailwind, PWA, Vitest, ESLint/Prettier)
- Core: Interface, Rng, Registry, Rundenlogik, Speicher
- UI: Ziffernfeld, Übungsbildschirm, Rückmeldung, Rundenende
- Aufgabentypen **1 (Kopfrechnen)** und **5 (Division)**, inklusive Tests
- Ein Profil, einfache Einstellungsseite (automatisch aus `settings` erzeugt)
- `docs/NEUER_AUFGABENTYP.md` und `CLAUDE.md` anlegen
- Ergebnis: Die App lässt sich auf dem iPad als PWA installieren und funktioniert offline.

**Phase 2: Ausbau**
- Kästchen-Gitter und die Typen 2, 3, 6
- Typen 4, 7, 8, 9, 10
- Mehrere Profile, PIN-geschützter Eltern-Bereich, Statistik, Export und Import

**Phase 3: Extras**
- Adaptive Schwierigkeit (optional einschaltbar): Bei mehr als 90 % richtig in den letzten 20 Aufgaben wird es schwerer, bei weniger als 60 % leichter.
- **Arbeitsblatt drucken**: Mit denselben Generatoren wird ein A4-PDF mit Lösungsseite erzeugt (mit Seed, also reproduzierbar).
- Optional: Eingabe mit dem Apple Pencil (Handschrift) als Alternative zum Ziffernfeld

---

## 10. Arbeitsweise (für Claude Code)

- Stelle vor jeder Phase kurz deinen Plan vor und warte auf mein OK.
- Arbeite in kleinen Schritten. Nach jedem fertigen Schritt: `npm run test` und `npm run build` müssen grün sein. Danach folgt ein Git-Commit mit einer verständlichen Nachricht.
- Für jeden Aufgabentyp gilt als **fertig**: Generator, Prüfung, Lösungsweg, Ansicht, Einstellungen, drei Schwierigkeitsstufen und ein 1.000er-Test, der grün ist.
- Halte `CLAUDE.md` aktuell (Architektur, Befehle, Konventionen). Spätere Sitzungen sollen ohne diese Anweisung weiterarbeiten können.
- Erkläre mir am Ende jeder Phase, wie ich die App auf dem iPad teste:
  - lokal: `npm run dev -- --host` → iPad im selben WLAN öffnet `http://<PC-IP>:5173`
  - installierbar (braucht HTTPS): Deployment auf GitHub Pages oder Netlify → in Safari „Teilen → Zum Home-Bildschirm“
- Frage nach, wenn eine Anforderung unklar ist. Triff keine großen Annahmen still.

---

## 11. Später erweitern: Vorlage für neue Aufgabentypen

Mit dieser Vorlage kann ich Claude Code später neue Aufgaben in Auftrag geben:

> Füge einen neuen Aufgabentyp hinzu und folge dabei `docs/NEUER_AUFGABENTYP.md`.
> **Name:** …
> **Beispiele:** … (2–3 konkrete Aufgaben)
> **Klassenstufe:** …
> **Einstellungen:** … (z. B. Zahlenraum, mit/ohne Rest)
> **leicht / mittel / schwer:** …
> **Eingabe:** Ziffernfeld / Kästchen / Auswahl-Tasten

Ideen für später: Zahlenstrahl, Uhrzeit lesen, Geld rechnen, Längen umrechnen, Sachaufgaben mit Bildern, Geometrie (Formen, Symmetrie), Rechenmauern, Zahlenhäuser, Rechendreiecke.
