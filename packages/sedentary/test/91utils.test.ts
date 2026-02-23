import { deepCopy, deepDiff, toSqlName } from "..";

describe("utils", () => {
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
    // eslint-disable-next-line sort-keys/sort-keys-fix
    it("equal objects", () => expect(deepDiff({ check: 42, test: 23 }, { test: 23, check: 42 })).toBe(false));
  });

  describe("toSqlName", () => {
    it("camelCase to snake_case", () => expect(toSqlName("firstName")).toBe("first_name"));
    it("PascalCase to snake_case", () => expect(toSqlName("FirstName")).toBe("first_name"));
    it("keeps lowercase unchanged", () => expect(toSqlName("id")).toBe("id"));
    it("keeps snake_case unchanged", () => expect(toSqlName("first_name")).toBe("first_name"));
    it("multiple uppercase segments", () => expect(toSqlName("myVariableName")).toBe("my_variable_name"));
    it("single lowercase letter", () => expect(toSqlName("a")).toBe("a"));
    it("single uppercase letter", () => expect(toSqlName("A")).toBe("a"));
    it("all uppercase", () => expect(toSqlName("ABC")).toBe("a_b_c"));
    it("first char uppercase only", () => expect(toSqlName("User")).toBe("user"));

    it("throws on empty string", () => expect(() => toSqlName("")).toThrow("toSqlName: 'name' must be a non-empty string"));
    it("throws on non-string", () => expect(() => toSqlName(23 as never)).toThrow("toSqlName: 'name' must be a non-empty string"));
  });
});
