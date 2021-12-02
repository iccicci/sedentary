import { deepStrictEqual as de, strictEqual as eq } from "assert";

import { Entry, Type } from "..";
import { Attribute, DB, Table } from "../lib/db";
import { Sedentary } from "./helper";
import { connection } from "./local";

describe("coverage", () => {
  it("Entry", () => eq(new Entry() instanceof Entry, true));
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
});
