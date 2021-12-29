import { deepStrictEqual as de, strictEqual as eq } from "assert";

import { Package, SedentaryOptions } from "..";
import { clean, connection } from "./local";

export { Package } from "..";

export class Sedentary extends Package {
  logs: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(connection: any | string, options?: SedentaryOptions) {
    super(connection, { log: message => this.logs.push(message), ...options });
  }
}

const logs = ["Connecting...", "Connected, syncing...", "Synced", "Closing connection...", "Connection closed"];

type Test = (db: Sedentary) => Promise<void>;

export function helper(expected: string[], test: Test): void;
export function helper(expected: string[], notClean: Test | boolean, test?: Test): void;
export function helper(expected: string[], notClean: Test | boolean, options?: Test | SedentaryOptions, test?: Test): void;
export function helper(expected: string[], notClean: Test | boolean, options?: Test | SedentaryOptions, test?: Test): void {
  let db: Sedentary;
  let j = 0;

  if(typeof notClean === "function") {
    test = notClean;
    notClean = false;
    options = {};
  }

  if(typeof options === "function") {
    test = options;
    options = {};
  }

  function log(): string | null {
    const current = db.logs.shift();

    if(! current) return "";
    if(logs[j] === current) return ++j ? log() : null;

    return current;
  }

  before(async function() {
    try {
      if(! notClean) await clean();
      await (test as Test)((db = new Sedentary(connection, options as SedentaryOptions)));
    } catch(e) {
      throw e;
    } finally {
      await db.end();
    }
  });

  if(expected[0]) {
    for(const i in expected) it(expected[i].slice(0, -1), () => eq(log(), expected[i]));
    it("End", () => de(db.logs, ["Synced", "Closing connection...", "Connection closed"]));
  } else it("End", () => de(db.logs, (options as SedentaryOptions).log === null ? [] : logs));
}

export function errorHelper(test: (db: Sedentary) => void): (message: string) => void {
  let err: Error;

  before(async function() {
    try {
      test(new Sedentary(connection));
    } catch(e) {
      if(e instanceof Error) err = e;
    }
  });

  return function(message: string) {
    it("error", () => eq(err.message, message));
  };
}
