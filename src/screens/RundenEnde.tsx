import type { TaskOutcome } from "../core/session";
import { Button, Screen, Stars } from "../ui/Layout";

const LOB = {
  3: "Super gemacht!",
  2: "Gut gemacht!",
  1: "Schön, dass du geübt hast!",
} as const;

export function RundenEnde({
  stars,
  outcomes,
  onAgain,
  onHome,
}: {
  stars: 1 | 2 | 3;
  outcomes: TaskOutcome[];
  onAgain: () => void;
  onHome: () => void;
}) {
  const gleichRichtig = outcomes.filter((o) => o.solved && o.wrongAttempts === 0).length;
  return (
    <Screen className="einblenden items-center justify-center gap-6 text-center">
      <Stars count={stars} size="text-8xl" />
      <h1 className="text-5xl font-bold">{LOB[stars]}</h1>
      <p className="text-2xl text-slate-600">
        {gleichRichtig} von {outcomes.length} Aufgaben gleich richtig.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <Button onClick={onAgain}>Nochmal üben</Button>
        <Button variant="leise" onClick={onHome}>
          Zur Übersicht
        </Button>
      </div>
    </Screen>
  );
}
