import { deepStrictEqual as de, strictEqual as eq } from "assert";

import { EntryBase, Type } from "..";
import { Attribute, DB, Table } from "../db";
import { Sedentary } from "./helper";
import { connection } from "./local";

class SedentaryTest extends Sedentary {
  constructor() {
    super(connection);

    this.db = {
      connect: () => {
        throw { code: "test", message: "test" };
      }
    } as unknown as DB;
  }
}

describe("coverage", () => {
  it("EntryBase", () => eq(new EntryBase() instanceof EntryBase, true));
  it("EntryBase.save", async () => eq(await new EntryBase().save(), false));
  it("Type", () => eq(new Type({ base: null, type: "" }) instanceof Type, true));

  describe("findTable", () => {
    const att = new Attribute({ attributeName: "id", base: Number, fieldName: "id", modelName: "test", notNull: true, size: 4, tableName: "test", type: "INT", unique: true });
    const db = new Sedentary(connection);

    before(async () => {
      db.model("test", {});
    });

    it("ok", () =>
      de(
        (db as unknown as { db: DB }).db.findTable("test"),
        new Table({
          attributes:    [att],
          autoIncrement: true,
          constraints:   [{ attribute: att, constraintName: "test_id_unique", type: "u" }],
          indexes:       [],
          parent:        undefined,
          sync:          true,
          tableName:     "test"
        })
      ));
  });

  describe("connect error type any", () => {
    let db: Sedentary;

    before(async () => {
      try {
        db = new SedentaryTest();
        await db.connect();
      } catch(e) {}
    });

    it("logs", () => de(db.logs, ["Connecting...", 'Connecting: {"code":"test","message":"test"}']));
  });
});
