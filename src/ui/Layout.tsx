import type { ReactNode } from "react";

/** Bildschirm mit Safe-Area-Abständen. Inhalt scrollt höchstens senkrecht. */
export function Screen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`mx-auto flex min-h-full w-full max-w-5xl flex-col overflow-x-hidden px-[max(env(safe-area-inset-left),1rem)] pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)] pr-[max(env(safe-area-inset-right),1rem)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "haupt",
  className = "",
  ...rest
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "haupt" | "leise";
  className?: string;
  "aria-label"?: string;
}) {
  const styles =
    variant === "haupt"
      ? "bg-haupt text-white shadow-[0_3px_0_rgb(0_0_0/0.2)]"
      : "bg-white text-tinte border-2 border-slate-200";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[56px] rounded-2xl px-6 text-xl font-semibold active:translate-y-[2px] ${styles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Stars({
  count,
  max = 3,
  size = "text-2xl",
}: {
  count: number;
  max?: number;
  size?: string;
}) {
  return (
    <span className={`${size} tracking-wider`} aria-label={`${count} von ${max} Sternen`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? "text-stern" : "text-slate-300"}>
          ★
        </span>
      ))}
    </span>
  );
}
