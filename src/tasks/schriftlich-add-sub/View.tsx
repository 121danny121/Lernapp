import type { TaskViewProps } from "../../core/types";
import { Gitter, setzeZahl, type GitterZeile, type Zelle } from "../../ui/Gitter";
import { Numpad } from "../../ui/Numpad";
import { TaskLayout } from "../../ui/TaskLayout";
import { useCellInput } from "../../ui/useCellInput";
import { MINUS, PLUS } from "../../core/format";
import {
  ergebnisFeld,
  stellenVon,
  uebertragFeld,
  type SchriftlichAnswer,
  type SchriftlichTask,
} from "./generator";

export function SchriftlichView(props: TaskViewProps<SchriftlichTask, SchriftlichAnswer>) {
  const { task, answer, locked, revealed, wrongFields, panel } = props;
  const n = stellenVon(task.ergebnis);
  const breite = Math.max(n, ...task.zahlen.map(stellenVon));
  const cols = breite + 1; // Spalte 0 für das Rechenzeichen
  const ende = cols - 1;

  const reihenfolge = Array.from({ length: n }, (_, k) => ergebnisFeld(k)); // von rechts nach links
  const optional = Array.from({ length: n - 1 }, (_, i) => uebertragFeld(i + 1));
  const input = useCellInput<SchriftlichAnswer>(reihenfolge, optional, props);

  const zeilen: GitterZeile[] = task.zahlen.map((z, i) => {
    const zellen: Zelle[] = Array(cols).fill(null);
    if (i > 0) zellen[0] = { text: task.op === "+" ? PLUS : MINUS };
    setzeZahl(zellen, String(z), ende, (_, d) => ({ text: d }));
    return { zellen };
  });
  const uebertragZeile: Zelle[] = Array(cols).fill(null);
  for (const f of optional) uebertragZeile[ende - Number(f.slice(1))] = { feld: f, klein: true };
  zeilen.push({ zellen: uebertragZeile, strich: { von: 0, bis: ende } });
  const ergebnisZeile: Zelle[] = Array(cols).fill(null);
  for (let k = 0; k < n; k++) ergebnisZeile[ende - k] = { feld: ergebnisFeld(k) };
  zeilen.push({ zellen: ergebnisZeile });

  return (
    <TaskLayout
      locked={locked}
      panel={panel}
      question={
        <Gitter
          zeilen={zeilen}
          answer={answer}
          focused={input.focused}
          onFocus={input.setFocused}
          wrongFields={wrongFields}
          locked={locked}
          revealed={revealed}
        />
      }
      input={<Numpad {...input.numpad} />}
    />
  );
}
