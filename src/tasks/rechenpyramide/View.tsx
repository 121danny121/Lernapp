import type { TaskViewProps } from "../../core/types";
import { Numpad } from "../../ui/Numpad";
import { TaskLayout } from "../../ui/TaskLayout";
import { useFieldInput } from "../../ui/useFieldInput";
import { feldName, felder, type PyramideAnswer, type PyramideTask } from "./generator";

export function PyramideView(props: TaskViewProps<PyramideTask, PyramideAnswer>) {
  const { task, answer, locked, revealed, wrongFields, panel } = props;
  const input = useFieldInput<PyramideAnswer>(felder(task), props);
  const reihen = task.steine.map((reihe, r) => ({ reihe, r })).reverse();

  return (
    <TaskLayout
      locked={locked}
      panel={panel}
      question={
        <div className="zahl flex flex-col items-center gap-[0.15em] text-[0.8em]">
          {reihen.map(({ reihe, r }) => (
            <div key={r} className="flex gap-[0.15em]">
              {reihe.map((v, i) => {
                const f = feldName(r, i);
                const base =
                  "flex h-[1.7em] w-[2.6em] items-center justify-center rounded-lg border-[3px]";
                if (task.gegeben[r]![i]) {
                  return (
                    <div key={i} className={`${base} border-orange-300 bg-orange-100`}>
                      {v}
                    </div>
                  );
                }
                let style = "border-orange-200 bg-white";
                if (revealed) style = "border-gut bg-gut-hell text-gut";
                else if (wrongFields.includes(f)) style = "border-fast bg-fast-hell";
                else if (input.focused === f && !locked)
                  style = "border-haupt bg-white ring-4 ring-haupt-hell";
                return (
                  <button
                    key={i}
                    type="button"
                    aria-label="Stein"
                    disabled={locked}
                    onClick={() => input.setFocused(f)}
                    className={`${base} ${style}`}
                  >
                    {answer[f]}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      }
      input={<Numpad {...input.numpad} />}
    />
  );
}
