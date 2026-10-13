import type { SettingDef, SettingValue } from "../core/types";

export interface SettingsFormProps {
  settings: SettingDef[];
  values: Record<string, SettingValue>;
  onChange: (key: string, value: SettingValue) => void;
}

/** Baut die Einstellungs-Oberfläche automatisch aus den deklarativen SettingDefs. */
export function SettingsForm({ settings, values, onChange }: SettingsFormProps) {
  return (
    <div className="flex flex-col gap-5">
      {settings.map((s) => (
        <div key={s.key} className="flex flex-col gap-2">
          <span className="text-lg font-medium">{s.label}</span>
          <SettingControl def={s} value={values[s.key]} onChange={(v) => onChange(s.key, v)} />
        </div>
      ))}
    </div>
  );
}

const chip = (active: boolean) =>
  `min-h-[48px] rounded-xl border-2 px-4 text-lg ${
    active ? "border-haupt bg-haupt-hell font-semibold" : "border-slate-200 bg-white"
  }`;

function SettingControl({
  def,
  value,
  onChange,
}: {
  def: SettingDef;
  value: SettingValue | undefined;
  onChange: (v: SettingValue) => void;
}) {
  switch (def.type) {
    case "range": {
      const step = def.step ?? 1;
      const n = typeof value === "number" ? value : def.min;
      const set = (v: number) => onChange(Math.min(def.max, Math.max(def.min, v)));
      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={chip(false)}
            onClick={() => set(n - step)}
            aria-label="weniger"
          >
            −
          </button>
          <input
            type="range"
            min={def.min}
            max={def.max}
            step={step}
            value={n}
            onChange={(e) => set(Number(e.target.value))}
            className="min-w-0 flex-1 accent-haupt"
            aria-label={def.label}
          />
          <button
            type="button"
            className={chip(false)}
            onClick={() => set(n + step)}
            aria-label="mehr"
          >
            +
          </button>
          <span className="zahl w-16 text-right text-xl font-semibold">{n}</span>
        </div>
      );
    }
    case "select":
      return (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={def.label}>
          {def.options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={value === o.value}
              className={chip(value === o.value)}
              onClick={() => onChange(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      );
    case "toggle":
      return (
        <button
          type="button"
          role="switch"
          aria-checked={value === true}
          aria-label={def.label}
          onClick={() => onChange(value !== true)}
          className={`relative h-10 w-[4.5rem] rounded-full transition-colors ${
            value === true ? "bg-haupt" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow transition-[left] ${
              value === true ? "left-[2.25rem]" : "left-1"
            }`}
          />
        </button>
      );
    case "multiselect": {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="flex flex-wrap gap-2" aria-label={def.label}>
          {def.options.map((o) => {
            const active = selected.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={active}
                className={chip(active)}
                onClick={() => {
                  // Mindestens eine Option bleibt ausgewählt.
                  if (active && selected.length === 1) return;
                  onChange(
                    active
                      ? selected.filter((v) => v !== o.value)
                      : def.options
                          .map((x) => x.value)
                          .filter((v) => v === o.value || selected.includes(v)),
                  );
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      );
    }
  }
}
