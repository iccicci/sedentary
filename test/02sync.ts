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
        db.model("test2", { a: db.INT }, { primaryKey: "a" });
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
          const test2 = db.model("test2", { a: db.INT }, { primaryKey: "a" });
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
  });
});
