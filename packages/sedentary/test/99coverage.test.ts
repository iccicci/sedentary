import { deepStrictEqual as de, strictEqual as eq, ok } from "assert";

import { Attribute, DB, EntryBase, Sedentary as Sed, Table, Transaction, Type } from "..";
import { Sedentary, helper } from "./helper";
import { connection, coverage } from "./local";
import { TestDB } from "./testdb";

class SedentaryTest extends Sedentary {
  constructor() {
    super(connection);

    this.db = {
      connect: () => {
        throw { code: "test", message: "test" };
      }
    } as unknown as TestDB;
  }
}

describe("coverage", () => {
  it("constructor", () => ok(new Sed() instanceof Sed));
  it("EntryBase", () => eq(new EntryBase() instanceof EntryBase, true));
  it("EntryBase.remove", async () => eq(await new EntryBase().remove(), false));
  it("EntryBase.save", async () => eq(await new EntryBase().save(), false));
  it("Type", () => eq(new Type({ base: null, type: "" }) instanceof Type, true));

  describe("findTable", () => {
    const att = new Attribute({ attributeName: "id", base: Number, fieldName: "id", modelName: "test", notNull: true, size: 4, tableName: "test", type: "INT", unique: true });
    const db = new Sedentary(connection);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let test: any;

    beforeAll(async () => {
      test = db.model("test", {});
    });

    it("ok", () =>
      de(
        (db as unknown as { db: DB<Transaction> }).db.findTable("test"),
        new Table({
          attributes:    [att],
          autoIncrement: true,
          constraints:   [{ attribute: att, constraintName: "test_id_unique", type: "u" }],
          indexes:       [],
          model:         test,
          parent:        undefined,
          pk:            att,
          sync:          true,
          tableName:     "test"
        })
      ));
  });

  describe("connect error type any", () => {
    let db: Sedentary;

    beforeAll(async () => {
      try {
        db = new SedentaryTest();
        await db.connect();
      } catch(e) {}
    });

    it("logs", () => de(db.logs, ["Connecting...", 'Connecting: {"code":"test","message":"test"}']));
  });

  describe("parent's foreign keys", function() {
    helper(coverage.first, async db => {
      const test1 = db.model("test1", {});
      db.model("test3", { b: db.INT }, { parent: db.model("test2", { a: db.FKEY(test1) }) }, { c: () => {} });
      await db.connect();
    });
  });

  describe("DB", () => {
    class TestDB extends DB<Transaction> {
      async connect() {}
      async end() {}
      async dropFields() {}
      async dropIndexes() {}
      async syncConstraints() {}
      async syncFields() {}
      async syncIndexes() {}
      async syncSequence() {}
      async syncTable() {}

      async begin() {
        // eslint-disable-next-line no-console
        return new Transaction(console.log);
      }

      escape() {
        return "";
      }

      load() {
        return async () => [];
      }

      remove() {
        return async () => false;
      }

      save() {
        return async () => false;
      }

      async dropConstraints() {
        return [];
      }
    }

    // eslint-disable-next-line no-console
    it("DB", () => eq(new TestDB(console.log) instanceof DB, true));
  });

  describe("Transaction", () => {
    // eslint-disable-next-line no-console
    it("Transaction", () => eq(new Transaction(console.log) instanceof Transaction, true));
  });
});
