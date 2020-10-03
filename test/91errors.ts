import { strictEqual as eq } from "assert";

import { Sedentary } from "..";

describe("class Sedentary - errors", () => {
  let err: Error;

  describe("Sedentary.constructor(filename)", () => {
    before(async () => {
      try {
        new Sedentary(([] as unknown) as string);
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "Sedentary.constructor: Wrong 'filename' type: expected 'string'"));
  });

  describe("Sedentary.constructor(, options)", () => {
    before(async () => {
      try {
        new Sedentary("", ("test" as unknown) as { log?: (message: string) => void });
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "Sedentary.constructor: Wrong 'options' type: expected 'Object'"));
  });

  describe("Sedentary.model(name)", () => {
    before(async () => {
      try {
        const db = new Sedentary("");

        db.model(({} as unknown) as string, {});
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "Sedentary.model: Wrong 'name' type: expected 'string'"));
  });

  describe("Sedentary.model(, fields)", () => {
    before(async () => {
      try {
        const db = new Sedentary("");

        db.model("test", ("test" as unknown) as never);
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "Sedentary.model: Wrong 'fields' type: expected 'Object'"));
  });

  describe("Sedentary.model(,, options)", () => {
    before(async () => {
      try {
        const db = new Sedentary("");

        db.model("test", null, ("test" as unknown) as never);
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "Sedentary.model: Wrong 'options' type: expected 'Object'"));
  });
});
