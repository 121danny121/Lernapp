import { useState } from "react";
import { useStore } from "../AppStore";
import { AVATARE, newProfile } from "../core/data";
import { Button, Screen } from "../ui/Layout";

export function ProfilWahl({ onDone }: { onDone: () => void }) {
  const { data, update } = useStore();
  const [creating, setCreating] = useState(data.profiles.length === 0);

  if (creating) return <ProfilAnlegen onCreated={onDone} />;

  return (
    <Screen className="items-center justify-center gap-8">
      <h1 className="text-4xl font-bold">Wer übt heute?</h1>
      <div className="flex flex-wrap justify-center gap-6">
        {data.profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            className="flex w-40 flex-col items-center gap-2 rounded-3xl bg-white p-6 shadow-sm active:translate-y-[2px]"
            onClick={() => {
              update((d) => ({ ...d, activeProfileId: p.id }));
              onDone();
            }}
          >
            <span className="text-7xl">{p.avatar}</span>
            <span className="text-2xl font-semibold">{p.name}</span>
          </button>
        ))}
      </div>
      {/* Phase 1: ein Profil. Mehrere Profile folgen im Eltern-Bereich (Phase 2). */}
      {data.profiles.length === 0 && (
        <Button onClick={() => setCreating(true)}>Neues Profil</Button>
      )}
    </Screen>
  );
}

function ProfilAnlegen({ onCreated }: { onCreated: () => void }) {
  const { update } = useStore();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARE[0]!);

  const save = () => {
    const profile = newProfile(name.trim(), avatar);
    update((d) => ({ ...d, profiles: [...d.profiles, profile], activeProfileId: profile.id }));
    onCreated();
  };

  return (
    <Screen className="items-center justify-center gap-6">
      <h1 className="text-center text-4xl font-bold">Hallo! Wie heißt du?</h1>
      <p className="text-center text-lg text-slate-600">(Am besten tragen Eltern den Namen ein.)</p>
      <input
        className="w-full max-w-sm rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-center text-3xl"
        value={name}
        maxLength={20}
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
        aria-label="Name"
      />
      <div className="grid grid-cols-6 gap-3" role="radiogroup" aria-label="Bild auswählen">
        {AVATARE.map((a) => (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={a === avatar}
            className={`h-16 w-16 rounded-2xl text-4xl ${a === avatar ? "bg-haupt-hell ring-4 ring-haupt" : "bg-white"}`}
            onClick={() => setAvatar(a)}
          >
            {a}
          </button>
        ))}
      </div>
      <Button onClick={name.trim() ? save : undefined} className={name.trim() ? "" : "opacity-40"}>
        Los geht's!
      </Button>
    </Screen>
  );
}
