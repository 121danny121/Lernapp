import { defineTaskType } from "../../core/types";
import { MAL } from "../../core/format";
import { lueckenGleichungView } from "../../ui/LueckenGleichung";
import {
  ALLE_REIHEN,
  check,
  correctValue,
  generate,
  hint,
  solution,
  type MultiplikationAnswer,
  type MultiplikationConfig,
  type MultiplikationTask,
} from "./generator";

export const multiplikation = defineTaskType<
  MultiplikationConfig,
  MultiplikationTask,
  MultiplikationAnswer
>({
  id: "multiplikation",
  name: "Mal-Aufgaben",
  description: "Einmaleins, Zehnerzahlen (6 · 80) und Zerlegen (7 · 58), auch mit Lücke.",
  category: "multiplikation",
  grades: [2, 3, 4],
  symbol: "·",

  settings: [
    {
      key: "arten",
      label: "Aufgabenarten",
      type: "multiselect",
      options: [
        { value: "einmaleins", label: "Einmaleins (7 · 8)" },
        { value: "zehner", label: "mit Zehnerzahl (6 · 80)" },
        { value: "zweistellig", label: "zweistellig (7 · 58)" },
        { value: "dreistellig", label: "dreistellig (4 · 123)" },
      ],
    },
    {
      key: "reihen",
      label: "Einmaleins-Reihen",
      type: "multiselect",
      options: ALLE_REIHEN.map((r) => ({ value: r, label: r })),
    },
    {
      key: "luecke",
      label: "Gesucht ist",
      type: "select",
      options: [
        { value: "ergebnis", label: "das Ergebnis" },
        { value: "faktor", label: "ein Faktor (__ · 7 = 56)" },
        { value: "zufall", label: "gemischt" },
      ],
    },
  ],

  defaults: {
    leicht: { arten: ["einmaleins"], reihen: ["2", "5", "10"], luecke: "ergebnis" },
    mittel: { arten: ["einmaleins"], reihen: ALLE_REIHEN, luecke: "zufall" },
    schwer: {
      arten: ["zehner", "zweistellig"],
      reihen: ["2", "3", "4", "5", "6", "7", "8", "9"],
      luecke: "ergebnis",
    },
  },

  generate,
  emptyAnswer: () => ({ x: "" }),
  correctAnswer: (t) => ({ x: String(correctValue(t)) }),
  check,
  solution,
  hint,
  Component: lueckenGleichungView<MultiplikationTask>(() => MAL),
});
