import { helper } from "./helper";
import { dry_run } from "./local";

describe("dry run", () => {
  describe("sync", function() {
    helper(dry_run.sync, async db => {
      const test1 = db.model("test1", { a: db.Int(), b: db.Int({ unique: true }), c: db.Int({ unique: true }) }, { indexes: { a: "c" } });
      db.model("test2", { d: db.FKey(test1.b), e: db.Int({ defaultValue: 23 }), f: db.Int({ defaultValue: 23 }) }, { parent: test1 });
      await db.connect();
    });

    describe("dry run", function() {
      helper(dry_run.dry_run, true, { sync: false }, async db => {
        const test1 = db.model("test1", { a: db.Int8({ defaultValue: 23n, unique: true }), b: db.Int({ unique: true }) }, { indexes: { b: "b" } });
        db.model("test2", { e: db.Int(), f: db.Int({ defaultValue: 42 }), g: db.FKey(test1.b) });
        db.model("test3", {});
        db.model("test4", {}, { parent: test1 });
        await db.connect();
      });
    });
  });
});
