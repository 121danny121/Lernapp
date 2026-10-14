import { MINUS, PLUS } from "../../core/format";
import { lueckenGleichungView } from "../../ui/LueckenGleichung";
import type { KopfrechnenTask } from "./generator";

export const KopfrechnenView = lueckenGleichungView<KopfrechnenTask>((t) =>
  t.op === "+" ? PLUS : MINUS,
);
