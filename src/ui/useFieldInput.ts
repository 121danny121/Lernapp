import { useCallback, useState } from "react";
import type { Answer, TaskViewProps } from "../core/types";

/**
 * Verwaltet die Eingabe über das Ziffernfeld für mehrere Antwortfelder:
 * welches Feld aktiv ist, Ziffern anhängen/löschen, OK.
 * Bei OK springt der Fokus zum nächsten leeren Feld; sind alle gefüllt, wird abgegeben.
 * Tippt man in ein als falsch markiertes Feld, wird dessen Inhalt ersetzt.
 */
export function useFieldInput<A extends Answer>(
  fields: (keyof A & string)[],
  props: Pick<
    TaskViewProps<unknown, A>,
    "answer" | "setAnswer" | "submit" | "locked" | "wrongFields"
  >,
  maxDigits = 4,
) {
  const { answer, setAnswer, submit, locked, wrongFields } = props;
  const [focused, setFocused] = useState<keyof A & string>(fields[0]!);

  const onDigit = useCallback(
    (d: string) => {
      if (locked) return;
      const current = wrongFields.includes(focused) ? "" : (answer[focused] ?? "");
      if (current.length >= maxDigits) return;
      const value = current === "0" ? d : current + d;
      setAnswer({ ...answer, [focused]: value });
    },
    [answer, focused, locked, maxDigits, setAnswer, wrongFields],
  );

  const onDelete = useCallback(() => {
    if (locked) return;
    setAnswer({ ...answer, [focused]: (answer[focused] ?? "").slice(0, -1) });
  }, [answer, focused, locked, setAnswer]);

  const onOk = useCallback(() => {
    if (locked) return;
    const empty = fields.find((f) => !answer[f]);
    if (empty === undefined) submit();
    else setFocused(empty);
  }, [answer, fields, locked, submit]);

  return { focused, setFocused, numpad: { onDigit, onDelete, onOk, disabled: locked } };
}
