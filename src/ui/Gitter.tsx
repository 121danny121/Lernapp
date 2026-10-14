import type { Answer } from "../core/types";

/** Eine Zelle im karierten Gitter. */
export type Zelle =
  | null
  /** `leise`: Beschriftung (z. B. „R“); `vorgegeben`: schon eingetragene Ziffer bei Lückenaufgaben */
  | { text: string; leise?: boolean; vorgegeben?: boolean }
  | { feld: string; klein?: boolean };

export interface GitterZeile {
  zellen: Zelle[];
  /** Strich unter dieser Zeile von Spalte `von` bis `bis` (inklusive). */
  strich?: { von: number; bis: number };
}

export interface GitterProps {
  zeilen: GitterZeile[];
  answer: Answer;
  focused: string;
  onFocus: (feld: string) => void;
  wrongFields: string[];
  locked: boolean;
  revealed: boolean;
}

/**
 * Kariertes Heftpapier mit Kästchen: Zahlen stehen stellengerecht untereinander,
 * Eingabefelder nehmen je eine Ziffer auf. Überträge (`klein`) sind kleine Kästchen.
 */
export function Gitter({
  zeilen,
  answer,
  focused,
  onFocus,
  wrongFields,
  locked,
  revealed,
}: GitterProps) {
  const cols = Math.max(...zeilen.map((z) => z.zellen.length));
  return (
    <div
      className="kariert zahl inline-grid rounded-xl p-[0.25em] shadow-sm"
      style={{
        // nie breiter als der verfügbare Platz (Container-Breite / Anzahl Kästchen)
        fontSize: `min(1em, calc(100cqw / ${(cols * 1.35 + 0.6).toFixed(2)}))`,
        gridTemplateColumns: `repeat(${cols}, var(--zelle))`,
        gridAutoRows: "var(--zelle)",
        backgroundSize: "var(--zelle) var(--zelle)",
        backgroundPosition: "0.25em 0.25em",
      }}
    >
      {zeilen.flatMap((zeile, r) =>
        Array.from({ length: cols }, (_, c) => {
          const zelle = zeile.zellen[c] ?? null;
          const strich =
            zeile.strich && c >= zeile.strich.von && c <= zeile.strich.bis
              ? "border-b-[3px] border-tinte"
              : "";
          const key = `${r}-${c}`;
          if (zelle === null) return <div key={key} className={strich} />;
          if ("text" in zelle) {
            if (zelle.vorgegeben) {
              return (
                <div key={key} className={`flex items-center justify-center p-[0.06em] ${strich}`}>
                  <span className="flex h-full w-full items-center justify-center rounded-md bg-sky-100 text-sky-800">
                    {zelle.text}
                  </span>
                </div>
              );
            }
            return (
              <div
                key={key}
                className={`flex items-center justify-center ${strich} ${zelle.leise ? "text-slate-400" : ""}`}
              >
                {zelle.text}
              </div>
            );
          }
          const f = zelle.feld;
          const isFocused = focused === f && !locked;
          let style = zelle.klein
            ? "border-dashed border-slate-300 bg-white/60"
            : "border-slate-300 bg-white";
          if (revealed) style = "border-gut bg-gut-hell text-gut";
          else if (wrongFields.includes(f)) style = "border-fast bg-fast-hell";
          else if (isFocused) style = "border-haupt bg-white ring-4 ring-haupt-hell z-10";
          return (
            <div key={key} className={`flex items-center justify-center p-[0.06em] ${strich}`}>
              <button
                type="button"
                aria-label={zelle.klein ? "Übertrag" : "Ziffer"}
                disabled={locked}
                onClick={() => onFocus(f)}
                className={`flex h-full w-full items-center justify-center rounded-md border-2 leading-none ${style} ${
                  zelle.klein ? "text-[0.55em] text-slate-600" : ""
                }`}
              >
                {answer[f] ?? ""}
              </button>
            </div>
          );
        }),
      )}
    </div>
  );
}

/** Zahl rechtsbündig in ein Zeilen-Array schreiben, sodass die letzte Ziffer in Spalte `ende` steht. */
export function setzeZahl(
  zellen: Zelle[],
  zahl: string,
  ende: number,
  als: (i: number, ziffer: string) => Zelle,
) {
  const start = ende - zahl.length + 1;
  for (let i = 0; i < zahl.length; i++) zellen[start + i] = als(i, zahl[i]!);
}
