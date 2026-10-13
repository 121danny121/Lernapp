import { defineTaskType } from "../../core/types";
import {
  ALLE_DIVISOREN,
  check,
  generate,
  hint,
  solution,
  type DivisionAnswer,
  type DivisionConfig,
  type DivisionTask,
} from "./generator";
import { DivisionView } from "./View";

export const division = defineTaskType<DivisionConfig, DivisionTask, DivisionAnswer>({
  id: "division",
  name: "Dividieren",
  description: "Geteilt-Aufgaben wie 156 : 4, wahlweise mit Rest.",
  category: "division",
  grades: [2, 3, 4],
  symbol: ":",

  settings: [
    { key: "dividendVon", label: "Erste Zahl von", type: "range", min: 10, max: 990, step: 10 },
    { key: "dividendBis", label: "Erste Zahl bis", type: "range", min: 20, max: 1000, step: 10 },
    {
      key: "divisoren",
      label: "Teilen durch",
      type: "multiselect",
      options: ALLE_DIVISOREN.map((d) => ({ value: d, label: d })),
    },
    { key: "mitRest", label: "Mit Rest", type: "toggle" },
  ],

  defaults: {
    leicht: { dividendVon: 10, dividendBis: 50, divisoren: ["2", "3", "4", "5"], mitRest: false },
    mittel: { dividendVon: 20, dividendBis: 200, divisoren: ALLE_DIVISOREN, mitRest: false },
    schwer: { dividendVon: 100, dividendBis: 1000, divisoren: ALLE_DIVISOREN, mitRest: true },
  },

  generate,
  emptyAnswer: () => ({ q: "", r: "" }),
  correctAnswer: (task) => ({ q: String(task.quotient), r: task.mitRest ? String(task.rest) : "" }),
  check,
  solution,
  hint,
  Component: DivisionView,
});
