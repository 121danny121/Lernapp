import type { TaskViewProps } from "../../core/types";
import { AnswerBox } from "../../ui/AnswerBox";
import { Numpad } from "../../ui/Numpad";
import { TaskLayout } from "../../ui/TaskLayout";
import { useFieldInput } from "../../ui/useFieldInput";
import { tokens, zeichen } from "./ausdruck";
import type { RechenregelnAnswer, RechenregelnTask } from "./generator";

export function RechenregelnView(props: TaskViewProps<RechenregelnTask, RechenregelnAnswer>) {
  const { task, answer, locked, revealed, wrongFields, panel } = props;
  const input = useFieldInput<RechenregelnAnswer>(["x"], props);
  const box = (
    <AnswerBox
      label="Antwort"
      value={answer.x}
      digits={Math.max(3, String(task.ergebnis).length)}
      focused
      wrong={wrongFields.includes("x")}
      revealed={revealed}
      locked={locked}
      onFocus={() => input.setFocused("x")}
    />
  );

  return (
    <TaskLayout
      locked={locked}
      panel={panel}
      question={
        <div className="zahl flex flex-wrap items-center justify-center gap-x-3 gap-y-2 whitespace-nowrap">
          {tokens(task.baum).map((t, i) => {
            if (t.art === "zahl")
              return t.blatt === task.luecke ? (
                <span key={i}>{box}</span>
              ) : (
                <span key={i}>{t.n}</span>
              );
            if (t.art === "op") return <span key={i}>{zeichen[t.op]}</span>;
            return (
              <span key={i} className="-mx-2 text-sky-600">
                {t.zu ? ")" : "("}
              </span>
            );
          })}
          <span>=</span>
          {task.luecke === null ? box : <span>{task.ergebnis}</span>}
        </div>
      }
      input={<Numpad {...input.numpad} />}
    />
  );
}
