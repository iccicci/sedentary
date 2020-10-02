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

    it("message", () => eq(err.message, "Sedentary.constructor: Wrong 'filename' parameter"));
  });

  describe("Sedentary.constructor(, options)", () => {
    before(async () => {
      try {
        new Sedentary("", ("test" as unknown) as { log?: (message: string) => void });
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "Sedentary.constructor: Wrong 'options' parameter"));
  });
});
