import { GETEILT, MAL, MINUS, PLUS } from "../../core/format";

/** Rechenausdruck als Baum. Blätter sind Zahlen. */
export type Op = "+" | "-" | "*" | ":";
export type Knoten = { n: number } | { op: Op; l: Knoten; r: Knoten };

export const istBlatt = (k: Knoten): k is { n: number } => "n" in k;
export const istPunkt = (op: Op) => op === "*" || op === ":";
const rang = (op: Op) => (istPunkt(op) ? 2 : 1);
export const zeichen: Record<Op, string> = { "+": PLUS, "-": MINUS, "*": MAL, ":": GETEILT };

export function rechne(op: Op, a: number, b: number): number | null {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b >= 0 ? a - b : null;
    case "*":
      return a * b;
    case ":":
      return b !== 0 && a % b === 0 ? a / b : null;
  }
}

/** Wert des Ausdrucks; null bei ungültigen Zwischenschritten (negativ, Division mit Rest). */
export function wert(k: Knoten, ersatz?: { blatt: number; wert: number }): number | null {
  let index = 0;
  const rek = (k: Knoten): number | null => {
    if (istBlatt(k)) {
      const i = index++;
      return ersatz && ersatz.blatt === i ? ersatz.wert : k.n;
    }
    const l = rek(k.l);
    const r = rek(k.r);
    return l === null || r === null ? null : rechne(k.op, l, r);
  };
  return rek(k);
}

/** Braucht das Kind `kind` unter `op` (auf Seite `seite`) eine Klammer? */
export function brauchtKlammer(op: Op, kind: Knoten, seite: "l" | "r"): boolean {
  if (istBlatt(kind)) return false;
  if (rang(kind.op) < rang(op)) return true;
  return seite === "r" && rang(kind.op) === rang(op);
}

export type Token =
  | { art: "zahl"; n: number; blatt: number }
  | { art: "op"; op: Op }
  | { art: "klammer"; zu: boolean };

/** Ausdruck in Zeichen zerlegen – mit genau den nötigen Klammern. */
export function tokens(k: Knoten): Token[] {
  const out: Token[] = [];
  let blatt = 0;
  const rek = (k: Knoten, klammer: boolean) => {
    if (klammer) out.push({ art: "klammer", zu: false });
    if (istBlatt(k)) out.push({ art: "zahl", n: k.n, blatt: blatt++ });
    else {
      rek(k.l, brauchtKlammer(k.op, k.l, "l"));
      out.push({ art: "op", op: k.op });
      rek(k.r, brauchtKlammer(k.op, k.r, "r"));
    }
    if (klammer) out.push({ art: "klammer", zu: true });
  };
  rek(k, false);
  return out;
}

export function text(k: Knoten, luecke: number | null = null): string {
  return tokens(k)
    .map((t) =>
      t.art === "zahl"
        ? t.blatt === luecke
          ? "□"
          : String(t.n)
        : t.art === "op"
          ? ` ${zeichen[t.op]} `
          : t.zu
            ? ")"
            : "(",
    )
    .join("");
}

export function anzahlBlaetter(k: Knoten): number {
  return istBlatt(k) ? 1 : anzahlBlaetter(k.l) + anzahlBlaetter(k.r);
}

/** Welche Regeln braucht man für diesen Ausdruck? */
export function regeln(k: Knoten): { punkt: boolean; klammer: boolean } {
  let punkt = false;
  let klammer = false;
  const rek = (k: Knoten) => {
    if (istBlatt(k)) return;
    for (const [kind, seite] of [
      [k.l, "l"],
      [k.r, "r"],
    ] as const) {
      if (brauchtKlammer(k.op, kind, seite)) klammer = true;
      else if (!istBlatt(kind) && !istPunkt(k.op) && istPunkt(kind.op)) punkt = true;
      rek(kind);
    }
  };
  rek(k);
  return { punkt, klammer };
}

/**
 * Würde jemand stur von links nach rechts rechnen (ohne Punkt vor Strich und Klammern),
 * käme dieser Wert heraus. Für die Fehlerkategorie.
 */
export function linksNachRechts(k: Knoten): number | null {
  const t = tokens(k).filter((x) => x.art !== "klammer");
  let acc = (t[0] as { n: number }).n;
  for (let i = 1; i < t.length; i += 2) {
    const op = (t[i] as { op: Op }).op;
    const v = rechne(op, acc, (t[i + 1] as { n: number }).n);
    if (v === null) return null;
    acc = v;
  }
  return acc;
}

/** Ausdruck Schritt für Schritt ausrechnen, wie in der Schule. */
export function rechenweg(baum: Knoten): string[] {
  const schritte: string[] = [];
  let k = baum;
  while (!istBlatt(k)) {
    // Kandidaten: Rechnungen, deren beide Seiten schon Zahlen sind
    type Kand = {
      pfad: ("l" | "r")[];
      inKlammer: boolean;
      punkt: boolean;
      strichDarueber: boolean;
    };
    const kand: Kand[] = [];
    const rek = (x: Knoten, pfad: ("l" | "r")[], inKlammer: boolean, elternOp: Op | null) => {
      if (istBlatt(x)) return;
      if (istBlatt(x.l) && istBlatt(x.r)) {
        kand.push({
          pfad,
          inKlammer,
          punkt: istPunkt(x.op),
          strichDarueber: elternOp !== null && !istPunkt(elternOp),
        });
      }
      rek(x.l, [...pfad, "l"], inKlammer || brauchtKlammer(x.op, x.l, "l"), x.op);
      rek(x.r, [...pfad, "r"], inKlammer || brauchtKlammer(x.op, x.r, "r"), x.op);
    };
    rek(k, [], false, null);
    const wahl =
      kand.find((c) => c.inKlammer && c.punkt) ??
      kand.find((c) => c.inKlammer) ??
      kand.find((c) => c.punkt) ??
      kand[0]!;

    const ersetze = (x: Knoten, pfad: ("l" | "r")[]): { neu: Knoten; rechnung: string } => {
      if (pfad.length === 0) {
        const y = x as { op: Op; l: { n: number }; r: { n: number } };
        const v = rechne(y.op, y.l.n, y.r.n)!;
        return { neu: { n: v }, rechnung: `${y.l.n} ${zeichen[y.op]} ${y.r.n} = ${v}` };
      }
      const y = x as { op: Op; l: Knoten; r: Knoten };
      const [kopf, ...rest] = pfad;
      const innen = ersetze(y[kopf!], rest);
      return { neu: { ...y, [kopf!]: innen.neu }, rechnung: innen.rechnung };
    };
    const { neu, rechnung } = ersetze(k, wahl.pfad);
    const label = wahl.inKlammer
      ? "Klammer zuerst"
      : wahl.punkt && wahl.strichDarueber
        ? "Punkt vor Strich"
        : "Dann";
    schritte.push(
      istBlatt(neu) ? `${label}: ${rechnung}` : `${label}: ${rechnung}   →   ${text(neu)}`,
    );
    k = neu;
  }
  return schritte;
}

/** Rückwärts rechnen, um die Zahl an der Lücke zu finden. */
export function rueckwaerts(baum: Knoten, luecke: number, ergebnis: number): string[] {
  const schritte: string[] = [];
  let k = baum;
  let ziel = ergebnis;
  let offset = 0; // Blatt-Index-Verschiebung im aktuellen Teilbaum
  while (!istBlatt(k)) {
    const nl = anzahlBlaetter(k.l);
    const links = luecke - offset < nl;
    const kind = links ? k.l : k.r;
    const anderer = wert(links ? k.r : k.l)!;
    let neu: number;
    let rechnung: string;
    switch (k.op) {
      case "+":
        neu = ziel - anderer;
        rechnung = `${ziel} ${MINUS} ${anderer}`;
        break;
      case "-":
        neu = links ? ziel + anderer : anderer - ziel;
        rechnung = links ? `${ziel} ${PLUS} ${anderer}` : `${anderer} ${MINUS} ${ziel}`;
        break;
      case "*":
        neu = ziel / anderer;
        rechnung = `${ziel} ${GETEILT} ${anderer}`;
        break;
      case ":":
        neu = links ? ziel * anderer : anderer / ziel;
        rechnung = links ? `${ziel} ${MAL} ${anderer}` : `${anderer} ${GETEILT} ${ziel}`;
        break;
    }
    if (!links) offset += nl;
    schritte.push(`${text(kind, luecke - offset)} = ${rechnung} = ${neu}`);
    ziel = neu;
    k = kind;
  }
  return schritte;
}
