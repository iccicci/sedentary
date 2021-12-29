import { deepStrictEqual as de, strictEqual as eq, ok } from "assert";

import { Package, Sedentary, helper } from "./helper";
import { connection, wrongConnection, wrongConnectionError } from "./local";

describe("class Sedentary", () => {
  describe("new Sedentary()", () => {
    it("constructor", () => ok(new Package(connection) instanceof Package));
  });

  describe("connect", () => {
    const db = new Sedentary(connection);

    before(async () => {
      await db.connect();
      await db.end();
    });

    it("ok", () => ok(true));
    it("log", () => de(db.logs, ["Connecting...", "Connected, syncing...", "Synced", "Closing connection...", "Connection closed"]));
  });

  describe("connect error", () => {
    const db = new Sedentary(wrongConnection);
    let err: Error;

    before(async () => {
      try {
        await db.connect();
      } catch(e) {
        if(e instanceof Error) err = e;
      }
    });

    it("error", () => eq(err.message, wrongConnectionError));
    it("log", () => de(db.logs, ["Connecting...", `Connecting: ${wrongConnectionError}`]));
  });

  describe("null logger", function() {
    helper([], true, { log: null }, async db => await db.connect());
  });
});
