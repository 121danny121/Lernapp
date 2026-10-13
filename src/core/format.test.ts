import { parseAnswer, stellenwerte } from "./format";

test("stellenwerte", () => {
  expect(stellenwerte(365)).toEqual([300, 60, 5]);
  expect(stellenwerte(408)).toEqual([400, 8]);
  expect(stellenwerte(70)).toEqual([70]);
  expect(stellenwerte(0)).toEqual([]);
});

test("parseAnswer", () => {
  expect(parseAnswer("")).toBeNull();
  expect(parseAnswer("042")).toBe(42);
});
