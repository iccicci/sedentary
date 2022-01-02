import { deepStrictEqual as de, strictEqual as eq } from "assert";
import { EntryBase } from "..";

import { helper } from "./helper";
import { models } from "./local";

describe("models", () => {
  describe("insert", function() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let test1: any;
    let a: EntryBase;
    let b: EntryBase;
    let saveA = false;
    let saveB = false;

    helper(models.insert, async db => {
      test1 = db.model("test1", { a: db.INT, b: { type: db.VARCHAR, defaultValue: "test" } });
      await db.connect();
      a = new test1({ a: 23, b: "ok" });
      b = new test1();
      saveA = await a.save();
      saveB = await b.save();
    });

    it("save a", () => eq(saveA, true));
    it("save b", () => eq(saveB, true));
    it("a", () => de(a, new test1({ id: 1, a: 23, b: "ok" })));
    it("b", () => de(b, new test1({ id: 2, a: null, b: "test" })));
  });
});
