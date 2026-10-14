import { defineTaskType } from "../../core/types";
import {
  check,
  correctAnswer,
  emptyAnswer,
  generate,
  hint,
  solution,
  type SchriftlichAnswer,
  type SchriftlichConfig,
  type SchriftlichTask,
} from "./generator";
import { SchriftlichView } from "./View";

export const schriftlichAddSub = defineTaskType<
  SchriftlichConfig,
  SchriftlichTask,
  SchriftlichAnswer
>({
  id: "schriftlich-add-sub",
  name: "Schriftlich Plus & Minus",
  description:
    "Stellengerecht untereinander rechnen, mit Kästchen wie im Heft und kleinen Übertrags-Kästchen.",
  category: "schriftlich",
  grades: [3, 4],
  symbol: "≡",

  settings: [
    {
      key: "rechenarten",
      label: "Rechenart",
      type: "multiselect",
      options: [
        { value: "plus", label: "Plus" },
        { value: "minus", label: "Minus" },
      ],
    },
    { key: "zahlen", label: "Zahlen untereinander", type: "range", min: 2, max: 3 },
    { key: "stellen", label: "Stellen", type: "range", min: 2, max: 5 },
    {
      key: "uebertrag",
      label: "Übertrag",
      type: "select",
      options: [
        { value: "ohne", label: "ohne" },
        { value: "mit", label: "mit" },
        { value: "egal", label: "gemischt" },
      ],
    },
  ],

  defaults: {
    leicht: { rechenarten: ["plus", "minus"], zahlen: 2, stellen: 3, uebertrag: "ohne" },
    mittel: { rechenarten: ["plus", "minus"], zahlen: 2, stellen: 3, uebertrag: "mit" },
    schwer: { rechenarten: ["plus", "minus"], zahlen: 3, stellen: 4, uebertrag: "mit" },
  },

  generate,
  emptyAnswer,
  correctAnswer,
  check,
  solution,
  hint,
  Component: SchriftlichView,
});
