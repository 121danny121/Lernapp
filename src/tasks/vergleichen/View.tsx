import type { TaskViewProps } from "../../core/types";
import { TaskLayout } from "../../ui/TaskLayout";
import { termText, type VergleichenAnswer, type VergleichenTask } from "./generator";

const ZEICHEN = ["<", "=", ">"] as const;

export function VergleichenView(props: TaskViewProps<VergleichenTask, VergleichenAnswer>) {
  const { task, answer, submit, locked, revealed, wrongFields, panel } = props;

  let kreis = "border-slate-300 bg-white text-slate-300";
  if (revealed) kreis = "border-gut bg-gut-hell text-gut";
  else if (wrongFields.includes("z")) kreis = "border-fast bg-fast-hell text-fast";
  else if (answer.z) kreis = "border-haupt bg-white text-tinte";

  return (
    <TaskLayout
      locked={locked}
      panel={panel}
      question={
        <div className="zahl flex flex-wrap items-center justify-center gap-x-5 gap-y-3 whitespace-nowrap">
          <span>{termText(task.links)}</span>
          <span
            className={`flex h-[1.6em] w-[1.6em] items-center justify-center rounded-full border-[3px] ${kreis}`}
            aria-label="Vergleichszeichen"
          >
            {answer.z || "?"}
          </span>
          <span>{termText(task.rechts)}</span>
        </div>
      }
      input={
        <div className="grid w-full max-w-[22rem] grid-cols-3 gap-3">
          {ZEICHEN.map((z) => (
            <button
              key={z}
              type="button"
              disabled={locked}
              onClick={() => submit({ z })}
              className="flex min-h-[96px] items-center justify-center rounded-2xl bg-white text-6xl font-bold text-haupt shadow-[0_3px_0_rgb(0_0_0/0.15)] active:translate-y-[2px] active:shadow-none"
            >
              {z}
            </button>
          ))}
        </div>
      }
    />
  );
}
