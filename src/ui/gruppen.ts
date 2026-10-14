import type { AnyTaskType } from "../core/types";

/** Themenwelten für die Übersicht – jede mit eigener Farbe. Zuordnung über `category`. */
export interface Gruppe {
  titel: string;
  emoji: string;
  kategorien: string[];
  /** Tailwind-Klassen (müssen als vollständige Strings hier stehen) */
  kachel: string;
  symbol: string;
}

export const GRUPPEN: Gruppe[] = [
  {
    titel: "Plus & Minus",
    emoji: "🌱",
    kategorien: ["addition", "subtraktion"],
    kachel: "bg-emerald-50 border-emerald-200",
    symbol: "bg-emerald-500 text-white",
  },
  {
    titel: "Mal & Geteilt",
    emoji: "🚀",
    kategorien: ["multiplikation", "division"],
    kachel: "bg-sky-50 border-sky-200",
    symbol: "bg-sky-500 text-white",
  },
  {
    titel: "Schriftlich rechnen",
    emoji: "✏️",
    kategorien: ["schriftlich"],
    kachel: "bg-amber-50 border-amber-200",
    symbol: "bg-amber-500 text-white",
  },
  {
    titel: "Knobeln & Regeln",
    emoji: "🧩",
    kategorien: [], // alles Übrige
    kachel: "bg-violet-50 border-violet-200",
    symbol: "bg-violet-500 text-white",
  },
];

export function gruppeVon(type: AnyTaskType): Gruppe {
  return GRUPPEN.find((g) => g.kategorien.includes(type.category)) ?? GRUPPEN[GRUPPEN.length - 1]!;
}
