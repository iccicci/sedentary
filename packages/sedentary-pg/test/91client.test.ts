import { deepEqual as de } from "assert";

import { helper } from "./helper";
import { client } from "./local";

describe("client", () => {
  describe("simple", function() {
    let a: unknown;

    helper(client.simple, async db => {
      const test1 = db.model("test1", { a: db.Int(), b: db.VarChar(), c: db.DateTime(), d: db.Int8(), e: db.Number(), f: db.Boolean() });
      await db.connect();
      const aa = new test1({ a: 23, b: "ok", c: new Date("1976-01-23"), d: 23n, e: 2.3, f: true });
      await aa.save();
      const client = await db.client();
      const res = await client.query(" SELECT * FROM test1");
      a = res.rows[0];
      client.release();
    });

    it("record", () => de(a, { a: 23, b: "ok", c: new Date("1976-01-23"), d: 23n, e: 2.3, f: true, id: 1 }));
  });

  describe("transaction", function() {
    let a: unknown;

    helper(client.transaction, async db => {
      const test1 = db.model("test1", { a: db.Int(), b: db.VarChar(), c: db.DateTime(), d: db.Int8(), e: db.Number(), f: db.Boolean() });
      await db.connect();
      const aa = new test1({ a: 23, b: "ok", c: new Date("1976-01-23"), d: 23n, e: 2.3, f: true });
      await aa.save();
      const tx = await db.begin();
      const client = await tx.client();
      const res = await client.query(" SELECT * FROM test1");
      a = res.rows[0];
      await tx.rollback();
    });

    it("record", () => de(a, { a: 23, b: "ok", c: new Date("1976-01-23"), d: 23n, e: 2.3, f: true, id: 1 }));
  });
});
