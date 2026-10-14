import type { CSSProperties, ReactNode } from "react";

export type Stimmung = "normal" | "freut" | "denkt" | "jubelt";

/** Emil, die Eule – begleitet die Kinder und reagiert auf ihre Antworten. */
export function Eule({
  stimmung = "normal",
  className = "h-20 w-20",
}: {
  stimmung?: Stimmung;
  className?: string;
}) {
  const froh = stimmung === "freut" || stimmung === "jubelt";
  const blick = stimmung === "denkt" ? { x: 3, y: -4 } : { x: 0, y: 1 };
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} ${stimmung === "jubelt" ? "huepfen" : ""}`}
      aria-hidden
    >
      {/* Federohren */}
      <path d="M22 34 L26 10 L42 26 Z" fill="#9a6a3c" />
      <path d="M78 34 L74 10 L58 26 Z" fill="#9a6a3c" />
      {/* Flügel */}
      <g fill="#8a5a30">
        <ellipse
          cx="17"
          cy="62"
          rx="10"
          ry="20"
          transform={stimmung === "jubelt" ? "rotate(40 17 45)" : "rotate(12 17 62)"}
        />
        <ellipse
          cx="83"
          cy="62"
          rx="10"
          ry="20"
          transform={stimmung === "jubelt" ? "rotate(-40 83 45)" : "rotate(-12 83 62)"}
        />
      </g>
      {/* Körper und Bauch */}
      <ellipse cx="50" cy="58" rx="34" ry="36" fill="#b47a45" />
      <ellipse cx="50" cy="70" rx="21" ry="21" fill="#f5deb8" />
      <path
        d="M40 66 q5 4 10 0 q5 4 10 0 M42 74 q4 3 8 0 q4 3 8 0"
        stroke="#e2c193"
        strokeWidth="2"
        fill="none"
      />
      {/* Augen */}
      <circle cx="36" cy="44" r="13" fill="#fff" />
      <circle cx="64" cy="44" r="13" fill="#fff" />
      {froh ? (
        <g stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M28 46 Q36 37 44 46" />
          <path d="M56 46 Q64 37 72 46" />
        </g>
      ) : (
        <g fill="#1e293b">
          <circle cx={36 + blick.x} cy={44 + blick.y} r="6" />
          <circle cx={64 + blick.x} cy={44 + blick.y} r="6" />
          <circle cx={38 + blick.x} cy={42 + blick.y} r="2" fill="#fff" />
          <circle cx={66 + blick.x} cy={42 + blick.y} r="2" fill="#fff" />
        </g>
      )}
      {/* Wangen bei Freude */}
      {froh && (
        <g fill="#f9a8a8" opacity="0.7">
          <circle cx="26" cy="56" r="4" />
          <circle cx="74" cy="56" r="4" />
        </g>
      )}
      {/* Schnabel */}
      <path d="M45 53 L55 53 L50 61 Z" fill="#f59e0b" />
      {/* Füße */}
      <g fill="#f59e0b">
        <ellipse cx="40" cy="94" rx="6" ry="3" />
        <ellipse cx="60" cy="94" rx="6" ry="3" />
      </g>
    </svg>
  );
}

/** Eule mit Sprechblase. */
export function EuleSagt({
  stimmung,
  children,
  klein = false,
}: {
  stimmung: Stimmung;
  children: ReactNode;
  klein?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Eule stimmung={stimmung} className={klein ? "h-16 w-16 shrink-0" : "h-24 w-24 shrink-0"} />
      <div className="relative rounded-2xl bg-white px-4 py-3 text-xl font-semibold shadow-sm">
        <span className="absolute top-1/2 -left-2 h-4 w-4 -translate-y-1/2 rotate-45 bg-white" />
        <span className="relative">{children}</span>
      </div>
    </div>
  );
}

/** Kurzer Sternen-Funkenregen (nur Dekoration, entfällt bei „Bewegung reduzieren“). */
export function Funken() {
  return (
    <span className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <span
          key={i}
          className="funke absolute top-1/2 left-1/2 text-2xl text-stern"
          style={{ "--winkel": `${i * 45}deg` } as CSSProperties}
        >
          ★
        </span>
      ))}
    </span>
  );
}
