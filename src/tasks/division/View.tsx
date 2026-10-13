import { GETEILT } from "../../core/format";
import type { TaskViewProps } from "../../core/types";
import { AnswerBox } from "../../ui/AnswerBox";
import { Numpad } from "../../ui/Numpad";
import { TaskLayout } from "../../ui/TaskLayout";
import { useFieldInput } from "../../ui/useFieldInput";
import type { DivisionAnswer, DivisionTask } from "./generator";

export function DivisionView(props: TaskViewProps<DivisionTask, DivisionAnswer>) {
  const { task, answer, locked, revealed, wrongFields, panel } = props;
  const input = useFieldInput<DivisionAnswer>(task.mitRest ? ["q", "r"] : ["q"], props);

  const box = (field: "q" | "r", digits: number, label: string) => (
    <AnswerBox
      label={label}
      value={answer[field]}
      digits={digits}
      focused={input.focused === field}
      wrong={wrongFields.includes(field)}
      revealed={revealed}
      locked={locked}
      onFocus={() => input.setFocused(field)}
    />
  );

  return (
    <TaskLayout
      locked={locked}
      panel={panel}
      question={
        <div className="zahl flex flex-wrap items-center justify-center gap-x-4 gap-y-3 whitespace-nowrap">
          <span>{task.dividend}</span>
          <span>{GETEILT}</span>
          <span>{task.divisor}</span>
          <span>=</span>
          {box("q", String(task.dividend).length, "Ergebnis")}
          {task.mitRest && (
            <span className="flex items-center gap-3">
              <span className="text-[0.7em] text-slate-500">Rest</span>
              {box("r", 1, "Rest")}
            </span>
          )}
        </div>
      }
      input={<Numpad {...input.numpad} />}
    />
  );
}
