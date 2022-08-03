import { strictEqual as eq } from "assert";

import { SedentaryPG, Type } from "..";
import { errorHelper } from "./helper";
import { connection } from "./local";

class PGDB extends SedentaryPG {
  getDB() {
    return this.db;
  }
}

function pgdb(): [SedentaryPG, { [key: string]: unknown }] {
  const db = new PGDB(connection, { log: () => {} });

  return [db, db.getDB() as unknown as { [key: string]: unknown }];
}

describe("errors", () => {
  let err: Error;

  describe("SedentaryPG.constructor(connection)", () => {
    beforeAll(async () => {
      try {
        new SedentaryPG("" as never);
      } catch(e) {
        if(e instanceof Error) err = e;
      }
    });

    it("message", () => eq(err.message, "SedentaryPG.constructor: 'connection' argument: Wrong type, expected 'Object'"));
  });

  describe("PGDB.sync", () => {
    beforeAll(async () => {
      const [db, ddb] = pgdb();

      ddb.syncTable = async function(): Promise<void> {
        throw new Error("test");
      };

      try {
        db.model("test1", {});
        await db.connect();
      } catch(e) {
        db.end();
        if(e instanceof Error) err = e;
      }
    });

    it("error", () => eq(err.message, "test"));
  });

  describe("PGDB.syncTable", () => {
    beforeAll(async () => {
      const [db, ddb] = pgdb();

      ddb.connect = async function(): Promise<void> {
        this._client = {
          query: async (): Promise<void> => {
            throw new Error("test");
          },
          release: () => {}
        };
      };

      try {
        db.model("test1", {});
        await db.connect();
      } catch(e) {
        if(e instanceof Error) err = e;
      }
    });

    it("error", () => eq(err.message, "test"));
  });

  describe("PGDB.syncField", () => {
    beforeAll(async () => {
      const [db] = pgdb();

      try {
        db.model("test1", { a: new Type({ base: Number, size: 3, type: "test" }) });
        await db.connect();
      } catch(e) {
        if(e instanceof Error) err = e;
      }

      await db.end();
    });

    it("error", () => eq(err.message, "Unknown type: 'test', '3'"));
  });

  describe("SedentaryPG.FKEY", () =>
    errorHelper(db => {
      class test1 extends db.model("test1", { a: db.INT }) {}
      db.model("test", { a: db.FKEY(test1.a) });
    })("Sedentary.FKEY: 'test1' model: 'a' attribute: is not unique: can't be used as FKEY target"));

  describe("SedentaryPG.escape(null)", () =>
    errorHelper(db => {
      db.escape(null as never);
    })("SedentaryPG: Can't escape null nor undefined values; use the 'IS NULL' operator instead"));

  describe("SedentaryPG.escape(undefined)", () =>
    errorHelper(db => {
      db.escape(undefined as never);
    })("SedentaryPG: Can't escape null nor undefined values; use the 'IS NULL' operator instead"));
});
