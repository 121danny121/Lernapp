import { GETEILT, MINUS } from "../../core/format";
import type { TaskViewProps } from "../../core/types";
import { Gitter, setzeZahl, type GitterZeile, type Zelle } from "../../ui/Gitter";
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
import { zerlege } from "./zerlegen";

export function DivSchriftlichView(props: TaskViewProps<DivSchriftlichTask, DivSchriftlichAnswer>) {
  return props.task.methode === "zerlegen" ? (
    <ZerlegenView {...props} />
  ) : (
    <NormalView {...props} />
  );
}

/** Hinweis über dem Gitter, wenn schon Ziffern vorgegeben sind. */
function LueckenHinweis({ task }: { task: DivSchriftlichTask }) {
  if (task.gegeben.length === 0) return null;
  return (
    <p className="rounded-full bg-sky-100 px-4 py-1 text-[0.45em] font-semibold text-sky-800">
      ✏️ Fülle die Lücken aus!
    </p>
  );
}

/**
 * Zerlegen wie auf dem Übungsblatt:
 *   228 : 6 = 38
 *   180 : 6 = 30
 *    48 : 6 =  8
 */
function ZerlegenView(props: TaskViewProps<DivSchriftlichTask, DivSchriftlichAnswer>) {
  const { task, answer, locked, revealed, wrongFields, panel } = props;
  const alle = kaestchen(task);
  const ziffer = Object.fromEntries(alle.map((k) => [k.name, k.ziffer]));
  const reihenfolge = alle.map((k) => k.name).filter((n) => !task.gegeben.includes(n));
  const input = useCellInput<DivSchriftlichAnswer>(reihenfolge, [], props);

  const z = zerlege(task.dividend, task.divisor)!;
  const breiteZahl = String(task.dividend).length;
  const breiteErgebnis = String(z.q).length;
  // Spalten: Zahl | : | Teiler | = | Ergebnis | (R | Rest)
  const cols = breiteZahl + 3 + breiteErgebnis + (task.mitRest ? 2 : 0);
  const ergebnisEnde = breiteZahl + 2 + breiteErgebnis;
  const zelle = (name: string): Zelle =>
    task.gegeben.includes(name) ? { text: ziffer[name]!, vorgegeben: true } : { feld: name };

  const zeile = (
    zahl: { text: string } | { prefix: string; n: number },
    teiler: string,
    ergebnis: { prefix: string; n: number },
    rest: string | null,
  ): Zelle[] => {
    const zellen: Zelle[] = Array(cols).fill(null);
    if ("text" in zahl) setzeZahl(zellen, zahl.text, breiteZahl - 1, (_, d) => ({ text: d }));
    else setzeZahl(zellen, String(zahl.n), breiteZahl - 1, (j) => zelle(`${zahl.prefix}${j}`));
    zellen[breiteZahl] = { text: GETEILT };
    zellen[breiteZahl + 1] = zelle(teiler);
    zellen[breiteZahl + 2] = { text: "=" };
    setzeZahl(zellen, String(ergebnis.n), ergebnisEnde, (j) => zelle(`${ergebnis.prefix}${j}`));
    if (rest) {
      zellen[ergebnisEnde + 1] = { text: "R", leise: true };
      zellen[ergebnisEnde + 2] = zelle(rest);
    }
    return zellen;
  };

  const zeilen: GitterZeile[] = [
    {
      zellen: zeile(
        { text: String(task.dividend) },
        "t0",
        { prefix: "e", n: z.q },
        task.mitRest ? "R0" : null,
      ),
      strich: { von: 0, bis: cols - 1 },
    },
    { zellen: zeile({ prefix: "a", n: z.teil1 }, "t1", { prefix: "b", n: z.q1 }, null) },
    {
      zellen: zeile(
        { prefix: "c", n: z.teil2 },
        "t2",
        { prefix: "f", n: z.q2 },
        task.mitRest ? "R2" : null,
      ),
    },
  ];

  return (
    <TaskLayout
      locked={locked}
      panel={panel}
      question={
        <div className="flex flex-col items-center gap-3">
          <LueckenHinweis task={task} />
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

/** Schriftliches Normalverfahren: malnehmen, abziehen, nächste Ziffer herunterholen. */
function NormalView(props: TaskViewProps<DivSchriftlichTask, DivSchriftlichAnswer>) {
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
          <LueckenHinweis task={task} />
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
