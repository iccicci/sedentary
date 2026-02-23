/* eslint-disable @typescript-eslint/no-explicit-any */

import { promises } from "fs";

import { EntryBase } from "..";
import { Attribute, base, DB, loaded, size, Table, Transaction } from "../db";

const { readFile, writeFile } = promises;

function stringify(value: unknown) {
  return JSON.stringify(value, (key: string, value: unknown) => (typeof value === "bigint" ? `${value}n` : value));
}

class TestTransaction extends Transaction {
  commit() {
    this.preCommit();

    return super.commit();
  }
}

export class TestDB extends DB<TestTransaction> {
  private body: any;
  private file: string;

  constructor(filename: string, log: (message: string) => void) {
    super(log);

    this.file = filename;
  }

  begin() {
    return Promise.resolve(new TestTransaction(this.log));
  }

  cancel(tableName: string) {
    const results: Record<string, Record<string, number>> = { test1: { "": 3, "b = '1'": 1 } };

    return (where: string) => {
      this.log(`Cancel from ${tableName} where: "${where}"`);

      return Promise.resolve(results[tableName][where]);
    };
  }

  async connect() {
    this.body = { next: {}, tables: {} };

    try {
      this.body = JSON.parse((await readFile(this.file)).toString());
    } catch(error) {
      const err = error as NodeJS.ErrnoException;
      if(err.code !== "ENOENT") throw error;
    }
  }

  async end() {}

  async write() {
    await writeFile(this.file, stringify(this.body));
  }

  escape(value: unknown) {
    return typeof value === "number" ? value.toString() : `'${value}'`;
  }

  load(
    tableName: string,
    attributes: Record<string, string>,
    pk: Attribute<unknown, boolean, unknown>,
    model: new (from: "load") => EntryBase
  ): (where: string, order?: string | string[]) => Promise<EntryBase[]> {
    const longWhere = "(fixed) AND NOT (a = 23 AND b IS NULL AND NOT c AND d > 23 AND e IN (23, 42)) OR (fixed)";
    const results: Record<string, Record<string, Record<string, unknown>[]>> = {
      test1: {
        "": [
          { a: null, b: "test", id: 2 },
          { a: 23, b: "ok", id: 1 }
        ],
        "a <= 10":                 [{ a: 2, b: "2", id: 2 }],
        "a >= 23":                 [{ a: 23, b: { a: [1], v: "test" }, id: 1 }],
        "a IS NULL":               [{ a: null, b: "test", id: 2 }],
        "b = 'ok'":                [{ a: 23, b: "ok", id: 1 }],
        "b IN ('a', 'b', 'test')": [
          { a: 23, b: "test", id: 1 },
          { a: null, b: "test", id: 2 }
        ],
        "d = '23'": [{ a: 23, b: "ok", c: new Date("1976-01-23"), d: 23n, e: 2.3, f: true, g: { a: "b" }, id: 1 }],
        "id < 23":  [
          { a: 23, b: "ok", id: 1 },
          { a: null, b: "test", id: 2 }
        ],
        "id <> 23":  [{ a: 23, b: "ok", id: 1 }],
        [longWhere]: [{ a: 23, b: "ok", id: 1 }]
      },
      test2: {
        "": [
          { a: 1, b: "1", id: 1 },
          { a: 2, b: "2", id: 2 }
        ],
        "id > 0": [
          { a: 11, b: "11", id: 1 },
          { a: 3, b: "3", id: 3 }
        ]
      },
      test3: {
        "": [
          { a: 1, b: "1", id: 1 },
          { a: 2, b: "2", id: 2 }
        ],
        "id > 0": [{ a: 2, b: "2", id: 2 }]
      }
    };

    return (where: string, order?: string | string[], limit?: number, tx?: Transaction) => {
      this.log(`Load from ${tableName} where: "${where}"${order ? ` order by: ${(typeof order === "string" ? [order] : order).join(", ")}` : ""}`);

      return Promise.resolve(
        results[tableName][where].map(_ => {
          const ret = new model("load");

          Object.assign(ret, _);
          Object.defineProperty(ret, loaded, { configurable: true, value: true });
          if(tx) tx.addEntry(ret);
          ret.postLoad();

          return ret;
        })
      );
    };
  }

  remove(tableName: string): (this: EntryBase & Record<string, unknown>) => Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    let value = 1;

    return function() {
      const ret = value;

      self.log(`Delete from ${tableName} ${this.id}`);
      value = 0;

      return Promise.resolve(ret);
    };
  }

  save(tableName: string): (this: Record<string, unknown>) => Promise<number | false> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const saves: [number | false, Record<string, unknown>][] = [
      [1, { a: 23, b: "ok", id: 1 }],
      [1, { a: null, b: "test", id: 2 }],
      [1, { a: 23, b: "test", id: 1 }],
      [false, { a: 23, b: "test", id: 1 }]
    ];
    const saves2: Record<string, [number | false, Record<string, unknown>]> = {
      '{"a":1,"b":"1"}':                            [1, { a: 1, b: "1" }],
      '{"a":2,"b":"2"}':                            [1, { a: 2, b: "2" }],
      '{"a":23,"b":{"a":[1,2],"v":"test"},"id":1}': [1, { a: 23, b: { a: [1, 2], v: "test" }, id: 1 }],
      '{"a":3,"b":"3"}':                            [1, { a: 3, b: "3", id: 3 }]
    };

    const getSaves2 = (obj: unknown) => {
      try {
        //console.log(JSON.stringify(obj), saves2[JSON.stringify(obj)]);
        return saves2[JSON.stringify(obj)];
      } catch(error) {
        return false;
      }
    };

    return function() {
      self.log(`Save to ${tableName} ${stringify(this)}`);

      const [changed, obj] = getSaves2(this) || saves.shift() || [false, {}];

      Object.assign(this, obj);

      return Promise.resolve(changed);
    };
  }

  async dropConstraints(table: Table) {
    const { constraints } = this.body.tables[table.tableName] || { constraints: { f: {}, u: {} } };

    for(const constraint of Object.keys(constraints.f).sort()) {
      const arr = table.constraints.filter(({ constraintName, type }) => constraintName === constraint && type === "f") as { attribute: { foreignKey: { options: any } } }[];
      const dbOptions = arr.length ? arr[0].attribute.foreignKey.options : { onDelete: "delete", onUpdate: "delete" };
      const inOptions = constraints.f[constraint].options;

      if(dbOptions.onDelete !== inOptions.onDelete || dbOptions.onUpdate !== inOptions.onUpdate) {
        this.syncLog(`'${table.tableName}': Removing foreign key: '${constraint}'`);
        if(this.sync) delete constraints.f[constraint];
      }
    }

    for(const constraint of Object.keys(constraints.u).sort()) {
      if(! table.constraints.some(({ constraintName, type }) => constraintName === constraint && type === "u")) {
        this.syncLog(`'${table.tableName}': Removing unique constraint from field: '${constraints.u[constraint].on}'`);
        if(this.sync) delete constraints.u[constraint];
      }
    }

    await this.write();

    return [];
  }

  async dropFields(table: Table) {
    const { fields } = this.body.tables[table.tableName] || { fields: {} };

    for(const attribute of Object.keys(fields).sort()) {
      const field = table.findField(attribute);

      if(! field?.[base]) {
        this.syncLog(`'${table.tableName}': Removing field: '${attribute}'`);
        if(this.sync) delete fields[attribute];
      }
    }

    await this.write();
  }

  async dropIndexes(table: Table) {
    const { indexes } = this.body.tables[table.tableName] || { indexes: {} };

    for(const name of Object.keys(indexes).sort()) {
      const index = table.indexes.filter(_ => _.indexName === name);

      if(index.length === 0 || ! this.indexesEq(indexes[name], index[0])) {
        this.syncLog(`'${table.tableName}': Removing index: '${name}'`);
        if(this.sync) delete indexes[name];
      }
    }

    await this.write();
  }

  async syncConstraints(table: Table) {
    const { constraints } = this.body.tables[table.tableName] || { constraints: { f: {}, u: {} } };

    for(const constraint of table.constraints) {
      const { attribute, constraintName, type } = constraint;

      if(! constraints[type][constraintName]) {
        if(type === "f") {
          const { fieldName, options, tableName } = attribute.foreignKey as { attributeName: string; fieldName: string; options: any; tableName: string };
          const onDelete = options.onDelete !== "no action" ? ` on delete ${options.onDelete}` : "";
          const onUpdate = options.onUpdate !== "no action" ? ` on update ${options.onUpdate}` : "";

          this.syncLog(`'${table.tableName}': Adding foreign key '${constraint.constraintName}' on field: '${attribute.fieldName}' references '${tableName}(${fieldName})'${onDelete}${onUpdate}`);
          if(this.sync) constraints[type][constraintName] = { fieldName, on: attribute.fieldName, options, tableName };
        } else {
          this.syncLog(`'${table.tableName}': Adding unique constraint on field: '${attribute.fieldName}'`);
          if(this.sync) constraints[type][constraintName] = { on: attribute.fieldName };
        }
      }
    }

    await this.write();
  }

  async syncIndexes(table: Table) {
    const { indexes } = this.body.tables[table.tableName] || { indexes: {} };

    for(const index of table.indexes) {
      const { indexName } = index;

      if(! (indexName in indexes)) {
        this.syncLog(`'${table.tableName}': Adding index: '${indexName}' on (${index.fields.map(_ => `'${_}'`).join(", ")}) type '${index.type}'${index.unique ? " unique" : ""}`);
        if(this.sync) indexes[indexName] = index;
      }
    }

    await this.write();
  }

  async syncFields(table: Table) {
    for(const attribute of table.attributes) {
      const { fields } = this.body.tables[table.tableName] || { fields: {} };
      const { defaultValue, fieldName, notNull, [size]: _size, type } = attribute;
      let field = fields[fieldName];

      if(! field && type === "NONE") continue;

      if(! field) {
        this.syncLog(`'${table.tableName}': Adding field: '${fieldName}' '${type}' '${_size || ""}'`);
        if(this.sync) field = fields[fieldName] = { _size, type };
        else field = {};
      }

      if(field._size !== _size || field.type !== type) {
        this.syncLog(`'${table.tableName}': Changing field type: '${fieldName}' '${type}' '${_size || ""}'`);
        if(this.sync) field = fields[fieldName] = { ...field, _size, type };
      }

      if(field.default) {
        if(! defaultValue) {
          this.syncLog(`'${table.tableName}': Dropping default value for field: '${fieldName}'`);
          if(this.sync) delete field.default;
        } else if(field.default !== (defaultValue instanceof Date ? defaultValue.toISOString() : defaultValue)) {
          this.syncLog(`'${table.tableName}': Changing default value to '${defaultValue}' for field: '${fieldName}'`);
          if(this.sync) field.default = defaultValue;
        }
      } else if(defaultValue) {
        this.syncLog(`'${table.tableName}': Setting default value '${defaultValue instanceof Date ? defaultValue.toISOString() : defaultValue}' for field: '${fieldName}'`);
        if(this.sync) field.default = defaultValue;
      }

      if(field.notNull) {
        if(! notNull) {
          this.syncLog(`'${table.tableName}': Dropping not null for field: '${fieldName}'`);
          if(this.sync) delete field.notNull;
        }
      } else if(notNull) {
        this.syncLog(`'${table.tableName}': Setting not null for field: '${fieldName}'`);
        if(this.sync) field.notNull = true;
      }
    }

    await this.write();
  }

  async syncSequence() {}

  async syncTable(table: Table) {
    if(this.body.tables[table.tableName]) {
      (() => {
        if(table.parent) {
          if(this.body.tables[table.tableName].parent === table.parent.tableName) return;
        } else if(! this.body.tables[table.tableName].parent) return;

        this.syncLog(`Removing table: '${table.tableName}'`);
        if(this.sync) delete this.body.tables[table.tableName];
      })();
    }

    if(! this.body.tables[table.tableName]) {
      this.syncLog(`Adding table: '${table.tableName}'`);
      if(this.sync) this.body.tables[table.tableName] = { constraints: { f: {}, u: {} }, fields: {}, indexes: {}, records: [] };

      if(table.parent) {
        this.syncLog(`Setting parent: '${table.parent.tableName}' - to table: '${table.tableName}'`);
        if(this.sync) this.body.tables[table.tableName].parent = table.parent.tableName;
      }

      if(table.autoIncrement && ! this.body.next[table.tableName]) {
        this.syncLog(`Setting auto increment: '${table.tableName}'`);
        if(this.sync) this.body.tables[table.tableName].autoIncrement = 1;
      }
    }

    await this.write();
  }
}
