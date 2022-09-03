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
    let dbAl: any;
    let dbAs: any;
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
      const test1 = db.model("test1", { a: db.Int, b: { defaultValue: "test", type: db.VarChar }, c: db.None<number>() });
      dbAl = new test1({ a: 23, b: "ok", id: 1 });
      dbAs = new test1({ a: 23, b: "ok", c: 42, id: 1 });
      dbB = new test1({ a: null, b: "test", id: 2 });
      dbC = new test1({ a: 23, b: "test", id: 1 });
      await db.connect();
      a = new test1({ a: 23, b: "ok", c: 42 });
      b = new test1();
      saveA = await a.save();
      saveB = await b.save();
      l1 = await test1.load({ b: "ok" });
      l2 = await test1.load({ a: ["IS NULL"] });
      l3 = await test1.load({ id: ["<", 23] }, ["id"]);
      l4 = await test1.load({}, ["-id"]);
      [l5] = await test1.load({ b: "ok" });
      l5.b = "test";
      l5.c = 42;
      saveC = await l5.save();
      saveD = await l5.save();
      l6 = await test1.load({ b: ["IN", ["a", "b", "test"]] }, "id");
      r1 = await l6[0].remove();
      r2 = await l6[0].remove();
    });

    it("save a", () => eq(saveA, 1));
    it("save b", () => eq(saveB, 1));
    it("save c", () => eq(saveC, 1));
    it("save d", () => eq(saveD, false));
    it("a", () => de(a, dbAs));
    it("b", () => de(b, dbB));
    it("load 1", () => de(l1, [dbAl]));
    it("load 2", () => de(l2, [dbB]));
    it("load 3", () => de(l3, [dbAl, dbB]));
    it("load 4", () => de(l4, [dbB, dbAl]));
    it("load 6", () => de(l6, [dbC, dbB]));
    it("remove 1", () => de(r1, 1));
    it("remove 2", () => de(r2, 0));
  });

  describe("with JSON field", function() {
    helper(models.json, async db => {
      const test1 = db.model("test1", { a: db.Int, b: db.JSON<{ a: number[]; v: string }>() });
      await db.connect();
      const a = new test1({ a: 23, b: { a: [1], v: "test" } });
      await a.save();
      const [b] = await test1.load({ a: [">=", 23] });

      b.b?.a.push(2);

      await expect(b.save()).resolves.toBe(1);
      expect(b).toStrictEqual(new test1({ a: 23, b: { a: [1, 2], v: "test" }, id: 1 }));
    });
  });

  desc("inheritance & methods", function() {
    const logs: string[] = [];
    const log = (msg: string) => logs.push(msg);

    helper(models.inheritance, async db => {
      const test1 = db.model(
        "test1",
        { a: db.Int, b: { defaultValue: "test", type: db.VarChar } },
        {},
        {
          construct: function() {
            this.a = 23;
            log("test1.construct");
          },
          postLoad: function() {
            log(`test1.postLoad ${this.id}`);
          },
          postRemove: function(removedRecords: number) {
            log(`test1.postRemove ${this.id} ${removedRecords}`);
          },
          postSave: function(savedRecords: number | false) {
            log(`test1.postSave ${this.id} ${savedRecords}`);
          },
          preLoad: function() {
            log("test1.preLoad");
          },
          preRemove: function() {
            log(`test1.preRemove ${this.id}`);
          },
          preSave: function() {
            log(`test1.preSave${this.id ? " " + this.id : ""}`);
          },
          reset: function() {
            log(`test1.reset ${this.id}`);
            this.a = 0;
          }
        }
      );

      const test2 = db.model(
        "test2",
        { c: { defaultValue: 23, type: db.Int }, d: db.DateTime },
        { parent: test1 },
        {
          construct: function() {
            test1.prototype.construct.call(this);
            log("test2.construct");
          },
          postRemove: function(removedRecords: number) {
            test1.prototype.postRemove.call(this, removedRecords);
            log(`test2.postRemove ${this.id} ${removedRecords}`);
          },
          postSave: function(savedRecords: number | false) {
            test1.prototype.postSave.call(this, savedRecords);
            log(`test2.postSave ${this.id} ${savedRecords}`);
          },
          preLoad: function() {
            log("test2.preLoad");
          },
          preRemove: function() {
            log(`test2.preRemove ${this.id}`);
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
        { e: db.Int, f: db.VarChar },
        { parent: test2 },
        {
          construct: function() {
            test2.prototype.construct.call(this);
            log("test3.construct");
          },
          postLoad: function() {
            log(`test3.postLoad ${JSON.stringify(this)}`);
          },
          postRemove: function(removedRecords: number) {
            test2.prototype.postRemove.call(this, removedRecords);
            log(`test3.postRemove ${this.id} ${removedRecords}`);
          },
          postSave: function(savedRecords: number | false) {
            test2.prototype.postSave.call(this, savedRecords);
            log(`test3.postSave ${this.id} ${savedRecords}`);
          },
          preLoad: function() {
            test2.prototype.preLoad.call(this);
            log("test3.preLoad");
          },
          preRemove: function() {
            test2.prototype.preRemove.call(this);
            log(`test3.preRemove ${this.id}`);
          },
          preSave: function() {
            test1.prototype.preSave.call(this);
            log(`test3.preSave${this.id ? " " + this.id : ""}`);
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

      await test1.load({}, ["id"], 1);
    });

    it("methods", () =>
      de(logs, [
        "test1.construct",
        "test1.preSave",
        "test1.postSave 1 1",
        "test1.preLoad",
        "test1.postLoad 1",
        "test1.preSave 1",
        "test1.postSave 1 false",
        "test1.preSave 1",
        "test1.postSave 1 1",
        "test1.construct",
        "test2.construct",
        "test1.preSave",
        "test1.postSave 2 1",
        "test2.postSave 2 1",
        "test1.preLoad",
        "test1.postLoad 1",
        "test2.preLoad",
        "test1.postLoad 2",
        "test1.preSave 2",
        "test1.postSave 2 false",
        "test2.postSave 2 false",
        "test1.preSave 2",
        "test1.postSave 2 1",
        "test2.postSave 2 1",
        "test1.construct",
        "test2.construct",
        "test3.construct",
        "test1.preSave",
        "test3.preSave",
        "test1.postSave 3 1",
        "test2.postSave 3 1",
        "test3.postSave 3 1",
        "test1.construct",
        "test2.construct",
        "test1.preSave",
        "test1.postSave 4 1",
        "test2.postSave 4 1",
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
        "test1.postSave 1 1",
        "test2.reset 2",
        "test1.preSave 2",
        "test1.postSave 2 1",
        "test2.postSave 2 1",
        "test1.reset 3",
        "test2.reset 3",
        "test3.reset 3",
        "test1.preSave 3",
        "test3.preSave 3",
        "test1.postSave 3 1",
        "test2.postSave 3 1",
        "test3.postSave 3 1",
        "test2.reset 4",
        "test1.preSave 4",
        "test1.postSave 4 1",
        "test2.postSave 4 1",
        "test2.preRemove 3",
        "test3.preRemove 3",
        "test1.postRemove 3 1",
        "test2.postRemove 3 1",
        "test3.postRemove 3 1",
        "test1.preLoad",
        "test1.postLoad 1"
      ]));
  });

  describe("data types", function() {
    let a: EntryBase;
    let b: EntryBase;

    helper(models.types, async db => {
      const test1 = db.model("test1", { a: db.Int, b: db.VarChar, c: db.DateTime, d: db.Int8, e: db.Number, f: db.Boolean, g: db.JSON });
      await db.connect();
      a = new test1({ a: 23, b: "ok", c: new Date("1976-01-23"), d: 23n, e: 2.3, f: true, g: { a: "b" } });
      await a.save();
      b = (await test1.load({ d: 23n }))[0];
    });

    it("data types", () => de(a, b));
  });
});
