import { helper } from "./helper";
import { expected } from "./local";

describe("sync", () => {
  describe("CREATE TABLE", function() {
    helper(expected.sync_create_table, async db => {
      db.model("test1", {});
      await db.connect();
    });

    describe("CREATE TABLE already exists", function() {
      helper(expected.sync_create_table_exists, true, async db => {
        db.model("test1", {});
        await db.connect();
      });
    });

    describe("CREATE TABLE with primaryKey", function() {
      helper(expected.sync_create_table_pk, true, async db => {
        db.model("test2", { a: db.INT, b: { unique: true, type: db.INT } }, { primaryKey: "a" });
        await db.connect();
      });
    });

    describe("CREATE TABLE with parent", function() {
      helper(expected.sync_create_table_parent, true, async db => {
        const test1 = db.model("test1", {});
        db.model("test3", {}, { parent: test1 });
        await db.connect();
      });

      describe("CREATE TABLE same parent", function() {
        helper(expected.sync_create_table_parent_same, true, async db => {
          const test1 = db.model("test1", {});
          db.model("test3", {}, { parent: test1 });
          await db.connect();
        });
      });

      describe("CREATE TABLE change parent", function() {
        helper(expected.sync_create_table_parent_change, true, async db => {
          const test2 = db.model("test2", { a: db.INT, b: { unique: true, type: db.INT } }, { primaryKey: "a" });
          db.model("test3", {}, { parent: test2 });
          await db.connect();
        });

        describe("CREATE TABLE remove parent", function() {
          helper(expected.sync_create_table_parent_remove, true, async db => {
            db.model("test3", {});
            await db.connect();
          });

          describe("CREATE TABLE add parent", function() {
            helper(expected.sync_create_table_parent_add, true, async db => {
              const test1 = db.model("test1", {});
              db.model("test3", {}, { parent: test1 });
              await db.connect();
            });
          });
        });
      });
    });

    describe("DROP COLUMN", function() {
      helper(expected.sync_drop_column, true, async db => {
        db.model("test2", { a: db.INT }, { primaryKey: "a" });
        await db.connect();
      });
    });
  });

  describe("CREATE TABLE int8id", function() {
    helper(expected.sync_create_table_int8id, async db => {
      db.model("test1", { a: db.INT, b: db.INT8 }, { int8id: true });
      await db.connect();
    });
  });

  describe("field options", function() {
    helper(expected.sync_field_options, async db => {
      db.model("test1", {
        a: { type: db.INT, unique: true },
        b: { notNull: true, type: db.INT },
        c: { defaultValue: 23, type: db.INT(2) },
        d: { defaultValue: "23", notNull: true, type: db.VARCHAR },
        e: { fieldName: "f", type: db.INT },
        g: { fieldName: "h", type: db.INT() }
      });
      await db.connect();
    });

    describe("change field options", function() {
      helper(expected.sync_field_options_change, true, async db => {
        db.model("test1", {
          a: { defaultValue: 23, type: db.INT },
          b: { type: db.INT, unique: true },
          c: { notNull: true, type: db.INT(2) },
          d: { defaultValue: 42n, type: db.INT8 },
          f: { notNull: true, type: db.INT8 }
        });
        await db.connect();
      });
    });
  });

  describe("indexes 1", function() {
    helper(expected.sync_index_1, async db => {
      db.model("test1", { a: db.INT, b: db.INT8 }, { indexes: { ia: "a" } });
      await db.connect();
    });

    describe("indexes 2", function() {
      helper(expected.sync_index_2, true, async db => {
        db.model("test1", { a: db.INT, b: db.INT8 }, { indexes: { ia: ["a"], ib: ["a", "b"] } });
        await db.connect();
      });

      describe("indexes 3", function() {
        helper(expected.sync_index_3, true, async db => {
          db.model("test1", { a: db.INT, b: db.INT8 }, { indexes: { ia: { attributes: "a", type: "hash" }, ib: { attributes: ["a", "b"], unique: true } } });
          await db.connect();
        });

        describe("indexes 4", function() {
          helper(expected.sync_index_4, true, async db => {
            db.model("test1", { a: db.INT, b: db.INT8 }, { indexes: { ia: { attributes: ["a", "b"] }, ib: { attributes: ["b", "a"], unique: true } } });
            await db.connect();
          });
        });
      });
    });
  });

  describe("foreign keys 1", function() {
    helper(expected.sync_foreign_keys_1, async db => {
      class test1 extends db.model("test1", { a: { type: db.INT, unique: true }, b: { type: db.INT8, unique: true }, c: { fieldName: "d", type: db.VARCHAR, unique: true } }) {}
      db.model("test2", { a: db.FKEY(test1), b: db.FKEY(test1.a), c: db.FKEY(test1.b), d: db.FKEY(test1.c) });
      await db.connect();
    });

    describe("foreign keys 2", function() {
      helper(expected.sync_foreign_keys_2, true, async db => {
        class test1 extends db.model("test1", { a: { type: db.INT, unique: true }, b: db.INT8, c: { fieldName: "d", type: db.VARCHAR } }) {}
        class test3 extends db.model("test3", { b: { type: db.INT8, unique: true } }) {}
        db.model("test2", { a: db.FKEY(test1.a), b: db.FKEY(test1.a), c: db.FKEY(test3.b) });
        await db.connect();
      });
    });
  });

  describe("foreign keys 3", function() {
    helper(expected.sync_foreign_keys_3, async db => {
      class test1 extends db.model("test1", {}) {}
      db.model("test2", {
        a: db.FKEY(test1, { onDelete: "no action" }),
        b: db.FKEY(test1, { onUpdate: "no action" }),
        c: db.FKEY(test1),
        d: db.FKEY(test1, { onDelete: "cascade" }),
        e: db.FKEY(test1, { onUpdate: "restrict" }),
        f: db.FKEY(test1, { onDelete: "set default", onUpdate: "set null" }),
        g: db.FKEY(test1, { onDelete: "no action", onUpdate: "no action" }),
        h: db.FKEY(test1, { onDelete: "cascade", onUpdate: "set null" })
      });
      await db.connect();
    });

    describe("foreign keys 4", function() {
      helper(expected.sync_foreign_keys_4, true, async db => {
        class test1 extends db.model("test1", {}) {}
        db.model("test2", {
          a: db.FKEY(test1, { onDelete: "cascade" }),
          b: db.FKEY(test1, { onUpdate: "restrict" }),
          c: db.FKEY(test1, { onDelete: "set default", onUpdate: "set null" }),
          d: db.FKEY(test1, { onDelete: "no action" }),
          e: db.FKEY(test1, { onUpdate: "no action" }),
          f: db.FKEY(test1),
          g: db.FKEY(test1),
          h: db.FKEY(test1, { onDelete: "cascade", onUpdate: "set null" })
        });
        await db.connect();
      });
    });
  });
});
