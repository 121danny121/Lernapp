import { defineTaskType } from "../../core/types";
import {
  check,
  generate,
  hint,
  richtigesZeichen,
  solution,
  type VergleichenAnswer,
  type VergleichenConfig,
  type VergleichenTask,
} from "./generator";
import { VergleichenView } from "./View";

export const vergleichen = defineTaskType<VergleichenConfig, VergleichenTask, VergleichenAnswer>({
  id: "vergleichen",
  name: "Größer, kleiner, gleich",
  description: "Zwei Rechnungen vergleichen: 6 · 80 ◯ 40 · 9 – Antwort mit <, = oder >.",
  category: "vergleichen",
  grades: [1, 2, 3, 4],
  symbol: "<>",

  settings: [
    {
      key: "rechenarten",
      label: "Rechenarten",
      type: "multiselect",
      options: [
        { value: "plus", label: "Plus" },
        { value: "minus", label: "Minus" },
        { value: "mal", label: "Mal" },
        { value: "geteilt", label: "Geteilt" },
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
      key: "anteilGleich",
      label: "Anteil „=“ (Prozent)",
      type: "range",
      min: 0,
      max: 50,
      step: 10,
    },
  ],

  defaults: {
    leicht: { rechenarten: ["plus", "minus"], zahlenraum: "100", anteilGleich: 20 },
    mittel: {
      rechenarten: ["plus", "minus", "mal", "geteilt"],
      zahlenraum: "100",
      anteilGleich: 30,
    },
    schwer: {
      rechenarten: ["plus", "minus", "mal", "geteilt"],
      zahlenraum: "1000",
      anteilGleich: 30,
    },
  },

  generate,
  emptyAnswer: () => ({ z: "" }),
  correctAnswer: (t) => ({ z: richtigesZeichen(t) }),
  check,
  solution,
  hint,
  Component: VergleichenView,
});
