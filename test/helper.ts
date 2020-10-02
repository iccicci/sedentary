import { deepStrictEqual as de, strictEqual as eq } from "assert";

import { Package } from "..";
import { connection } from "./local";

export { Package } from "..";
export { clean } from "./local";

export class Sedentary extends Package {
  logs: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(connection: any | string) {
    super(connection, { log: message => this.logs.push(message) });
  }
}

const logs = ["Connecting...", "Connected, syncing...", "Synced", "Closing connection...", "Connection closed"];

export function createHelper() {
  return function(test: (db: Sedentary) => Promise<void>): [() => Promise<void>, (line: string) => void, () => void] {
    let db: Sedentary;
    let j = 0;

    function log(): string {
      const current = db.logs.shift();

      if(! current) return "";
      if(logs[j] === current) return ++j ? log() : null;

      return current;
    }

    return [
      async function() {
        await test((db = new Sedentary(connection)));
        await db.end();
      },
      function(line: string) {
        it(line, () => eq(log(), line));
      },
      function() {
        //it("logs", () => de(db.logs, ["Connection closed"]));
        it("logs", () => de(db.logs, []));
      }
    ];
  };
}
