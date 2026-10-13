import { useCallback, useState } from "react";
import { useStore } from "./AppStore";
import { addRoundToProgress } from "./core/data";
import { roundStars, type TaskOutcome } from "./core/session";
import { Einstellungen } from "./screens/Eltern/Einstellungen";
import { ProfilWahl } from "./screens/ProfilWahl";
import { RundenEnde } from "./screens/RundenEnde";
import { Uebersicht } from "./screens/Uebersicht";
import { Uebung } from "./screens/Uebung";

type Route =
  | { name: "profil" }
  | { name: "uebersicht" }
  | { name: "uebung"; typeId: string; run: number }
  | { name: "ende"; typeId: string; outcomes: TaskOutcome[]; stars: 1 | 2 | 3 }
  | { name: "eltern" };

export function App() {
  const { profile, updateProfile } = useStore();
  const [route, setRoute] = useState<Route>(profile ? { name: "uebersicht" } : { name: "profil" });

  const finishRound = useCallback(
    (typeId: string, outcomes: TaskOutcome[]) => {
      const stars = roundStars(outcomes);
      updateProfile((p) => ({
        ...p,
        progress: {
          ...p.progress,
          [typeId]: addRoundToProgress(p.progress[typeId], outcomes, stars),
        },
      }));
      setRoute({ name: "ende", typeId, outcomes, stars });
    },
    [updateProfile],
  );

  const home = () => setRoute({ name: "uebersicht" });
  const animationen = profile?.general.animationen ?? true;

  let screen;
  if (!profile || route.name === "profil") {
    screen = <ProfilWahl onDone={home} />;
  } else if (route.name === "uebung") {
    screen = (
      <Uebung
        key={route.run}
        typeId={route.typeId}
        onFinish={(outcomes) => finishRound(route.typeId, outcomes)}
        onCancel={home}
      />
    );
  } else if (route.name === "ende") {
    screen = (
      <RundenEnde
        stars={route.stars}
        outcomes={route.outcomes}
        onAgain={() => setRoute({ name: "uebung", typeId: route.typeId, run: Date.now() })}
        onHome={home}
      />
    );
  } else if (route.name === "eltern") {
    screen = <Einstellungen onBack={home} />;
  } else {
    screen = (
      <Uebersicht
        onStart={(typeId) => setRoute({ name: "uebung", typeId, run: Date.now() })}
        onEltern={() => setRoute({ name: "eltern" })}
        onProfil={() => setRoute({ name: "profil" })}
      />
    );
  }

  return (
    <div className={`h-full overflow-y-auto ${animationen ? "" : "ohne-animation"}`}>{screen}</div>
  );
}
