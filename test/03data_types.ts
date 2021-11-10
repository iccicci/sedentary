/* eslint-disable @typescript-eslint/no-explicit-any */

import { helper } from "./helper";
import { expected } from "./local";

describe("data types", () => {
  describe("INT & VARCHAR", function() {
    helper(expected.types_int, async db => {
      db.model("test1", {
        a: db.VARCHAR(23),
        b: db.VARCHAR(23),
        c: db.VARCHAR(),
        d: db.VARCHAR(23),
        e: { defaultValue: "23", type: db.VARCHAR },
        f: { defaultValue: "23", type: db.VARCHAR }
      });
      await db.connect();
    });

    describe("INT & VARCHAR", function() {
      helper(expected.types_int_change, true, async db => {
        db.model("test1", {
          a: db.INT(),
          b: db.VARCHAR,
          c: db.VARCHAR(23),
          d: db.VARCHAR(42),
          e: { defaultValue: "42", type: db.VARCHAR },
          f: { defaultValue: "23", type: db.VARCHAR }
        });
        await db.connect();
      });
    });
  });

  describe("DATETIME", function() {
    helper(expected.types_datetime, async db => {
      db.model("test1", {
        a: db.DATETIME,
        b: db.DATETIME,
        c: db.VARCHAR,
        d: db.DATETIME,
        e: db.INT,
        f: { defaultValue: new Date("1976-01-23T14:00:00.000Z"), type: db.DATETIME() }
      });
      await db.connect();
    });

    describe("DATETIME changes", function() {
      helper(expected.types_datetime_changes, true, async db => {
        db.model("test1", {
          a: db.DATETIME,
          b: db.VARCHAR,
          c: db.DATETIME,
          d: db.INT8,
          e: db.DATETIME
        });
        await db.connect();
      });
    });
  });
});
