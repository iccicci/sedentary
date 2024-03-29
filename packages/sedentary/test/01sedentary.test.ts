import { deepStrictEqual as de, ok,strictEqual as eq } from "assert";

import { helper,Package, Sedentary } from "./helper";
import { connection, wrongConnection, wrongConnectionError } from "./local";

describe("class Sedentary", () => {
  describe("new Sedentary()", () => {
    it("constructor", () => ok(new Sedentary(connection) instanceof Package));
  });

  describe("connect", () => {
    const db = new Sedentary(connection);

    beforeAll(async () => {
      await db.connect();
      await db.end();
    });

    it("ok", () => ok(true));
    it("log", () => de(db.logs, ["Connecting...", "Connected", "Syncing...", "Synced", "Closing connection...", "Connection closed"]));
  });

  describe("connect error", () => {
    const db = new Sedentary(wrongConnection);
    let err: Error;

    beforeAll(async () => {
      try {
        await db.connect();
      } catch(e) {
        if(e instanceof Error) err = e;
      }
    });

    it("error", () => eq(err.message, wrongConnectionError));
    it("log", () => de(db.logs, ["Connecting...", `Connecting: ${wrongConnectionError}`]));
  });

  describe("autoSync false", () => {
    const db = new Sedentary(connection, { autoSync: false });

    beforeAll(async () => {
      await db.connect();
      await db.end();
    });

    it("log", () => de(db.logs, ["Connecting...", "Connected", "Closing connection...", "Connection closed"]));
  });

  describe("null logger", function() {
    helper([], true, { log: null }, async db => await db.connect());
  });
});
