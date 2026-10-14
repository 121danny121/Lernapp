import { defineTaskType } from "../../core/types";
import {
  check,
  correctAnswer,
  emptyAnswer,
  generate,
  hint,
  solution,
  type PyramideAnswer,
  type PyramideConfig,
  type PyramideTask,
} from "./generator";
import { PyramideView } from "./View";

export const rechenpyramide = defineTaskType<PyramideConfig, PyramideTask, PyramideAnswer>({
  id: "rechenpyramide",
  name: "Rechenpyramide",
  description:
    "Zwei Steine nebeneinander ergeben zusammen den Stein darüber. Auch rückwärts mit Minus.",
  category: "knobeln",
  grades: [1, 2, 3, 4],
  symbol: "△",

  settings: [
    {
      key: "stufen",
      label: "Stufen",
      type: "select",
      options: [
        { value: "3", label: "3 Stufen" },
        { value: "4", label: "4 Stufen" },
      ],
    },
    {
      key: "zahlenraum",
      label: "Zahlenraum",
      type: "select",
      options: [
        { value: "20", label: "bis 20" },
        { value: "100", label: "bis 100" },
        { value: "1000", label: "bis 1000" },
      ],
    },
    {
      key: "vorgabe",
      label: "Vorgegebene Steine",
      type: "select",
      options: [
        { value: "unten", label: "unterste Reihe" },
        { value: "gemischt", label: "verteilt (auch Minus)" },
      ],
    },
  ],

  defaults: {
    leicht: { stufen: "3", zahlenraum: "20", vorgabe: "unten" },
    mittel: { stufen: "3", zahlenraum: "100", vorgabe: "gemischt" },
    schwer: { stufen: "4", zahlenraum: "1000", vorgabe: "gemischt" },
  },

  generate,
  emptyAnswer,
  correctAnswer,
  check,
  solution,
  hint,
  Component: PyramideView,
});
