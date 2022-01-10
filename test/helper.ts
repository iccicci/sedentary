import { deepStrictEqual as de, strictEqual as eq } from "assert";

import { SedentaryOptions } from "..";
import { Sedentary as SedentaryBase } from "./package";
import { clean, connection } from "./local";

export { Package } from "./package";

export class Sedentary extends SedentaryBase {
  logs: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(connection: any, options?: SedentaryOptions) {
    super(connection, { log: (message: string) => this.logs.push(message), ...options });
  }
}

const logs = ["Connecting...", "Connected", "Syncing...", "Synced", "Closing connection...", "Connection closed"];

type Test = (db: Sedentary) => Promise<void>;

export function helper(expected: string[], test: Test): void;
export function helper(expected: string[], notClean: Test | boolean, test?: Test): void;
export function helper(expected: string[], notClean: Test | boolean, options?: Test | SedentaryOptions, test?: Test): void;
export function helper(expected: string[], notClean: Test | boolean, options?: Test | SedentaryOptions, test?: Test): void {
  let db: Sedentary;
  let j = 0;
  let err: unknown;

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
      err = e;
    } finally {
      await db.end();
    }
  });

  it("No exceptions", () => de(err, undefined));
  if(expected[0]) {
    for(const i in expected) it(expected[i], () => eq(log(), expected[i]));
    it("End", () => de(db.logs, [...(j === 3 ? ["Synced"] : []), "Closing connection...", "Connection closed"]));
  } else it("End", () => de(db.logs, (options as SedentaryOptions).log === null ? [] : logs));
}

export function errorHelper(test: (db: Sedentary) => void): (message: string) => void {
  let err: Error;

  before(async function() {
    try {
      await test(new Sedentary(connection));
    } catch(e) {
      if(e instanceof Error) err = e;
    }
  });

  return function(message: string) {
    it("error", () => eq(err.message, message));
  };
}
