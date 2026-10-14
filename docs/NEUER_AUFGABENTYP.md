# Neuen Aufgabentyp hinzufügen

Ein Aufgabentyp lebt komplett in **einem eigenen Ordner** unter `src/tasks/` und wird mit
**einer Zeile** in `src/tasks/registry.ts` registriert. Sonst muss kein Code angepasst werden:
Kachel, Einstellungs-Oberfläche, Rundenlogik, Statistik und Speicher funktionieren automatisch.

Vorlage zum Abschauen: `src/tasks/division/` (zwei Eingabefelder, Toggle, Multiselect, Range)
und `src/tasks/kopfrechnen-plus-minus/` (ein Feld, Selects).

## 1. Ordner anlegen

```
src/tasks/<id>/
  generator.ts        Typen + reine Logik: generate, check, solution, hint
  View.tsx            Darstellung + Eingabe
  index.ts            TaskType-Objekt (defineTaskType)
  generator.test.ts   1.000er-Test + Beispiele
```

`<id>` ist kebab-case und gleich dem Ordnernamen, z. B. `mal-zerlegen`.

## 2. generator.ts

```ts
export type MeinConfig = {           // nur number | string | boolean | string[]
  zahlenraum: "100" | "1000";
  mitRest: boolean;
};
export interface MeinTask { a: number; b: number; ergebnis: number }
export type MeinAnswer = { x: string };   // Feldname → eingegebene Ziffern

export function generate(config: MeinConfig, rng: Rng): MeinTask | null { … }
export function check(task: MeinTask, answer: MeinAnswer): CheckResult { … }
export function solution(task: MeinTask): SolutionStep[] { … }
export function hint(task: MeinTask): string { … }
```

Regeln:

- **Nur** `rng` für Zufall verwenden (nie `Math.random`) → reproduzierbar.
- Alle Zahlen in der Aufgabe sind **ganze Zahlen ≥ 0**.
- Bedingungen (Zahlenraum, Übertrag, ohne Rest …) **garantiert** einhalten. Passt ein
  Zufallsversuch nicht, `null` zurückgeben – der Kern versucht es erneut (Limit `MAX_ATTEMPTS`).
  Besser noch: Aufgaben „rückwärts“ konstruieren (z. B. Dividend = Quotient · Divisor).
- Die Aufgabe muss JSON-serialisierbar sein (Duplikaterkennung über `JSON.stringify`).
- `check` gibt `wrongFields` (zu markierende Felder) und optional einen `errorTag` zurück
  (kurz, kindunabhängig, für die Eltern-Statistik, z. B. „Übertrag vergessen“).
  `"teilweise"`, wenn einige Felder stimmen.
- `solution`: kurze Schritte in Kindersprache, Rechenzeichen aus `core/format.ts`
  (`MINUS` = „−“, `MAL` = „·“, `GETEILT` = „:“).

## 3. View.tsx

```tsx
export function MeinView(props: TaskViewProps<MeinTask, MeinAnswer>) {
  const { task, answer, locked, revealed, wrongFields, panel } = props;
  const input = useFieldInput<MeinAnswer>(["x"], props);
  return (
    <TaskLayout
      locked={locked}
      panel={panel}                              // immer durchreichen!
      question={<div className="zahl …">{task.a} + <AnswerBox … /></div>}
      input={<Numpad {...input.numpad} />}
    />
  );
}
```

- Immer `TaskLayout` verwenden (Hoch-/Querformat, Rückmeldung, Lösungsweg).
- Fertige Bausteine nutzen, wo es passt:
  - „a ○ b = c“ mit einer Lücke: `Component: lueckenGleichungView<MeinTask>(() => MAL)`
    (Task braucht `a`, `b`, `c`, `gap`, Antwort `{ x }`)
  - Schriftlich/untereinander: `Gitter` (Zeilen aus Zellen `{ text }` / `{ feld }` /
    `{ feld, klein: true }`) + `useCellInput(reihenfolge, optionaleFelder, props)` –
    Vorlage `schriftlich-add-sub` bzw. `division-schriftlich`
  - Auswahl-Tasten: `submit({ feld: wert })` setzt die Antwort und gibt sofort ab
    (Vorlage `vergleichen`)
- Keine `<input>`-Felder – Eingabe nur über `Numpad` (oder eigene große Tasten wie `< = >`).
- `AnswerBox` für Zahlenfelder; `useFieldInput` regelt Fokus, Ziffern, Löschen und OK.
- Bei `revealed` bekommt die View automatisch `correctAnswer(task)` als `answer`.

## 4. index.ts

```ts
export const meinTyp = defineTaskType<MeinConfig, MeinTask, MeinAnswer>({
  id: "mein-typ",
  name: "Name für Kinder",
  description: "Ein Satz für Eltern.",
  category: "addition",              // bestimmt die Themenwelt/Farbe in der Übersicht
  grades: [3, 4],
  symbol: "+",                       // ein Zeichen für die Kachel
  settings: [ /* SettingDef[] – daraus entsteht die Einstellungs-UI */ ],
  defaults: { leicht: {…}, mittel: {…}, schwer: {…} },
  generate,
  emptyAnswer: () => ({ x: "" }),
  correctAnswer: (task) => ({ x: String(task.ergebnis) }),
  check,
  solution,
  hint,
  Component: MeinView,
});
```

Jede Einstellung aus `settings` braucht einen Wert in allen drei `defaults`
(wird in `registry.test.ts` geprüft). Einstellungsarten: `range`, `select`, `toggle`, `multiselect`.

## 5. generator.test.ts

```ts
test("1.000er-Test", () => {
  runStandardChecks(meinTyp, (task, config) => {
    // typspezifische Bedingungen, z. B.:
    expect(task.ergebnis).toBeLessThanOrEqual(Number(config.zahlenraum));
  });
});
```

`runStandardChecks` (in `src/tasks/testing.ts`) erzeugt je 1.000 Aufgaben für leicht,
mittel, schwer und für zufällige individuelle Einstellungen und prüft: ganze Zahlen ≥ 0,
`check(task, correctAnswer) === "richtig"`, leere Antwort ist nicht richtig, Lösungsweg
vorhanden, Runde ohne Duplikate. Dazu 2–3 Beispiele aus echten Übungsblättern testen.

## 6. Registrieren

In `src/tasks/registry.ts` eine Zeile anhängen:

```ts
export const taskTypes: AnyTaskType[] = [
  kopfrechnenPlusMinus,
  division,
  meinTyp, // ← neu
];
```

## 7. Fertig, wenn …

- [ ] Generator, Prüfung, Lösungsweg, Ansicht, Einstellungen, drei Schwierigkeitsstufen
- [ ] 1.000er-Test grün
- [ ] `npm run test`, `npm run lint` und `npm run build` grün
- [ ] im Browser einmal durchgespielt (Hoch- und Querformat)
- [ ] `CLAUDE.md` (Liste der Aufgabentypen) aktualisiert
