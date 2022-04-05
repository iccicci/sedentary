import { deepStrictEqual as de } from "assert";
import { helper } from "./helper";
import { packageName, transactions } from "./local";

const desc = packageName === "sedentary" ? xdescribe : describe;

describe("transactions", () => {
  describe("commit", function() {
    let l2: unknown;
    let result: unknown;

    helper(transactions.commit, async db => {
      const test2 = db.model("test2", { a: db.INT, b: db.VARCHAR });
      await db.connect();
      const r1 = new test2({ a: 1, b: "1" });
      await r1.save();
      const tx = await db.begin();
      const r2 = new test2({ a: 2, b: "2" }, tx);
      const l1 = await test2.load({}, tx);
      l1[0].a = 11;
      l1[0].b = "11";
      await l1[0].save();
      await r2.save();
      await tx.commit();
      l2 = await test2.load({}, ["id"]);
      result = [new test2({ id: 1, a: 11, b: "11" }), new test2({ id: 2, a: 2, b: "2" })];
    });

    it("commit", () => de(l2, result));
  });

  describe("rollback", function() {
    let l2: unknown;
    let result: unknown;

    helper(transactions.rollback, async db => {
      const test3 = db.model("test3", { a: db.INT, b: db.VARCHAR });
      await db.connect();
      const r1 = new test3({ a: 1, b: "1" });
      await r1.save();
      const tx = await db.begin();
      const r2 = new test3({ a: 2, b: "2" }, tx);
      const l1 = await test3.load({}, tx, true);
      l1[0].a = 11;
      l1[0].b = "11";
      await l1[0].save();
      await r2.save();
      await tx.rollback();
      l2 = await test3.load({}, ["id"]);
      result = [new test3({ id: 1, a: 1, b: "1" })];
    });

    it("rollback", () => de(l2, result));
  });

  desc("locks", function() {
    const actual = [] as unknown[];

    helper(transactions.locks, async db => {
      const test1 = db.model("test1", { a: db.INT, b: db.VARCHAR });
      await db.connect();
      const r1 = new test1({ a: 1, b: "1" });
      const r2 = new test1({ a: 2, b: "2" });
      await r1.save();
      await r2.save();

      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      const tx1 = await db.begin();
      const tx2 = await db.begin();
      const tx3 = await db.begin();

      const t1 = async () => {
        const l = await test1.load({ a: 1 }, tx1, true);

        await sleep(600);

        actual.push({ ...l[0] });
        l[0].b = "3";

        await l[0].save();
        await tx1.commit();
      };

      const t2 = async () => {
        await sleep(200);

        const l1 = await test1.load({ a: 2 }, tx2, true);
        const l2 = await test1.load({ a: 1 }, tx2, true);

        actual.push({ ...l1[0] });
        actual.push({ ...l2[0] });
        l1[0].b = "4";

        await l1[0].save();
        await tx2.commit();
      };

      const t3 = async () => {
        await sleep(400);

        const l = await test1.load({ a: 2 }, tx3, true);

        actual.push({ ...l[0] });

        await tx3.rollback();
      };

      await Promise.all([t1(), t2(), t3()]);
    });

    it("locks", () =>
      de(actual, [
        { id: 1, a: 1, b: "1" },
        { id: 2, a: 2, b: "2" },
        { id: 1, a: 1, b: "3" },
        { id: 2, a: 2, b: "4" }
      ]));
  });
});
