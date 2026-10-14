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
  name: "Teilen untereinander",
  description:
    "Teilen untereinander im Kästchen-Gitter – schriftlich oder durch Zerlegen (228 : 6 = 180 : 6 + 48 : 6), auch als Lückenaufgabe.",
  category: "schriftlich",
  grades: [4],
  symbol: "÷",

  settings: [
    {
      key: "methode",
      label: "Rechenweg",
      type: "select",
      options: [
        { value: "normal", label: "schriftlich (malnehmen, abziehen, herunterholen)" },
        { value: "zerlegen", label: "zerlegen (228 : 6 → 180 : 6 und 48 : 6)" },
        { value: "gemischt", label: "beides gemischt" },
      ],
    },
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
        { value: "keine", label: "möglichst wenig (alles selbst rechnen)" },
        { value: "viele", label: "viele Ziffern (nur wenige Lücken)" },
        { value: "einige", label: "einige Ziffern" },
        { value: "ergebnis", label: "das Ergebnis (Rechenweg ausfüllen)" },
        { value: "rechenweg", label: "der Rechenweg (Ergebnis finden)" },
      ],
    },
  ],

  defaults: {
    leicht: {
      methode: "zerlegen",
      stellen: 3,
      divisoren: ["2", "3", "4", "5"],
      mitRest: false,
      vorgabe: "viele",
    },
    mittel: {
      methode: "gemischt",
      stellen: 3,
      divisoren: ALLE_DIVISOREN,
      mitRest: false,
      vorgabe: "einige",
    },
    schwer: {
      methode: "normal",
      stellen: 4,
      divisoren: ALLE_DIVISOREN,
      mitRest: true,
      vorgabe: "keine",
    },
  },

  generate,
  emptyAnswer,
  correctAnswer,
  check,
  solution,
  hint,
  Component: DivSchriftlichView,
});
