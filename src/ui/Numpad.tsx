import { useEffect } from "react";

export interface NumpadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onOk: () => void;
  disabled?: boolean;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const base =
  "zahl flex min-h-[72px] min-w-[72px] items-center justify-center rounded-2xl text-4xl font-semibold " +
  "shadow-[0_3px_0_rgb(0_0_0/0.15)] active:translate-y-[2px] active:shadow-none transition-transform " +
  "disabled:opacity-40 select-none";

/**
 * Eigenes Ziffernfeld. Es gibt keine Textfelder, daher erscheint die iOS-Tastatur nie.
 * Am Computer funktionieren zusätzlich die Zifferntasten, Rücktaste und Enter.
 */
export function Numpad({ onDigit, onDelete, onOk, disabled = false }: NumpadProps) {
  useEffect(() => {
    if (disabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) onDigit(e.key);
      else if (e.key === "Backspace") onDelete();
      else if (e.key === "Enter") onOk();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disabled, onDigit, onDelete, onOk]);

  return (
    <div className="grid w-full max-w-[22rem] grid-cols-3 gap-3" aria-label="Ziffernfeld">
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          className={`${base} bg-white text-tinte`}
          disabled={disabled}
          onClick={() => onDigit(k)}
        >
          {k}
        </button>
      ))}
      <button
        type="button"
        className={`${base} bg-slate-200 text-slate-700`}
        disabled={disabled}
        onClick={onDelete}
        aria-label="Löschen"
      >
        ⌫
      </button>
      <button
        type="button"
        className={`${base} bg-white text-tinte`}
        disabled={disabled}
        onClick={() => onDigit("0")}
      >
        0
      </button>
      <button
        type="button"
        className={`${base} bg-haupt text-white`}
        disabled={disabled}
        onClick={onOk}
      >
        OK
      </button>
    </div>
  );
}
