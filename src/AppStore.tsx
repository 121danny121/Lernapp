import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { AppData, Profile } from "./core/data";
import { loadData, saveData } from "./core/storage";

interface Store {
  data: AppData;
  /** Ändert die Daten und speichert sie sofort. */
  update: (change: (data: AppData) => AppData) => void;
  profile: Profile | null;
  updateProfile: (change: (profile: Profile) => Profile) => void;
}

const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore außerhalb von StoreProvider");
  return store;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData().then(setData, (e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const update = useCallback((change: (data: AppData) => AppData) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = change(prev);
      saveData(next).catch((e: unknown) => console.error("Speichern fehlgeschlagen", e));
      return next;
    });
  }, []);

  const updateProfile = useCallback(
    (change: (profile: Profile) => Profile) =>
      update((d) => ({
        ...d,
        profiles: d.profiles.map((p) => (p.id === d.activeProfileId ? change(p) : p)),
      })),
    [update],
  );

  if (error) {
    return (
      <div className="p-8 text-xl">
        <p className="font-semibold">Die gespeicherten Daten konnten nicht geladen werden.</p>
        <p className="mt-2 text-slate-600">{error}</p>
      </div>
    );
  }
  if (!data) return null;

  const profile = data.profiles.find((p) => p.id === data.activeProfileId) ?? null;
  return (
    <StoreContext.Provider value={{ data, update, profile, updateProfile }}>
      {children}
    </StoreContext.Provider>
  );
}
