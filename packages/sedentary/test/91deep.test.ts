import { deepCopy, deepDiff } from "..";

describe("deep", () => {
  describe("deepCopy", () => {
    const obj = { a: [null, 23] };
    it("deepCopy", () => expect(deepCopy(obj)).toStrictEqual(obj));
  });

  describe("deepDiff", () => {
    it("equal values", () => expect(deepDiff(23, 23)).toBe(false));
    it("different values", () => expect(deepDiff(23, 42)).toBe(true));
    it("object Vs not object", () => expect(deepDiff({}, 23)).toBe(true));
    it("null Vs null", () => expect(deepDiff(null, null)).toBe(false));
    it("null Vs not null", () => expect(deepDiff(null, {})).toBe(true));
    it("not null Vs null", () => expect(deepDiff({}, null)).toBe(true));
    it("equal arrays", () => expect(deepDiff([23, null, 42], [23, null, 42])).toBe(false));
    it("different arrays", () => expect(deepDiff([23, null, 42], [23])).toBe(true));
    it("array Vs not array", () => expect(deepDiff([23, null, 42], {})).toBe(true));
    it("objects with different number of keys", () => expect(deepDiff({ test: 23 }, {})).toBe(true));
    it("objects with different key", () => expect(deepDiff({ test: 23 }, { check: 42 })).toBe(true));
    it("objects with different value", () => expect(deepDiff({ test: 23 }, { test: 42 })).toBe(true));
    // eslint-disable-next-line sort-keys-fix/sort-keys-fix
    it("equal objects", () => expect(deepDiff({ check: 42, test: 23 }, { test: 23, check: 42 })).toBe(false));
  });
});
