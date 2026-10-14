import { GETEILT, MINUS } from "../../core/format";
import type { TaskViewProps } from "../../core/types";
import { Gitter, type GitterZeile, type Zelle } from "../../ui/Gitter";
import { Numpad } from "../../ui/Numpad";
import { TaskLayout } from "../../ui/TaskLayout";
import { useCellInput } from "../../ui/useCellInput";
import {
  kaestchen,
  restZeile,
  schritte,
  type DivSchriftlichAnswer,
  type DivSchriftlichTask,
} from "./generator";

export function DivSchriftlichView(props: TaskViewProps<DivSchriftlichTask, DivSchriftlichAnswer>) {
  const { task, answer, locked, revealed, wrongFields, panel } = props;
  const alle = kaestchen(task);
  const ziffer = Object.fromEntries(alle.map((k) => [k.name, k.ziffer]));
  const reihenfolge = alle.map((k) => k.name).filter((n) => !task.gegeben.includes(n));
  const input = useCellInput<DivSchriftlichAnswer>(reihenfolge, [], props);

  const s = schritte(task.dividend, task.divisor);
  const dz = String(task.dividend);
  // Spalte 0: Minuszeichen; Dividenden-Ziffer j steht in Spalte j + 1
  const cols = 1 + dz.length + 3 + s.length + (task.mitRest ? 2 : 0);
  const zelle = (name: string): Zelle =>
    task.gegeben.includes(name) ? { text: ziffer[name]!, vorgegeben: true } : { feld: name };
  const leer = (): Zelle[] => Array(cols).fill(null);

  const kopf = leer();
  dz.split("").forEach((d, j) => (kopf[j + 1] = { text: d }));
  let c = dz.length + 1;
  kopf[c++] = { text: GETEILT };
  kopf[c++] = { text: String(task.divisor) };
  kopf[c++] = { text: "=" };
  s.forEach((_, i) => (kopf[c++] = zelle(`q${i}`)));
  if (task.mitRest) {
    kopf[c++] = { text: "R", leise: true };
    kopf[c++] = zelle("R");
  }
  const zeilen: GitterZeile[] = [{ zellen: kopf }];

  s.forEach((x, i) => {
    const p = String(x.produkt);
    const produktZeile = leer();
    const start = x.ende + 1 - p.length + 1;
    produktZeile[start - 1] = { text: MINUS };
    p.split("").forEach((_, j) => (produktZeile[start + j] = zelle(`p${i}_${j}`)));
    zeilen.push({ zellen: produktZeile, strich: { von: start - 1, bis: x.ende + 1 } });

    const r = restZeile(task.dividend, s, i);
    const rEnde = i < s.length - 1 ? x.ende + 2 : x.ende + 1;
    const restZeileZellen = leer();
    r.split("").forEach(
      (_, j) => (restZeileZellen[rEnde - r.length + 1 + j] = zelle(`r${i}_${j}`)),
    );
    zeilen.push({ zellen: restZeileZellen });
  });

  return (
    <TaskLayout
      locked={locked}
      panel={panel}
      question={
        <div className="flex flex-col items-center gap-3">
          {task.gegeben.length > 0 && (
            <p className="rounded-full bg-sky-100 px-4 py-1 text-[0.45em] font-semibold text-sky-800">
              ✏️ Fülle die Lücken aus!
            </p>
          )}
          <Gitter
            zeilen={zeilen}
            answer={answer}
            focused={input.focused}
            onFocus={input.setFocused}
            wrongFields={wrongFields}
            locked={locked}
            revealed={revealed}
          />
        </div>
      }
      input={<Numpad {...input.numpad} />}
    />
  );
}
