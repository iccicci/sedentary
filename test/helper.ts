import { deepStrictEqual as de, strictEqual as eq } from "assert";

import { Package } from "..";
import { clean, connection } from "./local";

export { Package } from "..";

export class Sedentary extends Package {
  logs: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(connection: any | string) {
    super(connection, { log: message => this.logs.push(message) });
  }
}

const logs = ["Connecting...\n", "Connected, syncing...\n", "Synced\n", "Closing connection...\n", "Connection closed\n"];

export function helper(expected: string[], test: (db: Sedentary) => Promise<void>): void;
export function helper(expected: string[], notClean: ((db: Sedentary) => Promise<void>) | boolean, test?: (db: Sedentary) => Promise<void>): void;
export function helper(expected: string[], notClean: ((db: Sedentary) => Promise<void>) | boolean, test?: (db: Sedentary) => Promise<void>): void {
  let db: Sedentary;
  let j = 0;

  if(typeof notClean === "function") {
    test = notClean;
    notClean = false;
  }

  function log(): string {
    const current = db.logs.shift();

    if(! current) return "";
    if(logs[j] === current) return ++j ? log() : null;

    return current;
  }

  before(async function() {
    try {
      if(! notClean) await clean();
      await test((db = new Sedentary(connection)));
    } catch(e) {
      throw e;
    } finally {
      await db.end();
    }
  });

  if(expected[0]) {
    for(const i in expected) it(expected[i].slice(0, -1), () => eq(log(), expected[i]));
    it("End", () => de(db.logs, ["Synced\n", "Closing connection...\n", "Connection closed\n"]));
  } else it("End", () => de(db.logs, logs));
}

export function errorHelper(test: (db: Sedentary) => void): (message: string) => void {
  let err: Error;

  before(async function() {
    try {
      test(new Sedentary(connection));
    } catch(e) {
      err = e;
    }
  });

  return function(message: string) {
    it("error", () => eq(err.message, message));
  };
}
