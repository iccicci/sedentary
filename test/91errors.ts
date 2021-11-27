import { strictEqual as eq } from "assert";

import { Sedentary } from "..";
import { errorHelper } from "./helper";

describe("class Sedentary - errors", () => {
  let err: Error;

  describe("new Sedentary(filename)", () => {
    before(async () => {
      try {
        new Sedentary([] as never);
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "new Sedentary: 'filename' argument: Wrong type, expected 'string'"));
  });

  describe("new Sedentary(, options) - type", () => {
    before(async () => {
      try {
        new Sedentary("", "test" as never);
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "new Sedentary: 'options' argument: Wrong type, expected 'Object'"));
  });

  describe("new Sedentary(, options) - option", () => {
    before(async () => {
      try {
        new Sedentary("", { test: "test" } as never);
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "new Sedentary: 'options' argument: Unknown 'test' option"));
  });

  describe("new Sedentary(, { log }) - type", () => {
    before(async () => {
      try {
        new Sedentary("", { log: "test" } as never);
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "new Sedentary: 'log' option: Wrong type, expected 'null' or 'Function'"));
  });

  describe("new Sedentary(, { sync }) - type", () => {
    before(async () => {
      try {
        new Sedentary("", { sync: "test" } as never);
      } catch(e) {
        err = e;
      }
    });

    it("message", () => eq(err.message, "new Sedentary: 'sync' option: Wrong type, expected 'boolean'"));
  });

  describe("Sedentary.model(name) - type", () => errorHelper(db => db.model({} as never, {}))("Sedentary.model: 'name' argument: Wrong type, expected 'string'"));
  describe("Sedentary.model(name) - already defined", () => errorHelper(db => db.model("test1", {}) && db.model("test1", {}))("Sedentary.model: 'test1' model: Model already defined"));
  describe("Sedentary.model(, attributes)", () => errorHelper(db => db.model("test", "test" as never))("Sedentary.model: 'test' model: 'attributes' argument: Wrong type, expected 'Object'"));
  describe("Sedentary.model(, { [key] }) - reserved", () => errorHelper(db => db.model("test", { load: {} as never }))("Sedentary.model: 'test' model: 'load' attribute: Reserved name"));
  describe("Sedentary.model(, { [key] }) - type", () =>
    errorHelper(db => db.model("test", { test: "test" as never }))("Sedentary.model: 'test' model: 'test' attribute: Wrong attribute type, expected 'Attribute'"));
  describe("Sedentary.model(, { [key] }) - value", () =>
    errorHelper(db => db.model("test", { test: () => null as never }))("Sedentary.model: 'test' model: 'test' attribute: Wrong type, expected 'Attribute'"));
  describe("Sedentary.model(, { [key]: fieldName })", () =>
    errorHelper(db => db.model("test", { test: { fieldName: 23 } as never }))("Sedentary.model: 'test' model: 'test' attribute: 'fieldName' option: Wrong type, expected 'string'"));
  describe("Sedentary.model(, { [key]: notNull })", () =>
    errorHelper(db => db.model("test", { test: { notNull: 23 } as never }))("Sedentary.model: 'test' model: 'test' attribute: 'notNull' option: Wrong type, expected 'boolean'"));
  describe("Sedentary.model(, { [key]: unique })", () =>
    errorHelper(db => db.model("test", { test: { unique: 23 } as never }))("Sedentary.model: 'test' model: 'test' attribute: 'unique' option: Wrong type, expected 'boolean'"));
  describe("Sedentary.model(, { [key]: type }) - missing", () => errorHelper(db => db.model("test", { test: {} as never }))("Sedentary.model: 'test' model: 'test' attribute: Missing 'type' option"));
  describe("Sedentary.model(, { [key]: type }) - type", () =>
    errorHelper(db => db.model("test", { test: { type: true } as never }))("Sedentary.model: 'test' model: 'test' attribute: 'type' option: Wrong type, expected 'Type'"));
  describe("Sedentary.model(, { [key]: type }) - value", () =>
    errorHelper(db => db.model("test", { test: { type: (): boolean => true } as never }))("Sedentary.model: 'test' model: 'test' attribute: 'type' option: Wrong type, expected 'Type'"));
  describe("Sedentary.model(, { [key]: type }) - db.FKEY", () =>
    errorHelper(db => db.model("test", { test: db.FKEY as never }))("Sedentary.model: 'test' model: 'test' attribute: 'this.FKEY' can't be used directly"));
  describe("Sedentary.model(, { [key]: defaultValue }) - null", () =>
    errorHelper(db => db.model("test", { test: { defaultValue: null, type: Sedentary.prototype.INT } }))(
      "Sedentary.model: 'test' model: 'test' attribute: 'defaultValue' option: Does 'null' default value really makes sense?"
    ));
  describe("Sedentary.model(, { [key]: defaultValue }) - number", () =>
    errorHelper(db => db.model("test", { test: { defaultValue: "23", type: Sedentary.prototype.INT } }))(
      "Sedentary.model: 'test' model: 'test' attribute: 'defaultValue' option: Wrong type, expected 'number'"
    ));
  describe("Sedentary.model(, { [key]: defaultValue }) - string", () =>
    errorHelper(db => db.model("test", { test: { defaultValue: 23, type: Sedentary.prototype.INT8 } }))(
      "Sedentary.model: 'test' model: 'test' attribute: 'defaultValue' option: Wrong type, expected 'string'"
    ));
  describe("Sedentary.model(, { [key]: defaultValue }) - Date", () =>
    errorHelper(db => db.model("test", { test: { defaultValue: 23, type: Sedentary.prototype.DATETIME } }))(
      "Sedentary.model: 'test' model: 'test' attribute: 'defaultValue' option: Wrong type, expected 'Date'"
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
  describe("Sedentary.model(,, { int8id, parent })", () =>
    errorHelper(db => db.model("test", {}, { int8id: true, parent: "test" } as never))("Sedentary.model: 'test' model: 'int8id' and 'parent' options conflict each other"));
  describe("Sedentary.model(,, { int8id, parent })", () =>
    errorHelper(db => db.model("test", {}, { int8id: true, primaryKey: "test" } as never))("Sedentary.model: 'test' model: 'int8id' and 'primaryKey' options conflict each other"));
  describe("Sedentary.model(,, { parent, primaryKey })", () =>
    errorHelper(db => db.model("test", {}, { parent: "test", primaryKey: "test" } as never))("Sedentary.model: 'test' model: 'parent' and 'primaryKey' options conflict each other"));
  describe("Sedentary.model(,, { primaryKey }) - type", () =>
    errorHelper(db => db.model("test", {}, { primaryKey: {} as never }))("Sedentary.model: 'test' model: 'primaryKey' option: Wrong type, expected 'string'"));
  describe("Sedentary.model(,, { primaryKey }) - value", () =>
    errorHelper(db => db.model("test", {}, { primaryKey: "test" } as never))("Sedentary.model: 'test' model: 'primaryKey' option: Attribute 'test' does not exists"));
  describe("Sedentary.model(,, { indexes }) - type", () =>
    errorHelper(db => db.model("test", {}, { indexes: "test" } as never))("Sedentary.model: 'test' model: 'indexes' option: Wrong type, expected 'Object'"));
  describe("Sedentary.model(,, { indexes: { inferred } })", () =>
    errorHelper(db => db.model("test", { a: { type: db.INT, unique: true } }, { indexes: { test_id_unique: { attributes: "a" } } } as never))(
      "Sedentary.model: 'test' model: 'test_id_unique' index: index name already inferred by the unique constraint on an attribute"
    ));
  describe("Sedentary.model(,, { indexes: { attribute } }) - type", () =>
    errorHelper(db => db.model("test", {}, { indexes: { a: { attributes: [23] } } } as never))("Sedentary.model: 'test' model: 'a' index: #1 attribute: Wrong type, expected 'string'"));
  describe("Sedentary.model(,, { indexes: { attribute } }) - type", () =>
    errorHelper(db => db.model("test", {}, { indexes: { a: { attributes: "test" } } } as never))("Sedentary.model: 'test' model: 'a' index: #1 attribute: Unknown attribute 'test'"));
  describe("Sedentary.model(,, { indexes: { attribute } }) - type", () =>
    errorHelper(db => db.model("test", {}, { indexes: { a: 23 } } as never))("Sedentary.model: 'test' model: 'a' index: Wrong type, expected 'Object'"));
  describe("Sedentary.model(,, { indexes: { option } }) - option", () =>
    errorHelper(db => db.model("test", {}, { indexes: { a: { test: 23 } } } as never))("Sedentary.model: 'test' model: 'a' index: Unknown index option 'test'"));
  describe("Sedentary.model(,, { indexes: { attributes } }) - missing", () =>
    errorHelper(db => db.model("test", {}, { indexes: { a: {} } } as never))("Sedentary.model: 'test' model: 'a' index: Missing 'attributes' option"));
  describe("Sedentary.model(,, { indexes: { attribute } }) - type", () =>
    errorHelper(db => db.model("test", {}, { indexes: { a: { attributes: 23 } } } as never))("Sedentary.model: 'test' model: 'a' index: 'attributes' option: Wrong type, expected 'FieldNames'"));
  describe("Sedentary.model(,, { indexes: { type } }) - type", () =>
    errorHelper(db => db.model("test", { a: db.INT }, { indexes: { a: { attributes: "a", type: 23 } } } as never))(
      "Sedentary.model: 'test' model: 'a' index: 'type' option: Wrong type, expected 'string'"
    ));
  describe("Sedentary.model(,, { indexes: { type } }) - value", () =>
    errorHelper(db => db.model("test", { a: db.INT }, { indexes: { a: { attributes: "a", type: "test" } } } as never))(
      "Sedentary.model: 'test' model: 'a' index: 'type' option: Wrong value, expected 'btree' or 'hash'"
    ));
  describe("Sedentary.model(,, { unique: { type } }) - type", () =>
    errorHelper(db => db.model("test", { a: db.INT }, { indexes: { a: { attributes: "a", unique: 23 } } } as never))(
      "Sedentary.model: 'test' model: 'a' index: 'unique' option: Wrong type, expected 'boolean'"
    ));
});
