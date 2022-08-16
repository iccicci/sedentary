import { deepStrictEqual as de } from "assert";
import { helper } from "./helper";
import { packageName, transactions } from "./local";

const desc = packageName === "sedentary" ? xdescribe : describe;

describe("transactions", () => {
  describe("commit", function() {
    let l2: unknown;
    let result: unknown;

    helper(transactions.commit, async db => {
      const test2 = db.model("test2", { a: db.Int, b: db.VarChar });
      await db.connect();
      const r1 = new test2({ a: 1, b: "1" });
      await r1.save();
      const r2 = new test2({ a: 2, b: "2" });
      await r2.save();
      const tx = await db.begin();
      const r3 = new test2({ a: 3, b: "3" }, tx);
      const l1 = await test2.load({}, tx);
      l1[0].a = 11;
      l1[0].b = "11";
      await l1[0].save();
      await l1[1].remove();
      await r3.save();
      await tx.commit();
      l2 = await test2.load({ id: [">", 0] }, ["id"]);
      result = [new test2({ a: 11, b: "11", id: 1 }), new test2({ a: 3, b: "3", id: 3 })];
    });

    it("commit", () => de(l2, result));
  });

  describe("rollback", function() {
    let l2: unknown;
    let result: unknown;

    helper(transactions.rollback, async db => {
      const test3 = db.model("test3", { a: db.Int, b: db.VarChar });
      await db.connect();
      const r1 = new test3({ a: 1, b: "1" });
      await r1.save();
      const r2 = new test3({ a: 2, b: "2" });
      await r2.save();
      const tx = await db.begin();
      const r3 = new test3({ a: 3, b: "3" }, tx);
      const l1 = await test3.load({}, tx, true);
      l1[0].a = 11;
      l1[0].b = "11";
      await l1[0].save();
      await l1[1].remove();
      await r3.save();
      await tx.rollback();
      l2 = await test3.load({}, ["id"]);
      result = [new test3({ a: 1, b: "1", id: 1 }), new test3({ a: 2, b: "2", id: 2 })];
    });

    it("rollback", () => de(l2, result));
  });

  desc("locks", function() {
    const actual: unknown[] = [];

    helper(transactions.locks, async db => {
      const test1 = db.model("test1", { a: db.Int, b: db.VarChar, c: db.JSON<{ a?: number[]; b: string }>() });
      await db.connect();
      const r1 = new test1({ a: 1, b: "1", c: { b: "test" } });
      const r2 = new test1({ a: 2, b: "2" });
      await r1.save();
      await r2.save();

      const tx1 = await db.begin();
      const tx2 = await db.begin();
      const tx3 = await db.begin();

      let w1: () => void;
      let w2: () => void;
      let w3: () => void;

      const p1 = new Promise<void>(resolve => (w1 = resolve));
      const p2 = new Promise<void>(resolve => (w2 = resolve));
      const p3 = new Promise<void>(resolve => (w3 = resolve));

      const t1 = async () => {
        const l = await test1.load({ a: 1 }, tx1, true);

        w1();
        await p3;

        actual.push({ ...l[0] });
        l[0].b = "3";

        await l[0].save();
        await tx1.commit();
      };

      const t2 = async () => {
        await p1;

        const l1 = await test1.load({ a: 2 }, tx2, true);
        w2();
        const l2 = await test1.load({ a: 1 }, tx2, true);

        actual.push({ ...l1[0] });
        actual.push({ ...l2[0] });
        l1[0].b = "4";

        await l1[0].save();
        await tx2.commit();
      };

      const t3 = async () => {
        await p2;
        w3();

        const l = await test1.load({ a: 2 }, tx3, true);

        actual.push({ ...l[0] });

        await tx3.rollback();
      };

      await Promise.all([t1(), t2(), t3()]);
    });

    it("locks", () =>
      de(actual, [
        { a: 1, b: "1", c: { b: "test" }, id: 1 },
        { a: 2, b: "2", c: null, id: 2 },
        { a: 1, b: "3", c: { b: "test" }, id: 1 },
        { a: 2, b: "4", c: null, id: 2 }
      ]));
  });

  describe("cancel", () => {
    const actual: unknown[] = [];
    let result: unknown[] = [];

    helper(transactions.cancel, async db => {
      const test1 = db.model("test1", { a: db.Int, b: db.VarChar });
      await db.connect();
      const r1 = new test1({ a: 1, b: "1" });
      await r1.save();
      const r2 = new test1({ a: 2, b: "2" });
      await r2.save();
      const tx = await db.begin();
      const r3 = new test1({ a: 3, b: "3" }, tx);
      await r3.save();
      actual.push(await test1.cancel({}, tx));
      await tx.rollback();
      actual.push(await test1.cancel({ b: "1" }));
      actual.push(await test1.load({ a: ["<=", 10] }));
      result = [3, 1, [new test1({ a: 2, b: "2", id: 2 })]];
    });

    it("cancel", () => de(actual, result));
  });
});
