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

    it("message", () => eq(err.message, "Sedentary.constructor: 'filename' argument: Wrong type, expected 'string'"));
  });

  describe("Sedentary.constructor(, options) - type", () => {
    before(async () => {
      try {
        new Sedentary("", "test" as never);
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "Sedentary.constructor: 'options' argument: Wrong type, expected 'Object'"));
  });

  describe("Sedentary.constructor(, options) - option", () => {
    before(async () => {
      try {
        new Sedentary("", { test: "test" } as never);
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "Sedentary.constructor: 'options' argument: Unknown 'test' option"));
  });

  describe("Sedentary.model(name) - type", () => errorHelper(db => db.model({} as never, {}))("Sedentary.model: 'name' argument: Wrong type, expected 'string'"));
  describe("Sedentary.model(name) - already defined", () => errorHelper(db => db.model("test1", {}) && db.model("test1", {}))("Sedentary.model: 'test1' model: Model already defined"));
  describe("Sedentary.model(, fields)", () => errorHelper(db => db.model("test", "test" as never))("Sedentary.model: 'test' model: 'fields' argument: Wrong type, expected 'Object'"));
  describe("Sedentary.model(, { [key] }) - reserved", () => errorHelper(db => db.model("test", { load: {} as never }))("Sedentary.model: 'test' model: 'load' field: Reserved name"));
  describe("Sedentary.model(, { [key] }) - type", () =>
    errorHelper(db => db.model("test", { test: "test" as never }))("Sedentary.model: 'test' model: 'test' field: Wrong field type, expected 'Field'"));
  describe("Sedentary.model(, { [key] }) - value", () =>
    errorHelper(db => db.model("test", { test: () => null as never }))("Sedentary.model: 'test' model: 'test' field: Wrong type, expected 'Field'"));
  describe("Sedentary.model(, { [key]: fieldName })", () =>
    errorHelper(db => db.model("test", { test: { fieldName: (): boolean => true } as never }))("Sedentary.model: 'test' model: 'test' field: 'fieldName' option: Wrong type, expected 'string'"));
  describe("Sedentary.model(, { [key]: type }) - missing", () => errorHelper(db => db.model("test", { test: {} as never }))("Sedentary.model: 'test' model: 'test' field: Missing 'type' option"));
  describe("Sedentary.model(, { [key]: type }) - type", () =>
    errorHelper(db => db.model("test", { test: { type: true } as never }))("Sedentary.model: 'test' model: 'test' field: 'type' option: Wrong type, expected 'Type'"));
  describe("Sedentary.model(, { [key]: type }) - value", () =>
    errorHelper(db => db.model("test", { test: { type: (): boolean => true } as never }))("Sedentary.model: 'test' model: 'test' field: 'type' option: Wrong type, expected 'Type'"));
  describe("Sedentary.model(, { [key]: type }) - null", () =>
    errorHelper(db => db.model("test", { test: { defaultValue: null, type: Sedentary.prototype.INT } }))(
      "Sedentary.model: 'test' model: 'test' field: 'defaultValue' option: Does 'null' default value really makes sense?"
    ));
  describe("Sedentary.model(, { [key]: type }) - number", () =>
    errorHelper(db => db.model("test", { test: { defaultValue: "23", type: Sedentary.prototype.INT } }))(
      "Sedentary.model: 'test' model: 'test' field: 'defaultValue' option: Wrong type, expected 'number'"
    ));
  describe("Sedentary.model(, { [key]: type }) - string", () =>
    errorHelper(db => db.model("test", { test: { defaultValue: 23, type: Sedentary.prototype.INT8 } }))(
      "Sedentary.model: 'test' model: 'test' field: 'defaultValue' option: Wrong type, expected 'string'"
    ));
  describe("Sedentary.model(,, options) - type", () => errorHelper(db => db.model("test", null, "test" as never))("Sedentary.model: 'test' model: 'options' argument: Wrong type, expected 'Object'"));
  describe("Sedentary.model(,, options) - option", () =>
    errorHelper(db => db.model("test", null, { test: "test" } as never))("Sedentary.model: 'test' model: 'options' argument: Unknown 'test' option"));
  describe("Sedentary.model(,, { methods })", () =>
    errorHelper(db => db.model("test", {}, { methods: "test" as never }))("Sedentary.model: 'test' model: 'methods' option: Wrong type, expected 'Object'"));
  describe("Sedentary.model(,, { parent }) - type 1", () =>
    errorHelper(db => db.model("test", {}, { parent: "test" as never }))("Sedentary.model: 'test' model: 'parent' option: Wrong type, expected 'Model'"));
  describe("Sedentary.model(,, { parent }) - type 2", () =>
    errorHelper(db => db.model("test", {}, { parent: { isModel: () => false } as never }))("Sedentary.model: 'test' model: 'parent' option: Wrong type, expected 'Model'"));
  describe("Sedentary.model(,, { parent, primaryKey })", () =>
    errorHelper(db => db.model("test", {}, { parent: "test" as never, primaryKey: "test" } as never))("Sedentary.model: 'test' model: Both 'parent' and 'primaryKey' options provided"));
  describe("Sedentary.model(,, { primaryKey }) - type", () =>
    errorHelper(db => db.model("test", {}, { primaryKey: {} as never }))("Sedentary.model: 'test' model: 'primaryKey' option: Wrong type, expected 'string'"));
  describe("Sedentary.model(,, { primaryKey }) - value", () =>
    errorHelper(db => db.model("test", {}, { primaryKey: "test" } as never))("Sedentary.model: 'test' model: 'primaryKey' option: Field 'test' does not exists"));
});
