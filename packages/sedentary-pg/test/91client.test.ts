import { deepEqual as de } from "assert";

import { helper } from "./helper";
import { client } from "./local";

describe("client", () => {
  describe("simple", function() {
    let a: unknown;

    helper(client.simple, async db => {
      const test1 = db.model("test1", { a: db.INT, b: db.VARCHAR, c: db.DATETIME, d: db.INT8, e: db.NUMBER, f: db.BOOLEAN });
      await db.connect();
      const aa = new test1({ a: 23, b: "ok", c: new Date("1976-01-23"), d: 23n, e: 2.3, f: true });
      await aa.save();
      const client = await db.client();
      const res = await client.query(" SELECT * FROM test1");
      a = res.rows[0];
      client.release();
    });

    it("record", () => de(a, { id: 1, a: 23, b: "ok", c: new Date("1976-01-23"), d: 23n, e: 2.3, f: true }));
  });

  describe("transaction", function() {
    let a: unknown;

    helper(client.transaction, async db => {
      const test1 = db.model("test1", { a: db.INT, b: db.VARCHAR, c: db.DATETIME, d: db.INT8, e: db.NUMBER, f: db.BOOLEAN });
      await db.connect();
      const aa = new test1({ a: 23, b: "ok", c: new Date("1976-01-23"), d: 23n, e: 2.3, f: true });
      await aa.save();
      const tx = await db.begin();
      const client = await tx.client();
      const res = await client.query(" SELECT * FROM test1");
      a = res.rows[0];
      await tx.rollback();
    });

    it("record", () => de(a, { id: 1, a: 23, b: "ok", c: new Date("1976-01-23"), d: 23n, e: 2.3, f: true }));
  });
});
