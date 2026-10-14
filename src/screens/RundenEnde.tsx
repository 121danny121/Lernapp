import { useStore } from "../AppStore";
import { sterneGesamt } from "../core/data";
import type { TaskOutcome } from "../core/session";
import { Button, Screen } from "../ui/Layout";
import { Eule } from "../ui/Maskottchen";

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
  const { profile } = useStore();
  const gleichRichtig = outcomes.filter((o) => o.solved && o.wrongAttempts === 0).length;
  return (
    <Screen className="einblenden items-center justify-center gap-5 text-center">
      <Eule stimmung="jubelt" className="h-36 w-36" />
      <div className="text-8xl" aria-label={`${stars} von 3 Sternen`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`stern-auf ${i < stars ? "text-stern" : "text-slate-300"}`}
            style={{ animationDelay: `${200 + i * 250}ms` }}
          >
            ★
          </span>
        ))}
      </div>
      <h1 className="text-5xl font-bold">{LOB[stars]}</h1>
      <p className="text-2xl text-slate-600">
        {gleichRichtig} von {outcomes.length} Aufgaben gleich richtig.
      </p>
      {profile && (
        <p className="zahl rounded-full bg-white px-5 py-2 text-xl font-semibold shadow-sm">
          <span className="text-stern">★</span> {sterneGesamt(profile)} Sterne gesammelt
        </p>
      )}
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        <Button onClick={onAgain}>Nochmal üben</Button>
        <Button variant="leise" onClick={onHome}>
          Zur Übersicht
        </Button>
      </div>
    </Screen>
  );
}
