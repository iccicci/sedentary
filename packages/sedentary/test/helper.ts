import { deepStrictEqual as de, strictEqual as eq } from "assert";

import { SedentaryOptions } from "..";
import { clean, connection } from "./local";
import { Sedentary as SedentaryBase } from "./package";

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
export function helper(expected: string[], notClean: Test | boolean, options?: Test | SedentaryOptions, test?: Test) {
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

  beforeAll(async function() {
    try {
      if(! notClean) await clean();
      await test!((db = new Sedentary(connection, options)));
    } catch(error) {
      err = error;
    } finally {
      await db.end();
    }
  });

  it("No exceptions", () => {
    if(err) throw err as Error;
  });

  if(expected[0]) {
    for(const line of expected) it(line, () => eq(log(), line));
    it("End", () => de(db.logs, [...(j === 3 ? ["Synced"] : []), "Closing connection...", "Connection closed"]));
  } else it("End", () => de(db.logs, options!.log === null ? [] : logs));
}

export function errorHelper(test: (db: Sedentary) => unknown) {
  let err: Error;

  beforeAll(async function() {
    try {
      const ret = test(new Sedentary(connection));

      if(ret instanceof Promise) await ret;
    } catch(error) {
      err = error as Error;
    }
  });

  return function(message: string) {
    it("error", () => {
      if(! err) throw new Error("No errors thrown");
      eq(err.message, message);
    });
  };
}
