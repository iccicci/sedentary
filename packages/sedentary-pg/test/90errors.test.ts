import { strictEqual as eq } from "assert";
import { base, size } from "sedentary";

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
    beforeAll(() => {
      try {
        new SedentaryPG("" as never);
      } catch(error) {
        if(error instanceof Error) err = error;
      }
    });

    it("message", () => eq(err.message, "SedentaryPG.constructor: 'connection' argument: Wrong type, expected 'Object'"));
  });

  describe("PGDB.sync", () => {
    beforeAll(async () => {
      const [db, ddb] = pgdb();

      ddb.syncTable = function(): Promise<void> {
        return Promise.reject(new Error("test"));
      };

      try {
        db.model("test1", {});
        await db.connect();
      } catch(error) {
        await db.end();
        if(error instanceof Error) err = error;
      }
    });

    it("error", () => eq(err.message, "test"));
  });

  describe("PGDB.syncTable", () => {
    beforeAll(async () => {
      const [db, ddb] = pgdb();

      ddb.connect = function(): Promise<void> {
        this._client = {
          query:   (): Promise<void> => Promise.reject(new Error("test")),
          release: () => {}
        };

        return Promise.resolve();
      };

      try {
        db.model("test1", {});
        await db.connect();
      } catch(error) {
        if(error instanceof Error) err = error;
      }
    });

    it("error", () => eq(err.message, "test"));
  });

  describe("PGDB.syncField", () => {
    beforeAll(async () => {
      const [db] = pgdb();

      try {
        db.model("test1", { a: new Type({ [base]: Number, [size]: 3, type: "test" }) });
        await db.connect();
      } catch(error) {
        if(error instanceof Error) err = error;
      }

      await db.end();
    });

    it("error", () => eq(err.message, "Unknown type: 'test', '3'"));
  });

  describe("SedentaryPG.escape(null)", () =>
    errorHelper(db => {
      db.escape(null as never);
    })("SedentaryPG: Can't escape null nor undefined values; use the 'IS NULL' operator instead"));

  describe("SedentaryPG.escape(undefined)", () =>
    errorHelper(db => {
      db.escape(undefined as never);
    })("SedentaryPG: Can't escape null nor undefined values; use the 'IS NULL' operator instead"));
});
