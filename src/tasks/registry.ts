import type { AnyTaskType } from "../core/types";
import { division } from "./division";
import { divisionSchriftlich } from "./division-schriftlich";
import { kopfrechnenPlusMinus } from "./kopfrechnen-plus-minus";
import { multiplikation } from "./multiplikation";
import { rechenpyramide } from "./rechenpyramide";
import { rechenregeln } from "./rechenregeln";
import { schriftlichAddSub } from "./schriftlich-add-sub";
import { vergleichen } from "./vergleichen";

/**
 * Alle Aufgabentypen der App. Ein neuer Typ wird hier mit EINER Zeile registriert
 * (siehe docs/NEUER_AUFGABENTYP.md). Sonst muss kein Code angepasst werden.
 */
export const taskTypes: AnyTaskType[] = [
  kopfrechnenPlusMinus,
  schriftlichAddSub,
  multiplikation,
  division,
  divisionSchriftlich,
  rechenpyramide,
  rechenregeln,
  vergleichen,
  // ← neue Aufgabentypen hier anhängen
];

export function findTaskType(id: string): AnyTaskType | undefined {
  return taskTypes.find((t) => t.id === id);
}
