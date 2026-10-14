import { useCallback, useState } from "react";
import type { Answer, TaskViewProps } from "../core/types";

/**
 * Eingabe für Kästchen mit je EINER Ziffer (schriftliches Rechnen).
 * Nach jeder Ziffer springt der Cursor zum nächsten Kästchen in `order`
 * (z. B. von rechts nach links wie beim schriftlichen Rechnen).
 * `optional` sind Kästchen, die nicht ausgefüllt sein müssen (Überträge).
 */
export function useCellInput<A extends Answer>(
  order: string[],
  optional: string[],
  props: Pick<TaskViewProps<unknown, A>, "answer" | "setAnswer" | "submit" | "locked">,
) {
  const { answer, setAnswer, submit, locked } = props;
  const [focused, setFocused] = useState<string>(order[0] ?? "");

  const firstEmpty = useCallback((a: Answer) => order.find((f) => !a[f]), [order]);

  const onDigit = useCallback(
    (d: string) => {
      if (locked || !focused) return;
      const next = { ...answer, [focused]: d } as A;
      setAnswer(next);
      const i = order.indexOf(focused);
      if (i === -1) setFocused(firstEmpty(next) ?? focused);
      else if (i < order.length - 1) setFocused(order[i + 1]!);
    },
    [answer, firstEmpty, focused, locked, order, setAnswer],
  );

  const onDelete = useCallback(() => {
    if (locked || !focused) return;
    if (answer[focused]) {
      setAnswer({ ...answer, [focused]: "" });
      return;
    }
    const i = order.indexOf(focused);
    if (i > 0) {
      const prev = order[i - 1]!;
      setFocused(prev);
      setAnswer({ ...answer, [prev]: "" });
    }
  }, [answer, focused, locked, order, setAnswer]);

  const onOk = useCallback(() => {
    if (locked) return;
    const empty = firstEmpty(answer);
    if (empty === undefined) submit();
    else setFocused(empty);
  }, [answer, firstEmpty, locked, submit]);

  return {
    focused,
    setFocused,
    isOptional: (f: string) => optional.includes(f),
    numpad: { onDigit, onDelete, onOk, disabled: locked },
  };
}
