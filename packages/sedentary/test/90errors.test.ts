import { strictEqual as eq } from "assert";

import { Sedentary } from "..";
import { errorHelper } from "./helper";

describe("class Sedentary - errors", () => {
  let err: Error;

  describe("new Sedentary(filename)", () => {
    beforeAll(async () => {
      try {
        await new Sedentary({ log: null }).connect();
      } catch(e) {
        if(e instanceof Error) err = e;
      }
    });

    it("message", () => eq(err.message, "Package sedentary can't be used directly. Please check: https://www.npmjs.com/package/sedentary#disclaimer"));
  });

  describe("new Sedentary(options) - type", () => {
    beforeAll(() => {
      try {
        new Sedentary("test" as never);
      } catch(e) {
        if(e instanceof Error) err = e;
      }
    });

    it("message", () => eq(err.message, "new Sedentary: 'options' argument: Wrong type, expected 'Object'"));
  });

  describe("new Sedentary(options) - option", () => {
    beforeAll(() => {
      try {
        new Sedentary({ test: "test" } as never);
      } catch(e) {
        if(e instanceof Error) err = e;
      }
    });

    it("message", () => eq(err.message, "new Sedentary: 'options' argument: Unknown 'test' option"));
  });

  describe("new Sedentary(, { autoSync }) - type", () => {
    beforeAll(() => {
      try {
        new Sedentary({ autoSync: "test" } as never);
      } catch(e) {
        if(e instanceof Error) err = e;
      }
    });

    it("message", () => eq(err.message, "new Sedentary: 'autoSync' option: Wrong type, expected 'boolean'"));
  });

  describe("new Sedentary(, { log }) - type", () => {
    beforeAll(() => {
      try {
        new Sedentary({ log: "test" } as never);
      } catch(e) {
        if(e instanceof Error) err = e;
      }
    });

    it("message", () => eq(err.message, "new Sedentary: 'log' option: Wrong type, expected 'null' or 'Function'"));
  });

  describe("new Sedentary(, { sync }) - type", () => {
    beforeAll(() => {
      try {
        new Sedentary({ sync: "test" } as never);
      } catch(e) {
        if(e instanceof Error) err = e;
      }
    });

    it("message", () => eq(err.message, "new Sedentary: 'sync' option: Wrong type, expected 'boolean'"));
  });

  describe("Sedentary.model(name) - type", () => errorHelper(db => db.model({} as never, {}))("Sedentary.model: 'name' argument: Wrong type, expected 'string'"));
  describe("Sedentary.model(name) - already defined", () => errorHelper(db => db.model("test1", {}) && db.model("test1", {}))("Sedentary.model: 'test1' model: Model already defined"));
  describe("Sedentary.model(, attributes)", () => errorHelper(db => db.model("test", "test" as never))("Sedentary.model: 'test' model: 'attributes' argument: Wrong type, expected 'Object'"));
  describe("Sedentary.model(, { [key] }) - reserved", () => errorHelper(db => db.model("test", { load: {} as never }))("Sedentary.model: 'test' model: 'load' attribute: Reserved name"));
  describe("Sedentary.model(, { [key] }) - type", () =>
    errorHelper(db => db.model("test", { test: "test" as never }))("Sedentary.model: 'test' model: 'test' attribute: 'test': Wrong type, expected 'Type'"));
  describe("Sedentary.model(, { [key]: fieldName })", () =>
    errorHelper(db => db.model("test", { test: db.Int({ fieldName: 23 as never }) }))("Sedentary.model: 'test' model: 'test' attribute: 'fieldName' option: Wrong type, expected 'string'"));
  describe("Sedentary.model(, { [key]: notNull })", () =>
    errorHelper(db => db.model("test", { test: db.Int({ notNull: 23 as never }) }))("Sedentary.model: 'test' model: 'test' attribute: 'notNull' option: Wrong type, expected 'boolean'"));
  describe("Sedentary.model(, { [key]: unique })", () =>
    errorHelper(db => db.model("test", { test: db.Int({ unique: 23 as never }) }))("Sedentary.model: 'test' model: 'test' attribute: 'unique' option: Wrong type, expected 'boolean'"));
  describe("Sedentary.model(, { [key]: defaultValue }) - null", () =>
    errorHelper(db => db.model("test", { test: db.JSON({ defaultValue: null }) }))(
      "Sedentary.model: 'test' model: 'test' attribute: 'defaultValue' option: Does 'null' default value really make sense?"
    ));
  describe("Sedentary.model(, { [key]: defaultValue }) - number", () =>
    errorHelper(db => db.model("test", { test: db.Int({ defaultValue: "23" as never }) }))(
      "Sedentary.model: 'test' model: 'test' attribute: 'defaultValue' option: Wrong type, expected 'number'"
    ));
  describe("Sedentary.model(, { [key]: defaultValue }) - string", () =>
    errorHelper(db => db.model("test", { test: db.VarChar({ defaultValue: 23 as never }) }))(
      "Sedentary.model: 'test' model: 'test' attribute: 'defaultValue' option: Wrong type, expected 'string'"
    ));
  describe("Sedentary.model(, { [key]: defaultValue }) - string", () =>
    errorHelper(db => db.model("test", { test: db.Int8({ defaultValue: 23 as never }) }))(
      "Sedentary.model: 'test' model: 'test' attribute: 'defaultValue' option: Wrong type, expected 'BigInt'"
    ));
  describe("Sedentary.model(, { [key]: defaultValue }) - Date", () =>
    errorHelper(db => db.model("test", { test: db.DateTime({ defaultValue: 23 as never }) }))(
      "Sedentary.model: 'test' model: 'test' attribute: 'defaultValue' option: Wrong type, expected 'Date'"
    ));
  describe("Sedentary.model(,, options) - type", () =>
    errorHelper(db => db.model("test", null as never, "test" as never))("Sedentary.model: 'test' model: 'options' argument: Wrong type, expected 'Object'"));
  describe("Sedentary.model(,, options) - option", () =>
    errorHelper(db => db.model("test", null as never, { test: "test" } as never))("Sedentary.model: 'test' model: 'options' argument: Unknown 'test' option"));
  describe("Sedentary.model(,, { parent }) - type 1", () =>
    errorHelper(db => db.model("test", {}, { parent: "test" as never }))("Sedentary.model: 'test' model: 'parent' option: Wrong type, expected 'Model'"));
  describe("Sedentary.model(,, { parent }) - type 2", () =>
    errorHelper(db => db.model("test", {}, { parent: {} as never }))("Sedentary.model: 'test' model: 'parent' option: Wrong type, expected 'Model'"));
  describe("Sedentary.model(,, { parent }) - type 3", () =>
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
    errorHelper(db => db.model("test", { a: db.Int({ unique: true }) }, { indexes: { test_id_unique: { attributes: "a" } } } as never))(
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
    errorHelper(db => db.model("test", { a: db.Int() }, { indexes: { a: { attributes: "a", type: 23 } } } as never))(
      "Sedentary.model: 'test' model: 'a' index: 'type' option: Wrong type, expected 'string'"
    ));
  describe("Sedentary.model(,, { indexes: { type } }) - value", () =>
    errorHelper(db => db.model("test", { a: db.Int() }, { indexes: { a: { attributes: "a", type: "test" } } } as never))(
      "Sedentary.model: 'test' model: 'a' index: 'type' option: Wrong value, expected 'btree' or 'hash'"
    ));
  describe("Sedentary.model(,, { unique: { type } }) - type", () =>
    errorHelper(db => db.model("test", { a: db.Int() }, { indexes: { a: { attributes: "a", unique: 23 } } } as never))(
      "Sedentary.model: 'test' model: 'a' index: 'unique' option: Wrong type, expected 'boolean'"
    ));
  describe("Sedentary.model(,, { methods })", () => errorHelper(db => db.model("test", {}, {}, "test" as never))("Sedentary.model: 'test' model: 'methods' option: Wrong type, expected 'Object'"));
  describe("Sedentary.model() - conflict: attribute Vs method", () =>
    errorHelper(db => db.model("test", { a: db.Int() }, {}, { a: () => {} }))("Sedentary.model: 'test' model: 'a' method: conflicts with an attribute"));
  describe("Sedentary.model() - conflict: attribute Vs foreignKey", () =>
    errorHelper(db => {
      const test1 = db.model("test1", {});
      db.model("test2", { a: db.FKey(test1), aLoad: db.Int() });
    })("Sedentary.model: 'test2' model: 'a' attribute: 'aLoad' inferred methods conflicts with an attribute"));
  describe("Sedentary.model() - conflict: foreignKey Vs method", () =>
    errorHelper(db => {
      const test1 = db.model("test1", {});
      db.model("test2", { a: db.FKey(test1) }, {}, { aLoad: () => {} });
    })("Sedentary.model: 'test2' model: 'a' attribute: 'aLoad' inferred methods conflicts with a method"));
  describe("Sedentary.model() - conflict: attribute Vs parent.attribute", () =>
    errorHelper(db => {
      const test1 = db.model("test1", { a: db.Int() });
      db.model("test2", { a: db.Int() }, { parent: test1 });
    })("Sedentary.model: 'test2' model: 'a' attribute: conflicts with an attribute of 'test1' model"));
  describe("Sedentary.model() - conflict: attribute Vs parent.foreignKey", () =>
    errorHelper(db => {
      const test1 = db.model("test1", {});
      const test2 = db.model("test2", { a: db.FKey(test1) });
      db.model("test3", { aLoad: db.Int() }, { parent: test2 });
    })("Sedentary.model: 'test3' model: 'aLoad' attribute: conflicts with an inferred methods of 'test2' model"));
  describe("Sedentary.model() - conflict: attribute Vs parent.method", () =>
    errorHelper(db => {
      const test1 = db.model("test1", {}, {}, { a: () => {} });
      db.model("test2", { a: db.Int() }, { parent: test1 });
    })("Sedentary.model: 'test2' model: 'a' attribute: conflicts with a method of 'test1' model"));
  describe("Sedentary.model() - conflict: foreignKey Vs parent.attribute", () =>
    errorHelper(db => {
      const test1 = db.model("test1", { aLoad: db.Int() });
      db.model("test2", { a: db.FKey(test1) }, { parent: test1 });
    })("Sedentary.model: 'test2' model: 'a' attribute: 'aLoad' inferred methods conflicts with an attribute of 'test1' model"));
  describe("Sedentary.model() - conflict: foreignKey Vs parent.method", () =>
    errorHelper(db => {
      const test1 = db.model("test1", {}, {}, { aLoad: () => {} });
      db.model("test2", { a: db.FKey(test1) }, { parent: test1 });
    })("Sedentary.model: 'test2' model: 'a' attribute: 'aLoad' inferred methods conflicts with a method of 'test1' model"));
  describe("Sedentary.model() - conflict: method Vs parent.attribute", () =>
    errorHelper(db => {
      const test1 = db.model("test1", { a: db.Int() });
      db.model("test2", {}, { parent: test1 }, { a: () => {} });
    })("Sedentary.model: 'test2' model: 'a' method: conflicts with an attribute of 'test1' model"));
  describe("Sedentary.model() - conflict: method Vs parent.foreignKey", () =>
    errorHelper(db => {
      const test1 = db.model("test1", {});
      const test2 = db.model("test2", { a: db.FKey(test1) });
      db.model("test3", {}, { parent: test2 }, { aLoad: () => {} });
    })("Sedentary.model: 'test3' model: 'aLoad' method: conflicts with an inferred methods of 'test2' model"));
  describe("Sedentary.Int(size) - type", () => errorHelper(db => db.model("test", { test: db.Int({ size: "test" as never }) }))("Sedentary.Int: 'size' argument: Wrong value, expected 2 or 4"));
  describe("Sedentary.Int(size) - value 1", () => errorHelper(db => db.model("test", { test: db.Int({ size: 2.5 }) }))("Sedentary.Int: 'size' argument: Wrong value, expected 2 or 4"));
  describe("Sedentary.Int(size) - value 2", () => errorHelper(db => db.model("test", { test: db.Int({ size: 5 }) }))("Sedentary.Int: 'size' argument: Wrong value, expected 2 or 4"));
  describe("Sedentary.Float(size) - value", () => errorHelper(db => db.model("test", { test: db.Float({ size: 5 }) }))("Sedentary.Float: 'size' argument: Wrong value, expected 4 or 8"));
  describe("Sedentary.VarChar(size) - value", () =>
    errorHelper(db => db.model("test", { test: db.VarChar({ size: -5 }) }))("Sedentary.VarChar: 'size' argument: Wrong value, expected positive integer"));
  describe("Sedentary.FKey() - type", () =>
    errorHelper(db => {
      const test1 = db.model("test1", {});
      db.model("test2", { a: db.FKey(test1, 1 as never), aLoad: db.Int() });
    })("Sedentary.FKey: 'test2' model: 'a' attribute: Wrong options type, expected 'Object'"));
  describe("Sedentary.FKey() - option", () =>
    errorHelper(db => {
      const test1 = db.model("test1", {});
      db.model("test2", { a: db.FKey(test1, { test: 1 } as never), aLoad: db.Int() });
    })("Sedentary.FKey: 'test2' model: 'a' attribute: Unknown option 'test'"));
  describe("Sedentary.FKey(, { onDelete }) - value", () =>
    errorHelper(db => {
      const test1 = db.model("test1", {});
      db.model("test2", { a: db.FKey(test1, { onDelete: 1 } as never), aLoad: db.Int() });
    })("Sedentary.FKey: 'test2' model: 'a' attribute: 'onDelete' option: Wrong value, expected 'cascade' | 'no action' | 'restrict' | 'set default' | 'set null'"));
  describe("Sedentary.FKey(, { onUpdate }) - value", () =>
    errorHelper(db => {
      const test1 = db.model("test1", {});
      db.model("test2", { a: db.FKey(test1, { onUpdate: 1 } as never), aLoad: db.Int() });
    })("Sedentary.FKey: 'test2' model: 'a' attribute: 'onUpdate' option: Wrong value, expected 'cascade' | 'no action' | 'restrict' | 'set default' | 'set null'"));
  describe("Sedentary.load(where) - type 1", () =>
    errorHelper(async db => await db.model("test1", {}).load(0 as never))("test1.load: 'where' argument: Wrong type, expected 'Array', 'Object' or 'string'"));
  describe("Sedentary.load(where) - type2", () =>
    errorHelper(async db => await db.model("test1", { a: db.Int() }).load({ a: ["IN", "test"] } as never))("test1.load: 'where' argument: 'IN' right operand: Wrong type, expected Array"));
  describe("Sedentary.load(where) - value 1", () => errorHelper(async db => await db.model("test1", {}).load([] as never))("test1.load: 'where' argument: Empty Array"));
  describe("Sedentary.load(where) - value 2", () =>
    errorHelper(async db => await db.model("test1", {}).load(["test"] as never))("test1.load: 'where' argument: Wrong logical operator, expected 'AND', 'OR' or 'NOT'"));
  describe("Sedentary.load(where) - value 3", () =>
    errorHelper(async db => await db.model("test1", {}).load(["NOT", "test", "test"] as never))("test1.load: 'where' argument: 'NOT' operator is unary"));
  describe("Sedentary.load(where) - value 4", () => errorHelper(async db => await db.model("test1", {}).load({ test: null } as never))("test1.load: 'where' argument: Unknown 'test' attribute"));
  describe("Sedentary.load(where) - value 5", () =>
    errorHelper(async db => await db.model("test1", { a: db.Int() }).load({ a: [] } as never))(
      "test1.load: 'where' argument: Missing arithmetic operator, expected one of: '=', '>', '<', '>=', '<=', '<>', 'IN', 'IS NULL', 'LIKE', 'NOT'"
    ));
  describe("Sedentary.load(where) - value 6", () =>
    errorHelper(async db => await db.model("test1", { a: db.Int() }).load({ a: ["test"] } as never))(
      "test1.load: 'where' argument: Wrong arithmetic operator, expected one of: '=', '>', '<', '>=', '<=', '<>', 'IN', 'IS NULL', 'LIKE', 'NOT'"
    ));
  describe("Sedentary.load(where) - value 7", () =>
    errorHelper(async db => await db.model("test1", { a: db.Int() }).load({ a: ["IS NULL", "test"] } as never))("test1.load: 'where' argument: 'IS NULL' operator is unary"));
  describe("Sedentary.load(where) - value 8", () =>
    errorHelper(async db => await db.model("test1", { a: db.Int() }).load({ a: ["NOT", "test"] } as never))("test1.load: 'where' argument: 'NOT' operator is unary"));
  describe("Sedentary.load(where) - value 9", () =>
    errorHelper(async db => await db.model("test1", { a: db.Int() }).load({ a: ["=", "test", "test"] } as never))("test1.load: 'where' argument: '=' operator is binary"));
  describe("Sedentary.load(, order) - type 1", () =>
    errorHelper(async db => await db.model("test1", {}).load({}, {} as never))("test1.load: 'order' argument: Wrong type, expected 'string | string[]'"));
  describe("Sedentary.load(, order) - type 2", () =>
    errorHelper(async db => await db.model("test1", {}).load({}, [{}] as never))("test1.load: 'order' argument: Wrong type, expected 'string | string[]'"));
  describe("Sedentary.load(, order) - value 1", () =>
    errorHelper(async db => await db.model("test1", {}).load({}, ["test"] as never))("test1.load: 'order' argument: 'test' is not an attribute name"));
  describe("Sedentary.load(, order) - value 2", () =>
    errorHelper(async db => await db.model("test1", {}).load({}, ["-test"] as never))("test1.load: 'order' argument: 'test' is not an attribute name"));
  describe("Sedentary.load(, order) - value 3", () => errorHelper(async db => await db.model("test1", { a: db.Int() }).load({}, ["-a", "a"]))("test1.load: 'order' argument: Reused 'a' attribute"));
  describe("Sedentary.load(,, limit) - type", () =>
    errorHelper(async db => await db.model("test1", { a: db.Int() }).load({}, "a", "b" as never))("test1.load: 'limit' argument: Wrong type, expected 'number'"));
  describe("Sedentary.load(,,, tx) - type", () => errorHelper(async db => await db.model("test1", {}).load({}, 1, 1 as never))("test1.load: 'tx' argument: Wrong type, expected 'Transaction'"));
  describe("Sedentary.remove()", () => errorHelper(async db => await new (db.model("test1", { a: db.Int() }))().remove())("test1.remove: Can't remove a never saved Entry"));
});
