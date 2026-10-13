import type { ReactNode } from "react";

export interface TaskLayoutProps {
  /** Die Aufgabe selbst (Rechnung mit Antwortfeldern) */
  question: ReactNode;
  /** Eingabe, z. B. das Ziffernfeld */
  input: ReactNode;
  /** Rückmeldung/Lösungsweg vom Übungsbildschirm (TaskViewProps.panel) */
  panel: ReactNode;
  /** Bei gesperrter Eingabe wird statt der Eingabe nur das Panel gezeigt. */
  locked: boolean;
}

/**
 * Einheitliches Layout für alle Aufgabentypen.
 * Querformat: Aufgabe links, Eingabe rechts. Hochformat: untereinander.
 */
export function TaskLayout({ question, input, panel, locked }: TaskLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 landscape:flex-row landscape:items-center">
      <div className="flex min-w-0 flex-1 items-center justify-center">
        <div className="max-w-full text-[clamp(2rem,6vw,3.5rem)] font-semibold">{question}</div>
      </div>
      <div className="flex flex-col items-center gap-4 landscape:w-[24rem] landscape:shrink-0">
        {panel}
        {!locked && input}
      </div>
    </div>
  );
}
