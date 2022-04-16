import { helper } from "./helper";
import { dryrun } from "./local";

describe("dry run", () => {
  describe("sync", function() {
    helper(dryrun.sync, async db => {
      const test1 = db.model("test1", { a: db.INT, b: { type: db.INT, unique: true }, c: { type: db.INT, unique: true } }, { indexes: { a: "c" } });
      db.model("test2", { d: db.FKEY(test1.b), e: { defaultValue: 23, type: db.INT }, f: { defaultValue: 23, type: db.INT } }, { parent: test1 });
      await db.connect();
    });

    describe("dry run", function() {
      helper(dryrun.dryrun, true, { sync: false }, async db => {
        const test1 = db.model("test1", { a: { defaultValue: 23n, type: db.INT8, unique: true }, b: { type: db.INT, unique: true } }, { indexes: { b: "b" } });
        db.model("test2", { g: db.FKEY(test1.b), e: db.INT, f: { defaultValue: 42, type: db.INT } });
        db.model("test3", {});
        db.model("test4", {}, { parent: test1 });
        await db.connect();
      });
    });
  });
});
