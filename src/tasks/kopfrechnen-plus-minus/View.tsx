import { MINUS, PLUS } from "../../core/format";
import type { TaskViewProps } from "../../core/types";
import { AnswerBox } from "../../ui/AnswerBox";
import { Numpad } from "../../ui/Numpad";
import { TaskLayout } from "../../ui/TaskLayout";
import { useFieldInput } from "../../ui/useFieldInput";
import type { KopfrechnenAnswer, KopfrechnenTask } from "./generator";

export function KopfrechnenView(props: TaskViewProps<KopfrechnenTask, KopfrechnenAnswer>) {
  const { task, answer, locked, revealed, wrongFields, panel } = props;
  const input = useFieldInput<KopfrechnenAnswer>(["x"], props);
  const digits = Math.max(String(task.a).length, String(task.c).length);

  const part = (key: "a" | "b" | "c") =>
    task.gap === key ? (
      <AnswerBox
        label="Antwort"
        value={answer.x}
        digits={digits}
        focused
        wrong={wrongFields.includes("x")}
        revealed={revealed}
        locked={locked}
        onFocus={() => input.setFocused("x")}
      />
    ) : (
      <span>{task[key]}</span>
    );

  return (
    <TaskLayout
      locked={locked}
      panel={panel}
      question={
        <div className="zahl flex flex-wrap items-center justify-center gap-x-4 gap-y-2 whitespace-nowrap">
          {part("a")}
          <span>{task.op === "+" ? PLUS : MINUS}</span>
          {part("b")}
          <span>=</span>
          {part("c")}
        </div>
      }
      input={<Numpad {...input.numpad} />}
    />
  );
}
