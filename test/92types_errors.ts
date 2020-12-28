import { errorHelper } from "./helper";

describe("types - errors", () => {
  describe("Sedentary.INT(size) - type", () => errorHelper(db => db.model("test", { test: db.INT(2.5) }))("Sedentary.INT: Wrong 'size': expected 2 or 4"));
  describe("Sedentary.INT(size) - value", () => errorHelper(db => db.model("test", { test: db.INT(5) }))("Sedentary.INT: Wrong 'size': expected 2 or 4"));
});
