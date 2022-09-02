/* eslint-disable @typescript-eslint/no-explicit-any */

import { helper } from "./helper";
import { expected } from "./local";

describe("data types", () => {
  describe("Int & Varchar", function() {
    helper(expected.types_int, async db => {
      db.model("test1", {
        a: db.VarChar(23),
        b: db.VarChar(23),
        c: db.VarChar(),
        d: db.VarChar(23),
        e: { defaultValue: "23", type: db.VarChar },
        f: { defaultValue: "23", type: db.VarChar }
      });
      await db.connect();
    });

    describe("Int & Varchar changes", function() {
      helper(expected.types_int_change, true, async db => {
        db.model("test1", {
          a: db.Int(),
          b: db.VarChar,
          c: db.VarChar(23),
          d: db.VarChar(42),
          e: { defaultValue: "42", type: db.VarChar },
          f: { defaultValue: "23", type: db.VarChar }
        });
        await db.connect();
      });
    });
  });

  describe("DateTime", function() {
    helper(expected.types_date_time, async db => {
      db.model("test1", {
        a: db.DateTime,
        b: db.DateTime,
        c: db.VarChar,
        d: db.DateTime,
        e: db.Int,
        f: { defaultValue: new Date("1976-01-23T14:00:00.000Z"), type: db.DateTime() }
      });
      await db.connect();
    });

    describe("DateTime changes", function() {
      helper(expected.types_date_time_changes, true, async db => {
        db.model("test1", {
          a: db.DateTime,
          b: db.VarChar,
          c: db.DateTime,
          d: db.Int8,
          e: db.DateTime,
          f: { defaultValue: new Date("1976-01-23T14:00:00.000Z"), type: db.DateTime() }
        });
        await db.connect();
      });
    });
  });

  describe("Number", function() {
    helper(expected.types_number, async db => {
      db.model("test1", {
        a: db.Number,
        b: db.Number,
        c: db.VarChar
      });
      await db.connect();
    });

    describe("Number changes", function() {
      helper(expected.types_number_changes, true, async db => {
        db.model("test1", {
          a: db.Number,
          b: db.VarChar,
          c: db.Number
        });
        await db.connect();
      });
    });
  });

  describe("Boolean", function() {
    helper(expected.types_boolean, async db => {
      db.model("test1", {
        a: db.Boolean,
        b: db.Boolean,
        c: db.VarChar
      });
      await db.connect();
    });

    describe("Boolean changes", function() {
      helper(expected.types_boolean_changes, true, async db => {
        db.model("test1", {
          a: db.Boolean,
          b: db.VarChar,
          c: db.Boolean
        });
        await db.connect();
      });
    });
  });

  describe("JSON", function() {
    helper(expected.types_json, async db => {
      db.model("test1", {
        a: db.JSON<{ a: number }>(),
        b: db.JSON,
        c: db.VarChar,
        d: db.JSON,
        e: db.Int
      });
      await db.connect();
    });

    describe("JSON changes", function() {
      helper(expected.types_json_changes, true, async db => {
        db.model("test1", {
          a: db.JSON,
          b: db.VarChar,
          c: db.JSON,
          d: db.Int,
          e: db.JSON
        });
        await db.connect();
      });
    });
  });

  describe("None", function() {
    helper(expected.types_none, async db => {
      db.model("test1", {
        a: db.None,
        b: db.None,
        c: db.VarChar
      });
      await db.connect();
    });

    describe("Int & Varchar changes", function() {
      helper(expected.types_none_changes, true, async db => {
        db.model("test1", {
          a: db.None,
          b: db.VarChar,
          c: db.None
        });
        await db.connect();
      });
    });
  });
});
