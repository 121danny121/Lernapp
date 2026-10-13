import { defineTaskType } from "../../core/types";
import {
  check,
  correctValue,
  generate,
  hint,
  solution,
  type KopfrechnenAnswer,
  type KopfrechnenConfig,
  type KopfrechnenTask,
} from "./generator";
import { KopfrechnenView } from "./View";

export const kopfrechnenPlusMinus = defineTaskType<
  KopfrechnenConfig,
  KopfrechnenTask,
  KopfrechnenAnswer
>({
  id: "kopfrechnen-plus-minus",
  name: "Plus und Minus",
  description: "Kopfrechnen mit Plus und Minus, auch mit Lücke: 380 + __ = 650.",
  category: "gemischt",
  grades: [1, 2, 3, 4],
  symbol: "±",

  settings: [
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
      key: "rechenarten",
      label: "Rechenarten",
      type: "multiselect",
      options: [
        { value: "plus", label: "Plus" },
        { value: "minus", label: "Minus" },
      ],
    },
    {
      key: "luecke",
      label: "Lücke an Position",
      type: "select",
      options: [
        { value: "ergebnis", label: "Ergebnis" },
        { value: "erste", label: "1. Zahl" },
        { value: "zweite", label: "2. Zahl" },
        { value: "zufall", label: "zufällig" },
      ],
    },
    {
      key: "zahlen",
      label: "Zahlen",
      type: "select",
      options: [
        { value: "beliebig", label: "beliebig" },
        { value: "zehner", label: "nur Zehnerzahlen (z. B. 470)" },
        { value: "hunderter", label: "nur Hunderterzahlen (z. B. 400)" },
      ],
    },
  ],

  defaults: {
    leicht: {
      zahlenraum: "20",
      rechenarten: ["plus", "minus"],
      luecke: "ergebnis",
      zahlen: "beliebig",
    },
    mittel: {
      zahlenraum: "100",
      rechenarten: ["plus", "minus"],
      luecke: "zufall",
      zahlen: "beliebig",
    },
    schwer: {
      zahlenraum: "1000",
      rechenarten: ["plus", "minus"],
      luecke: "zufall",
      zahlen: "zehner",
    },
  },

  generate,
  emptyAnswer: () => ({ x: "" }),
  correctAnswer: (task) => ({ x: String(correctValue(task)) }),
  check,
  solution,
  hint,
  Component: KopfrechnenView,
});
