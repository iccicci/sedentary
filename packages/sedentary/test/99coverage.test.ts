import { deepStrictEqual as de, ok, strictEqual as eq } from "assert";

import { Attribute, base, DB, EntryBase, loaded, Sedentary as Sed, size, Table, Transaction, transaction, Type } from "..";
import { base as baseDB, loaded as loadedDB, size as sizeDB, transaction as transactionDB } from "../db";
import { helper, Sedentary } from "./helper";
import { connection, coverage } from "./local";
import { TestDB } from "./testDb";

class SedentaryTest extends Sedentary {
  constructor() {
    super(connection);

    this.db = {
      connect: () => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
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
  it("Type", () => eq(new Type({ [base]: null, type: "" }) instanceof Type, true));

  describe("finders", () => {
    const att = new Attribute({ attributeName: "id", [base]: Number, fieldName: "id", modelName: "test", notNull: true, [size]: 4, tableName: "test", type: "INT", unique: true });
    const db = new Sedentary(connection);
    let attribute: unknown;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let table: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let test: any;

    beforeAll(() => {
      test = db.model("test", {});
      table = (db as unknown as { db: DB<Transaction> }).db.findTable("test");
      attribute = table.findAttribute("id");
    });

    it("findTable", () =>
      de(
        table,
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

    it("findAttribute", () => expect(attribute).toBe(table.attributes[0]));
  });

  describe("connect error type any", () => {
    let db: Sedentary;

    beforeAll(async () => {
      try {
        db = new SedentaryTest();
        await db.connect();
        // eslint-disable-next-line no-empty
      } catch(error) {}
    });

    it("logs", () => de(db.logs, ["Connecting...", 'Connecting: {"code":"test","message":"test"}']));
  });

  describe("parent's foreign keys", function() {
    helper(coverage.first, async db => {
      const test1 = db.model("test1", {});
      db.model("test3", { b: db.Int() }, { parent: db.model("test2", { a: db.FKey(test1) }) }, { c: () => {} });
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

      begin() {
        // eslint-disable-next-line no-console
        return Promise.resolve(new Transaction(console.log));
      }

      cancel() {
        return () => Promise.resolve(0);
      }

      escape() {
        return "";
      }

      load() {
        return () => Promise.resolve([]);
      }

      remove() {
        return () => Promise.resolve(0);
      }

      save() {
        return () => Promise.resolve(false as const);
      }

      dropConstraints() {
        return Promise.resolve([]);
      }
    }

    // eslint-disable-next-line no-console
    it("DB", () => eq(new TestDB(console.log) instanceof DB, true));
  });

  describe("Transaction", () => {
    // eslint-disable-next-line no-console
    it("Transaction", () => eq(new Transaction(console.log) instanceof Transaction, true));
  });

  it("symbol base", () => expect(base).toBe(baseDB));
  it("symbol loaded", () => expect(loaded).toBe(loadedDB));
  it("symbol size", () => expect(size).toBe(sizeDB));
  it("symbol transaction", () => expect(transaction).toBe(transactionDB));
});
