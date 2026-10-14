import { useStore } from "../AppStore";
import { sterneGesamt, taskSetting } from "../core/data";
import { taskTypes } from "../tasks/registry";
import { GRUPPEN, gruppeVon } from "../ui/gruppen";
import { Screen, Stars } from "../ui/Layout";
import { EuleSagt } from "../ui/Maskottchen";

const BEGRUESSUNG = [
  "Was möchtest du heute üben?",
  "Schön, dass du da bist! Such dir etwas aus.",
  "Los geht's – welche Aufgabe nimmst du?",
];

export function Uebersicht({
  onStart,
  onEltern,
  onProfil,
}: {
  onStart: (typeId: string) => void;
  onEltern: () => void;
  onProfil: () => void;
}) {
  const { profile } = useStore();
  if (!profile) return null;
  const enabled = taskTypes.filter((t) => taskSetting(profile, t.id).enabled);
  const sterne = sterneGesamt(profile);
  const gruss = BEGRUESSUNG[sterne % BEGRUESSUNG.length]!;

  return (
    <Screen className="gap-6">
      <header className="flex items-center justify-between gap-3">
        <button type="button" className="flex min-w-0 items-center gap-3" onClick={onProfil}>
          <span className="text-5xl">{profile.avatar}</span>
          <span className="truncate text-3xl font-bold">{profile.name}</span>
        </button>
        <div className="flex items-center gap-2">
          <span
            className="zahl flex items-center gap-1 rounded-full bg-white px-4 py-2 text-2xl font-bold shadow-sm"
            aria-label={`${sterne} Sterne gesammelt`}
          >
            <span className="text-stern">★</span> {sterne}
          </span>
          <button
            type="button"
            onClick={onEltern}
            className="min-h-[48px] rounded-xl px-3 text-lg text-slate-500"
            aria-label="Eltern-Bereich"
          >
            ⚙︎
          </button>
        </div>
      </header>

      <EuleSagt stimmung="normal">{gruss}</EuleSagt>

      {enabled.length === 0 && (
        <p className="text-xl text-slate-600">
          Im Eltern-Bereich sind gerade keine Aufgaben eingeschaltet.
        </p>
      )}

      {GRUPPEN.map((g) => {
        const typen = enabled.filter((t) => gruppeVon(t) === g);
        if (typen.length === 0) return null;
        return (
          <section key={g.titel} className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold text-slate-700">
              {g.emoji} {g.titel}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] gap-4">
              {typen.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onStart(t.id)}
                  className={`flex flex-col items-center gap-2 rounded-3xl border-2 p-4 shadow-sm transition-transform active:scale-95 ${g.kachel}`}
                >
                  <span
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-bold shadow-sm ${g.symbol}`}
                  >
                    {t.symbol}
                  </span>
                  <span className="text-center text-xl leading-tight font-semibold">{t.name}</span>
                  <Stars count={profile.progress[t.id]?.sterne ?? 0} />
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </Screen>
  );
}
