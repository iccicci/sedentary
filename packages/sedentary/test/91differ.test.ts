import { differ } from "..";

describe("class Sedentary", () => {
  it("equal values", () => expect(differ(23, 23)).toBe(false));
  it("different values", () => expect(differ(23, 42)).toBe(true));
  it("object Vs not object", () => expect(differ({}, 23)).toBe(true));
  it("null Vs null", () => expect(differ(null, null)).toBe(false));
  it("null Vs not null", () => expect(differ(null, {})).toBe(true));
  it("not null Vs null", () => expect(differ({}, null)).toBe(true));
  it("equal arrays", () => expect(differ([23, null, 42], [23, null, 42])).toBe(false));
  it("different arrays", () => expect(differ([23, null, 42], [23])).toBe(true));
  it("array Vs not array", () => expect(differ([23, null, 42], {})).toBe(true));
  it("objects with different number of keys", () => expect(differ({ test: 23 }, {})).toBe(true));
  it("objects with different key", () => expect(differ({ test: 23 }, { check: 42 })).toBe(true));
  it("objects with different value", () => expect(differ({ test: 23 }, { test: 42 })).toBe(true));
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  it("equal objects", () => expect(differ({ check: 42, test: 23 }, { test: 23, check: 42 })).toBe(false));
});
