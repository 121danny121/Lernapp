import { useStore } from "../../AppStore";
import {
  AVATARE,
  GENERAL_SETTINGS,
  taskSetting,
  type GeneralSettings,
  type TaskMode,
  type TaskSetting,
} from "../../core/data";
import type { AnyTaskType } from "../../core/types";
import { taskTypes } from "../../tasks/registry";
import { Button, Screen } from "../../ui/Layout";
import { SettingsForm } from "../../ui/SettingsForm";

const MODES: { value: TaskMode; label: string }[] = [
  { value: "leicht", label: "leicht" },
  { value: "mittel", label: "mittel" },
  { value: "schwer", label: "schwer" },
  { value: "individuell", label: "Individuell" },
];

const card = "flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm";

export function Einstellungen({ onBack }: { onBack: () => void }) {
  const { profile, updateProfile } = useStore();
  if (!profile) return null;

  const setGeneral = (key: string, value: unknown) =>
    updateProfile((p) => ({ ...p, general: { ...p.general, [key]: value } as GeneralSettings }));

  return (
    <Screen className="gap-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Eltern-Bereich</h1>
        <Button onClick={onBack}>Fertig</Button>
      </header>

      <section className={card}>
        <h2 className="text-2xl font-semibold">Profil</h2>
        <input
          className="w-full max-w-sm rounded-2xl border-2 border-slate-300 px-4 py-3 text-2xl"
          value={profile.name}
          maxLength={20}
          aria-label="Name"
          onChange={(e) => updateProfile((p) => ({ ...p, name: e.target.value }))}
        />
        <div className="flex flex-wrap gap-2">
          {AVATARE.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={a === profile.avatar}
              className={`h-14 w-14 rounded-xl text-3xl ${a === profile.avatar ? "bg-haupt-hell ring-4 ring-haupt" : "bg-slate-50"}`}
              onClick={() => updateProfile((p) => ({ ...p, avatar: a }))}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className="text-2xl font-semibold">Allgemein</h2>
        <SettingsForm
          settings={GENERAL_SETTINGS}
          values={{ ...profile.general }}
          onChange={setGeneral}
        />
      </section>

      <h2 className="mt-2 text-2xl font-semibold">Aufgaben</h2>
      {taskTypes.map((type) => (
        <TaskTypeSettings
          key={type.id}
          type={type}
          setting={taskSetting(profile, type.id)}
          progress={profile.progress[type.id]}
          onChange={(s) => updateProfile((p) => ({ ...p, tasks: { ...p.tasks, [type.id]: s } }))}
        />
      ))}
    </Screen>
  );
}

function TaskTypeSettings({
  type,
  setting,
  progress,
  onChange,
}: {
  type: AnyTaskType;
  setting: TaskSetting;
  progress: { geuebt: number; richtig: number } | undefined;
  onChange: (s: TaskSetting) => void;
}) {
  const quote =
    progress && progress.geuebt > 0 ? Math.round((progress.richtig / progress.geuebt) * 100) : null;

  return (
    <section className={card}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold">
            {type.symbol} {type.name}
          </h3>
          <p className="text-lg text-slate-600">{type.description}</p>
          <p className="text-base text-slate-500">
            Klasse {type.grades.join(", ")}
            {quote !== null && ` · ${progress!.geuebt} Aufgaben geübt, ${quote} % gleich richtig`}
          </p>
        </div>
        <SettingsForm
          settings={[{ key: "enabled", label: "", type: "toggle" }]}
          values={{ enabled: setting.enabled }}
          onChange={(_, v) => onChange({ ...setting, enabled: v === true })}
        />
      </div>

      {setting.enabled && (
        <>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label={`Schwierigkeit ${type.name}`}
          >
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={setting.mode === m.value}
                className={`min-h-[48px] rounded-xl border-2 px-4 text-lg ${
                  setting.mode === m.value
                    ? "border-haupt bg-haupt-hell font-semibold"
                    : "border-slate-200"
                }`}
                onClick={() =>
                  onChange({
                    ...setting,
                    mode: m.value,
                    // Beim Wechsel zu „Individuell“ mit der bisherigen Stufe beginnen.
                    custom:
                      m.value === "individuell" && Object.keys(setting.custom).length === 0
                        ? {
                            ...type.defaults[
                              setting.mode === "individuell" ? "mittel" : setting.mode
                            ],
                          }
                        : setting.custom,
                  })
                }
              >
                {m.label}
              </button>
            ))}
          </div>
          {setting.mode === "individuell" && (
            <SettingsForm
              settings={type.settings}
              values={{ ...type.defaults.mittel, ...setting.custom }}
              onChange={(key, value) =>
                onChange({ ...setting, custom: { ...setting.custom, [key]: value } })
              }
            />
          )}
        </>
      )}
    </section>
  );
}
