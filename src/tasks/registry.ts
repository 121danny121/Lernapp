import type { AnyTaskType } from "../core/types";
import { division } from "./division";
import { kopfrechnenPlusMinus } from "./kopfrechnen-plus-minus";

/**
 * Alle Aufgabentypen der App. Ein neuer Typ wird hier mit EINER Zeile registriert
 * (siehe docs/NEUER_AUFGABENTYP.md). Sonst muss kein Code angepasst werden.
 */
export const taskTypes: AnyTaskType[] = [
  kopfrechnenPlusMinus,
  division,
  // ← neue Aufgabentypen hier anhängen
];

export function findTaskType(id: string): AnyTaskType | undefined {
  return taskTypes.find((t) => t.id === id);
}
