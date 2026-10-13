import { DIFFICULTIES } from "../core/types";
import { taskTypes } from "./registry";

describe("Registry", () => {
  test("IDs sind eindeutig", () => {
    const ids = taskTypes.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test.each(taskTypes)("$id: Voreinstellungen passen zu den Einstellungen", (type) => {
    for (const d of DIFFICULTIES) {
      const config = type.defaults[d];
      for (const s of type.settings) {
        const v = config[s.key];
        expect(v, `${type.id}.${d}.${s.key} fehlt`).toBeDefined();
        if (s.type === "range") {
          expect(typeof v).toBe("number");
          expect(v).toBeGreaterThanOrEqual(s.min);
          expect(v).toBeLessThanOrEqual(s.max);
        }
        if (s.type === "toggle") expect(typeof v).toBe("boolean");
        if (s.type === "select") expect(s.options.map((o) => o.value)).toContain(v);
        if (s.type === "multiselect") {
          expect(Array.isArray(v)).toBe(true);
          for (const x of v as string[]) expect(s.options.map((o) => o.value)).toContain(x);
        }
      }
    }
  });
});
