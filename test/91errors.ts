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

  describe("Sedentary.model(name) - type", () => errorHelper(db => db.model({} as never, {}))("Sedentary.model: Wrong 'name' type: expected 'string'"));
  describe("Sedentary.model(name) - already defined", () => errorHelper(db => db.model("test1", {}) && db.model("test1", {}))("Sedentary.model: Model 'test1' already defined"));
  describe("Sedentary.model(, fields)", () => errorHelper(db => db.model("test", "test" as never))("Sedentary.model: Wrong 'fields' type: expected 'Object'"));
  describe("Sedentary.model(, { [key] }) - reserved", () => errorHelper(db => db.model("test", { load: {} as never }))("Sedentary.model: 'load' field: reserved name"));
  describe("Sedentary.model(, { [key] }) - type", () => errorHelper(db => db.model("test", { test: "test" as never }))("Sedentary.model: Wrong 'test' field type: expected 'Field'"));
  describe("Sedentary.model(, { [key] }) - value", () => errorHelper(db => db.model("test", { test: () => null as never }))("Sedentary.model: Wrong 'test' field value: expected 'Field'"));
  describe("Sedentary.model(, { [key]: fieldName })", () =>
    errorHelper(db => db.model("test", { test: { fieldName: (): boolean => true } as never }))("Sedentary.model: 'test' field: Wrong 'fieldName' attribute type: expected 'string'"));
  describe("Sedentary.model(, { [key]: type }) - missing", () => errorHelper(db => db.model("test", { test: {} as never }))("Sedentary.model: 'test' field: Missing 'type' attribute"));
  describe("Sedentary.model(, { [key]: type }) - type", () =>
    errorHelper(db => db.model("test", { test: { type: true } as never }))("Sedentary.model: 'test' field: Wrong 'type' attribute type: expected 'Type'"));
  describe("Sedentary.model(, { [key]: type }) - value", () =>
    errorHelper(db => db.model("test", { test: { type: (): boolean => true } as never }))("Sedentary.model: 'test' field: Wrong 'type' attribute value: expected 'Type'"));
  describe("Sedentary.model(,, options) - type", () => errorHelper(db => db.model("test", null, "test" as never))("Sedentary.model: Wrong 'options' type: expected 'Object'"));
  describe("Sedentary.model(,, options) - option", () => errorHelper(db => db.model("test", null, { test: "test" } as never))("Sedentary.model: Unknown 'test' option"));
  describe("Sedentary.model(,, { methods })", () => errorHelper(db => db.model("test", {}, { methods: "test" as never }))("Sedentary.model: Wrong 'methods' option type: expected 'Object'"));
  describe("Sedentary.model(,, { parent }) - type 1", () => errorHelper(db => db.model("test", {}, { parent: "test" as never }))("Sedentary.model: Wrong 'parent' option type: expected 'Model'"));
  describe("Sedentary.model(,, { parent }) - type 2", () =>
    errorHelper(db => db.model("test", {}, { parent: { isModel: () => false } as never }))("Sedentary.model: Wrong 'parent' option type: expected 'Model'"));
  describe("Sedentary.model(,, { parent, primaryKey })", () =>
    errorHelper(db => db.model("test", {}, { parent: "test" as never, primaryKey: "test" } as never))("Sedentary.model: Both 'parent' and 'primaryKey' options provided"));
  describe("Sedentary.model(,, { primaryKey }) - type", () =>
    errorHelper(db => db.model("test", {}, { primaryKey: {} as never }))("Sedentary.model: Wrong 'primaryKey' option type: expected 'string'"));
  describe("Sedentary.model(,, { primaryKey }) - value", () => errorHelper(db => db.model("test", {}, { primaryKey: "test" } as never))("Sedentary.model: 'primaryKey' field 'test' does not exists"));
});
