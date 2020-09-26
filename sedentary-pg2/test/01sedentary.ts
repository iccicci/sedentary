"use strict";

import { Sedentary } from "..";
import { strictEqual as eq, ok } from "assert";

describe("sedentary", () => {
  describe("new Sedentary()", () => it("constructor", () => ok(new Sedentary("test") instanceof Sedentary)));

  describe("connect", () => {
    let error: Error;

    before(done => {
      const db = new Sedentary("test.db");

      db.connect(err => {
        error = err;
        done();
      });
    });

    it("err is undefined", () => eq(error, undefined));
  });

  describe("async connect", () => {
    before(async() => {
      const db = new Sedentary("test.db");

      await db.connect();
    });

    it("ok", () => ok(true));
  });

  describe("connect error", () => {
    let error: Error;

    before(done => {
      const db = new Sedentary("test");

      db.connect(err => {
        error = err;
        done();
      });
    });

    it("err is undefined", () => eq(error.message, "EISDIR: illegal operation on a directory, read"));
  });

  describe("async connect error", () => {
    let error: Error;

    before(async() => {
      const db = new Sedentary("test");

      try {
        await db.connect();
      } catch(e) {
        error = e;
      }
    });

    it("err is undefined", () => eq(error.message, "EISDIR: illegal operation on a directory, read"));
  });

  describe("end", () => {
    let error: Error;

    before(done => {
      const db = new Sedentary("test.db");

      db.connect(err => {
        if(err) {
          error = err;
          return done();
        }

        db.end(err => {
          error = err;
          done();
        });
      });
    });

    it("err is undefined", () => eq(error, undefined));
  });

  describe("async end", () => {
    before(async() => {
      const db = new Sedentary("test.db");

      await db.connect();
      await db.end();
    });

    it("ok", () => ok(true));
  });
});
