import { strictEqual as eq } from "assert";

import { Sedentary } from "..";
import { errorHelper } from "./helper";

describe("class Sedentary - errors", () => {
  let err: Error;

  describe("Sedentary.constructor(filename)", () => {
    before(async () => {
      try {
        new Sedentary([] as never);
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "Sedentary.constructor: Wrong 'filename' type: expected 'string'"));
  });

  describe("Sedentary.constructor(, options) - type", () => {
    before(async () => {
      try {
        new Sedentary("", "test" as never);
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "Sedentary.constructor: Wrong 'options' type: expected 'Object'"));
  });

  describe("Sedentary.constructor(, options) - option", () => {
    before(async () => {
      try {
        new Sedentary("", { test: "test" } as never);
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "Sedentary.constructor: Unknown 'test' option"));
  });

  describe("Sedentary.model(name)", () => errorHelper(db => db.model({} as never, {}))("Sedentary.model: Wrong 'name' type: expected 'string'"));
  describe("Sedentary.model(, fields)", () => errorHelper(db => db.model("test", "test" as never))("Sedentary.model: Wrong 'fields' type: expected 'Object'"));
  describe("Sedentary.model(,, options) - type", () => errorHelper(db => db.model("test", null, "test" as never))("Sedentary.model: Wrong 'options' type: expected 'Object'"));
  describe("Sedentary.model(,, options) - option", () => errorHelper(db => db.model("test", null, { test: "test" } as never))("Sedentary.model: Unknown 'test' option"));
});
