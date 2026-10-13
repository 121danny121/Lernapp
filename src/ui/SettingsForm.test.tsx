import { fireEvent, render, screen } from "@testing-library/react";
import type { SettingDef, SettingValue } from "../core/types";
import { SettingsForm } from "./SettingsForm";

const settings: SettingDef[] = [
  { key: "n", label: "Anzahl", type: "range", min: 1, max: 5 },
  {
    key: "art",
    label: "Art",
    type: "select",
    options: [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ],
  },
  { key: "rest", label: "Mit Rest", type: "toggle" },
  {
    key: "reihen",
    label: "Reihen",
    type: "multiselect",
    options: [
      { value: "2", label: "2" },
      { value: "3", label: "3" },
    ],
  },
];

test("erzeugt für jede Einstellungsart ein Bedienelement", () => {
  const changes: [string, SettingValue][] = [];
  render(
    <SettingsForm
      settings={settings}
      values={{ n: 5, art: "a", rest: false, reihen: ["2"] }}
      onChange={(k, v) => changes.push([k, v])}
    />,
  );
  fireEvent.click(screen.getByLabelText("mehr")); // max 5 bleibt 5
  fireEvent.click(screen.getByRole("radio", { name: "B" }));
  fireEvent.click(screen.getByRole("switch", { name: "Mit Rest" }));
  fireEvent.click(screen.getByRole("button", { name: "2" })); // letzte Option bleibt
  fireEvent.click(screen.getByRole("button", { name: "3" }));
  expect(changes).toEqual([
    ["n", 5],
    ["art", "b"],
    ["rest", true],
    ["reihen", ["2", "3"]],
  ]);
});
