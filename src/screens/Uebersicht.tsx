import { useStore } from "../AppStore";
import { taskSetting } from "../core/data";
import { taskTypes } from "../tasks/registry";
import { Screen, Stars } from "../ui/Layout";

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

  return (
    <Screen className="gap-6">
      <header className="flex items-center justify-between gap-4">
        <button type="button" className="flex items-center gap-3" onClick={onProfil}>
          <span className="text-5xl">{profile.avatar}</span>
          <span className="text-3xl font-bold">Hallo {profile.name}!</span>
        </button>
        <button
          type="button"
          onClick={onEltern}
          className="min-h-[48px] rounded-xl px-4 text-lg text-slate-500"
          aria-label="Eltern-Bereich"
        >
          ⚙︎ Eltern
        </button>
      </header>

      <h2 className="text-2xl font-semibold text-slate-600">Was möchtest du üben?</h2>

      {enabled.length === 0 && (
        <p className="text-xl text-slate-600">
          Im Eltern-Bereich sind gerade keine Aufgaben eingeschaltet.
        </p>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-5">
        {enabled.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onStart(t.id)}
            className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 shadow-sm active:translate-y-[2px]"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-haupt-hell text-5xl font-bold text-haupt">
              {t.symbol}
            </span>
            <span className="text-2xl font-semibold">{t.name}</span>
            <Stars count={profile.progress[t.id]?.sterne ?? 0} />
          </button>
        ))}
      </div>
    </Screen>
  );
}
