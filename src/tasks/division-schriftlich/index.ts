import { defineTaskType } from "../../core/types";
import { ALLE_DIVISOREN } from "../division/generator";
import {
  check,
  correctAnswer,
  emptyAnswer,
  generate,
  hint,
  solution,
  type DivSchriftlichAnswer,
  type DivSchriftlichConfig,
  type DivSchriftlichTask,
} from "./generator";
import { DivSchriftlichView } from "./View";

export const divisionSchriftlich = defineTaskType<
  DivSchriftlichConfig,
  DivSchriftlichTask,
  DivSchriftlichAnswer
>({
  id: "division-schriftlich",
  name: "Schriftlich teilen",
  description:
    "Schriftliche Division untereinander im Kästchen-Gitter – auch als Lückenaufgabe, bei der schon Ziffern dastehen.",
  category: "schriftlich",
  grades: [4],
  symbol: "÷",

  settings: [
    { key: "stellen", label: "Stellen der ersten Zahl", type: "range", min: 2, max: 4 },
    {
      key: "divisoren",
      label: "Teilen durch",
      type: "multiselect",
      options: ALLE_DIVISOREN.map((d) => ({ value: d, label: d })),
    },
    { key: "mitRest", label: "Mit Rest", type: "toggle" },
    {
      key: "vorgabe",
      label: "Lücken ausfüllen – was steht schon da?",
      type: "select",
      options: [
        { value: "keine", label: "nichts (alles selbst rechnen)" },
        { value: "viele", label: "viele Ziffern (nur wenige Lücken)" },
        { value: "einige", label: "einige Ziffern" },
        { value: "ergebnis", label: "das Ergebnis (Rechenweg ausfüllen)" },
        { value: "rechenweg", label: "der Rechenweg (Ergebnis finden)" },
      ],
    },
  ],

  defaults: {
    leicht: { stellen: 3, divisoren: ["2", "3", "4", "5"], mitRest: false, vorgabe: "viele" },
    mittel: { stellen: 3, divisoren: ALLE_DIVISOREN, mitRest: false, vorgabe: "einige" },
    schwer: { stellen: 4, divisoren: ALLE_DIVISOREN, mitRest: true, vorgabe: "keine" },
  },

  generate,
  emptyAnswer,
  correctAnswer,
  check,
  solution,
  hint,
  Component: DivSchriftlichView,
});
