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
  description: "Schriftliche Division untereinander im Kästchen-Gitter – auch als Lückenaufgabe.",
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
      label: "Kästchen",
      type: "select",
      options: [
        { value: "alles", label: "alles selbst ausfüllen" },
        { value: "luecken", label: "Lücken füllen" },
      ],
    },
  ],

  defaults: {
    leicht: { stellen: 3, divisoren: ["2", "3", "4", "5"], mitRest: false, vorgabe: "luecken" },
    mittel: { stellen: 3, divisoren: ALLE_DIVISOREN, mitRest: false, vorgabe: "alles" },
    schwer: { stellen: 4, divisoren: ALLE_DIVISOREN, mitRest: true, vorgabe: "alles" },
  },

  generate,
  emptyAnswer,
  correctAnswer,
  check,
  solution,
  hint,
  Component: DivSchriftlichView,
});
