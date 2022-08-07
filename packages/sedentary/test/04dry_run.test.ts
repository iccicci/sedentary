import { helper } from "./helper";
import { dry_run } from "./local";

describe("dry run", () => {
  describe("sync", function() {
    helper(dry_run.sync, async db => {
      const test1 = db.model("test1", { a: db.Int, b: { type: db.Int, unique: true }, c: { type: db.Int, unique: true } }, { indexes: { a: "c" } });
      db.model("test2", { d: db.FKey(test1.b), e: { defaultValue: 23, type: db.Int }, f: { defaultValue: 23, type: db.Int } }, { parent: test1 });
      await db.connect();
    });

    describe("dry run", function() {
      helper(dry_run.dry_run, true, { sync: false }, async db => {
        const test1 = db.model("test1", { a: { defaultValue: 23n, type: db.Int8, unique: true }, b: { type: db.Int, unique: true } }, { indexes: { b: "b" } });
        db.model("test2", { e: db.Int, f: { defaultValue: 42, type: db.Int }, g: db.FKey(test1.b) });
        db.model("test3", {});
        db.model("test4", {}, { parent: test1 });
        await db.connect();
      });
    });
  });
});
