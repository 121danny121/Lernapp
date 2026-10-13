export interface AnswerBoxProps {
  value: string;
  /** Platz für so viele Ziffern */
  digits: number;
  focused: boolean;
  wrong: boolean;
  revealed: boolean;
  locked: boolean;
  onFocus: () => void;
  label: string;
}

/** Ein antippbares Antwortfeld für eine Zahl. */
export function AnswerBox({
  value,
  digits,
  focused,
  wrong,
  revealed,
  locked,
  onFocus,
  label,
}: AnswerBoxProps) {
  let style = "border-slate-300 bg-white";
  if (revealed) style = "border-gut bg-gut-hell text-gut";
  else if (wrong) style = "border-fast bg-fast-hell";
  else if (focused && !locked) style = "border-haupt bg-white ring-4 ring-haupt-hell";

  return (
    <button
      type="button"
      aria-label={label}
      disabled={locked}
      onClick={onFocus}
      style={{ minWidth: `${digits * 0.75 + 1}em` }}
      className={`zahl inline-flex h-[1.6em] items-center justify-center rounded-xl border-[3px] px-2 align-middle ${style}`}
    >
      {value || (focused && !locked ? <span className="h-[1em] w-[3px] bg-haupt" /> : "")}
    </button>
  );
}
