/* eslint-disable @typescript-eslint/no-explicit-any */

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
          d: { defaultValue: "42", type: db.INT8 },
          f: { notNull: true, type: db.INT8 }
        });
        await db.connect();
      });
    });
  });

  describe("field types", function() {
    helper(expected.sync_field_types, async db => {
      db.model("test1", {
        a: db.VARCHAR(23),
        b: db.VARCHAR(23),
        c: db.VARCHAR(),
        d: db.VARCHAR(23),
        e: { defaultValue: "23", type: db.VARCHAR },
        f: { defaultValue: "23", type: db.VARCHAR }
      });
      await db.connect();
    });

    describe("change field types", function() {
      helper(expected.sync_field_types_change, true, async db => {
        db.model("test1", {
          a: db.INT(),
          b: db.VARCHAR,
          c: db.VARCHAR(23),
          d: db.VARCHAR(42),
          e: { defaultValue: "42", type: db.VARCHAR },
          f: { defaultValue: "23", type: db.VARCHAR }
        });
        await db.connect();
      });
    });
  });

  describe("datetime", function() {
    helper(expected.sync_datetime, async db => {
      db.model("test1", {
        a: db.DATETIME,
        b: db.DATETIME,
        c: db.VARCHAR,
        d: db.DATETIME,
        e: db.INT
      });
      await db.connect();
    });

    describe("datetime changes", function() {
      helper(expected.sync_datetime_changes, true, async db => {
        db.model("test1", {
          a: db.DATETIME,
          b: db.VARCHAR,
          c: db.DATETIME,
          d: db.INT8,
          e: db.DATETIME
        });
        await db.connect();
      });
    });
  });
});
