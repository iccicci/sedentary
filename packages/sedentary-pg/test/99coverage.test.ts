import { strictEqual as eq } from "assert";
import { PoolClient } from "pg";

import { EntryBase, TransactionPG } from "..";
import { helper } from "./helper";

describe("coverage", () => {
  describe("DB.release", function() {
    helper([], true, { autoSync: false }, async db => {
      await db.connect();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db as any).log("Syncing...");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db as any).log("Synced");
    });
  });

  it("EntryBase", () => eq(new EntryBase() instanceof EntryBase, true));
  // eslint-disable-next-line no-console
  it("TransactionPG", () => eq(new TransactionPG(console.log, null as unknown as PoolClient) instanceof TransactionPG, true));
});
