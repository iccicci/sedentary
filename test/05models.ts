/* eslint-disable @typescript-eslint/no-explicit-any */
import { deepStrictEqual as de, strictEqual as eq } from "assert";
import { EntryBase } from "..";

import { helper } from "./helper";
import { models, packageName } from "./local";

const desc = packageName === "sedentary" ? xdescribe : describe;

describe("models", () => {
  describe("base models", function() {
    let a: EntryBase;
    let b: EntryBase;
    let dbA: any;
    let dbB: any;
    let dbC: any;
    let l1: any;
    let l2: any;
    let l3: any;
    let l4: any;
    let l5: any;
    let l6: any;
    let r1: any;
    let r2: any;
    let saveA = false;
    let saveB = false;
    let saveC = false;
    let saveD = true;

    helper(models.base, async db => {
      const test1 = db.model("test1", { a: db.INT, b: { type: db.VARCHAR, defaultValue: "test" } });
      dbA = new test1({ id: 1, a: 23, b: "ok" });
      dbB = new test1({ id: 2, a: null, b: "test" });
      dbC = new test1({ id: 1, a: 23, b: "test" });
      await db.connect();
      a = new test1({ a: 23, b: "ok" });
      b = new test1();
      saveA = await a.save();
      saveB = await b.save();
      l1 = await test1.load({ b: "ok" });
      l2 = await test1.load({ a: ["IS NULL"] });
      l3 = await test1.load({ id: ["<", 23] }, ["id"]);
      l4 = await test1.load({}, ["-id"]);
      [l5] = await test1.load({ b: "ok" });
      l5.b = "test";
      saveC = await l5.save();
      saveD = await l5.save();
      l6 = await test1.load({ b: ["IN", ["a", "b", "test"]] }, ["id"]);
      r1 = await l6[0].remove();
      r2 = await l6[0].remove();
    });

    it("save a", () => eq(saveA, true));
    it("save b", () => eq(saveB, true));
    it("save c", () => eq(saveC, true));
    it("save d", () => eq(saveD, false));
    it("a", () => de(a, dbA));
    it("b", () => de(b, dbB));
    it("load 1", () => de(l1, [dbA]));
    it("load 2", () => de(l2, [dbB]));
    it("load 3", () => de(l3, [dbA, dbB]));
    it("load 4", () => de(l4, [dbB, dbA]));
    it("load 6", () => de(l6, [dbC, dbB]));
    it("remove 1", () => de(r1, true));
    it("remove 2", () => de(r2, false));
  });

  desc("inheritance & methods", function() {
    const logs: string[] = [];

    const log = (msg: string) => logs.push(msg);

    helper(models.inheritance, async db => {
      const test1 = db.model(
        "test1",
        { a: db.INT, b: { type: db.VARCHAR, defaultValue: "test" } },
        {},
        {
          construct: function() {
            this.a = 23;
            log("test1.construct");
          },
          preLoad: function() {
            log("test1.preLoad");
          },
          postLoad: function() {
            log(`test1.postLoad ${this.id}`);
          },
          preRemove: function() {
            log(`test1.preRemove ${this.id}`);
          },
          postRemove: function() {
            log(`test1.postRemove ${this.id}`);
          },
          preSave: function() {
            log(`test1.preSave${this.id ? " " + this.id : ""}`);
          },
          postSave: function() {
            log(`test1.postSave ${this.id}`);
          },
          reset: function() {
            log(`test1.reset ${this.id}`);
            this.a = 0;
          }
        }
      );

      const test2 = db.model(
        "test2",
        { c: { type: db.INT, defaultValue: 23 }, d: db.DATETIME },
        { parent: test1 },
        {
          construct: function() {
            test1.prototype.construct.call(this);
            log("test2.construct");
          },
          preLoad: function() {
            log("test2.preLoad");
          },
          preRemove: function() {
            log(`test2.preRemove ${this.id}`);
          },
          postRemove: function() {
            test1.prototype.postRemove.call(this);
            log(`test2.postRemove ${this.id}`);
          },
          postSave: function() {
            test1.prototype.postSave.call(this);
            log(`test2.postSave ${this.id}`);
          },
          reset: function() {
            log(`test2.reset ${this.id}`);
            this.b = "no";
            this.c = 0;
          }
        }
      );

      const test3 = db.model(
        "test3",
        { e: db.INT, f: db.VARCHAR },
        { parent: test2 },
        {
          construct: function() {
            test2.prototype.construct.call(this);
            log("test3.construct");
          },
          preLoad: function() {
            test2.prototype.preLoad.call(this);
            log("test3.preLoad");
          },
          postLoad: function() {
            log(`test3.postLoad ${JSON.stringify(this)}`);
          },
          preRemove: function() {
            test2.prototype.preRemove.call(this);
            log(`test3.preRemove ${this.id}`);
          },
          postRemove: function() {
            test2.prototype.postRemove.call(this);
            log(`test3.postRemove ${this.id}`);
          },
          preSave: function() {
            test1.prototype.preSave.call(this);
            log(`test3.preSave${this.id ? " " + this.id : ""}`);
          },
          postSave: function() {
            test2.prototype.postSave.call(this);
            log(`test3.postSave ${this.id}`);
          },
          reset: function() {
            test1.prototype.reset.call(this);
            test2.prototype.reset.call(this);
            log(`test3.reset ${this.id}`);
            this.e = 0;
            this.f = "no";
          }
        }
      );

      await db.connect();

      const t11 = new test1();
      await t11.save();
      const t12 = await test1.load({ id: 1 });
      t12[0].b = "test";
      await t12[0].save();
      t12[0].b = "ok";
      await t12[0].save();

      const t21 = new test2({ a: 23, d: new Date("1976-01-23T14:00:00.000Z") });
      await t21.save();
      const t22 = await test1.load({ id: ["<=", 2] }, ["-id"]);
      t22[0].b = "test";
      await t22[0].save();
      t22[0].b = "ok";
      await t22[0].save();

      const t31 = new test3({ e: 23, f: "test" });
      await t31.save();

      const t23 = new test2({ a: 42, b: "no", d: new Date("1976-01-23T14:00:00.000Z") });
      await t23.save();

      const t32 = await test1.load({}, ["id"]);

      for(const t of t32) {
        t.reset();
        await t.save();
      }

      await t32[2].remove();
    });

    it("methods", () =>
      de(logs, [
        "test1.construct",
        "test1.preSave",
        "test1.postSave 1",
        "test1.preLoad",
        "test1.postLoad 1",
        "test1.preSave 1",
        "test1.preSave 1",
        "test1.postSave 1",
        "test1.construct",
        "test2.construct",
        "test1.preSave",
        "test1.postSave 2",
        "test2.postSave 2",
        "test1.preLoad",
        "test1.postLoad 1",
        "test2.preLoad",
        "test1.postLoad 2",
        "test1.preSave 2",
        "test1.preSave 2",
        "test1.postSave 2",
        "test2.postSave 2",
        "test1.construct",
        "test2.construct",
        "test3.construct",
        "test1.preSave",
        "test3.preSave",
        "test1.postSave 3",
        "test2.postSave 3",
        "test3.postSave 3",
        "test1.construct",
        "test2.construct",
        "test1.preSave",
        "test1.postSave 4",
        "test2.postSave 4",
        "test1.preLoad",
        "test1.postLoad 1",
        "test2.preLoad",
        "test1.postLoad 2",
        "test2.preLoad",
        "test1.postLoad 4",
        "test2.preLoad",
        "test3.preLoad",
        'test3.postLoad {"id":3,"a":23,"b":"test","c":23,"d":null,"e":23,"f":"test"}',
        "test1.reset 1",
        "test1.preSave 1",
        "test1.postSave 1",
        "test2.reset 2",
        "test1.preSave 2",
        "test1.postSave 2",
        "test2.postSave 2",
        "test1.reset 3",
        "test2.reset 3",
        "test3.reset 3",
        "test1.preSave 3",
        "test3.preSave 3",
        "test1.postSave 3",
        "test2.postSave 3",
        "test3.postSave 3",
        "test2.reset 4",
        "test1.preSave 4",
        "test1.postSave 4",
        "test2.postSave 4",
        "test2.preRemove 3",
        "test3.preRemove 3",
        "test1.postRemove 3",
        "test2.postRemove 3",
        "test3.postRemove 3"
      ]));
  });

  desc("data types", function() {
    let a: EntryBase;
    let b: EntryBase;

    helper(models.types, async db => {
      const test1 = db.model("test1", { a: db.INT, b: db.VARCHAR, c: db.DATETIME, d: db.INT8, e: db.NUMBER, f: db.BOOLEAN });
      await db.connect();
      a = new test1({ a: 23, b: "ok", c: new Date("1976-01-23"), d: 23n, e: 2.3, f: true });
      await a.save();
      b = (await test1.load({}))[0];
    });

    it("data types", () => de(a, b));
  });
});
