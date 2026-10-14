import { defineTaskType } from "../../core/types";
import {
  check,
  correctValue,
  generate,
  hint,
  solution,
  type RechenregelnAnswer,
  type RechenregelnConfig,
  type RechenregelnTask,
} from "./generator";
import { RechenregelnView } from "./View";

export const rechenregeln = defineTaskType<
  RechenregelnConfig,
  RechenregelnTask,
  RechenregelnAnswer
>({
  id: "rechenregeln",
  name: "Punkt vor Strich & Klammern",
  description:
    "Rechenregeln üben: 7 · 8 + 26, 240 : (11 − 5) und Platzhalter wie (__ + 20) · 3 = 150.",
  category: "gemischt",
  grades: [3, 4],
  symbol: "( )",

  settings: [
    {
      key: "regeln",
      label: "Regeln",
      type: "multiselect",
      options: [
        { value: "punkt", label: "Punkt vor Strich" },
        { value: "klammer", label: "Klammern" },
      ],
    },
    {
      key: "operationen",
      label: "Rechenzeichen pro Aufgabe",
      type: "select",
      options: [
        { value: "2", label: "2" },
        { value: "3", label: "3" },
      ],
    },
    {
      key: "zahlenraum",
      label: "Zahlenraum",
      type: "select",
      options: [
        { value: "100", label: "bis 100" },
        { value: "1000", label: "bis 1000" },
      ],
    },
    {
      key: "gesucht",
      label: "Gesucht ist",
      type: "select",
      options: [
        { value: "ergebnis", label: "das Ergebnis" },
        { value: "zahl", label: "eine Zahl (Platzhalter)" },
        { value: "gemischt", label: "gemischt" },
      ],
    },
  ],

  defaults: {
    leicht: { regeln: ["punkt"], operationen: "2", zahlenraum: "100", gesucht: "ergebnis" },
    mittel: {
      regeln: ["punkt", "klammer"],
      operationen: "2",
      zahlenraum: "100",
      gesucht: "gemischt",
    },
    schwer: {
      regeln: ["punkt", "klammer"],
      operationen: "3",
      zahlenraum: "1000",
      gesucht: "gemischt",
    },
  },

  generate,
  emptyAnswer: () => ({ x: "" }),
  correctAnswer: (t) => ({ x: String(correctValue(t)) }),
  check,
  solution,
  hint,
  Component: RechenregelnView,
});
