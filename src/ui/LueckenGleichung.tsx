import type { TaskViewProps } from "../core/types";
import { AnswerBox } from "./AnswerBox";
import { Numpad } from "./Numpad";
import { TaskLayout } from "./TaskLayout";
import { useFieldInput } from "./useFieldInput";

/** Gemeinsame Form für Aufgaben „a ○ b = c“, bei denen eine der drei Zahlen gesucht ist. */
export interface LueckenGleichungTask {
  a: number;
  b: number;
  c: number;
  gap: "a" | "b" | "c";
}

/** Ansicht „a ○ b = c“ mit einer Lücke; `zeichen` liefert das Rechenzeichen. */
export function lueckenGleichungView<T extends LueckenGleichungTask>(zeichen: (task: T) => string) {
  return function LueckenGleichungView(props: TaskViewProps<T, { x: string }>) {
    const { task, answer, locked, revealed, wrongFields, panel } = props;
    const input = useFieldInput<{ x: string }>(["x"], props);
    const digits = Math.max(String(task.a).length, String(task.b).length, String(task.c).length);

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
            <span>{zeichen(task)}</span>
            {part("b")}
            <span>=</span>
            {part("c")}
          </div>
        }
        input={<Numpad {...input.numpad} />}
      />
    );
  };
}
