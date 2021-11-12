import { deepStrictEqual as de, strictEqual as eq, ok } from "assert";

import { Package, Sedentary } from "./helper";
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
    it("log", () => de(db.logs, ["Connecting...\n", "Connected, syncing...\n", "Synced\n", "Closing connection...\n", "Connection closed\n"]));
  });

  describe("connect error", () => {
    const db = new Sedentary(wrongConnection);
    let error: Error;

    before(async () => {
      try {
        await db.connect();
      } catch(e) {
        error = e;
      }
    });

    it("error", () => eq(error.message, wrongConnectionError));
    it("log", () => de(db.logs, ["Connecting...\n", `Connecting: ${wrongConnectionError}\n`]));
  });
});
