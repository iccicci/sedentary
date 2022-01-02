/* eslint-disable @typescript-eslint/no-explicit-any */

import { Attribute, DB, Natural, Table } from "../db";
import { promises } from "fs";

const { readFile, writeFile } = promises;

export class TestDB extends DB {
  private body: any;
  private file: string;

  constructor(filename: string, log: (message: string) => void) {
    super(log);

    this.file = filename;
  }

  async connect(): Promise<void> {
    this.body = { next: {}, tables: {} };

    try {
      this.body = JSON.parse((await readFile(this.file)).toString());
    } catch(e) {
      const err = e as NodeJS.ErrnoException;
      if(err.code !== "ENOENT") throw e;
    }
  }

  async end(): Promise<void> {}

  async write(): Promise<void> {
    await writeFile(this.file, JSON.stringify(this.body));
  }

  escape(value: Natural): string {
    return typeof value === "string" ? value : value.toString();
  }

  save(tableName: string, attributes: Attribute<Natural, unknown>[]): (this: Record<string, unknown>) => Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    return async function() {
      if(! this.loaded) {
        self.log(`Insert into ${tableName} ${JSON.stringify(this)}`);

        const table = self.body.tables[tableName];

        for(const attribute of attributes) if(! (attribute.attributeName in this)) this[attribute.attributeName] = attribute.defaultValue || null;

        if(table.autoIncrement) this.id = table.autoIncrement++;
        table.records.push(this);

        await self.write();

        return true;
      }

      let changed = false;
      const { loaded } = this as { loaded: Record<string, unknown> };

      for(const key in this) {
        if(typeof this[key] === "object") {
          if(JSON.stringify(this[key]) !== JSON.stringify(loaded[key])) changed = true;
        } else if(this[key] !== loaded[key]) changed = true;
      }

      return Promise.resolve(changed);
    };
  }

  async dropConstraints(table: Table): Promise<number[]> {
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
      if(! table.constraints.filter(({ constraintName, type }) => constraintName === constraint && type === "u").length) {
        this.syncLog(`'${table.tableName}': Removing unique constraint from field: '${constraints.u[constraint].on}'`);
        if(this.sync) delete constraints.u[constraint];
      }
    }

    await this.write();

    return [];
  }

  async dropFields(table: Table): Promise<void> {
    const { fields } = this.body.tables[table.tableName] || { fields: {} };

    for(const attribute of Object.keys(fields).sort()) {
      if(! table.findField(attribute)) {
        this.syncLog(`'${table.tableName}': Removing field: '${attribute}'`);
        if(this.sync) delete fields[attribute];
      }
    }

    await this.write();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async dropIndexes(table: Table, constraintIndexes: number[]): Promise<void> {
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

  async syncConstraints(table: Table): Promise<void> {
    const { constraints } = this.body.tables[table.tableName] || { constraints: { f: {}, u: {} } };

    for(const constraint of table.constraints) {
      const { attribute, constraintName, type } = constraint;

      if(! constraints[type][constraintName]) {
        if(type === "f") {
          const { fieldName, options, tableName } = attribute.foreignKey as { attributeName: string; fieldName: string; options: any; tableName: string };
          const onDelete = options.onDelete !== "no action" ? ` on delete ${options.onDelete}` : "";
          const onUpdate = options.onUpdate !== "no action" ? ` on update ${options.onUpdate}` : "";

          this.syncLog(`'${table.tableName}': Adding foreign key '${constraint.constraintName}' on field: '${attribute.fieldName}' references '${tableName}(${fieldName})'${onDelete}${onUpdate}`);
          if(this.sync) constraints[type][constraintName] = { on: attribute.fieldName, options, fieldName, tableName };
        } else {
          this.syncLog(`'${table.tableName}': Adding unique constraint on field: '${attribute.fieldName}'`);
          if(this.sync) constraints[type][constraintName] = { on: attribute.fieldName };
        }
      }
    }

    await this.write();
  }

  async syncIndexes(table: Table): Promise<void> {
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

  async syncFields(table: Table): Promise<void> {
    for(const attribute of table.attributes) {
      const { fields } = this.body.tables[table.tableName] || { fields: {} };
      const { defaultValue, fieldName, notNull, size, type } = attribute;
      let field = fields[fieldName];

      if(! field) {
        this.syncLog(`'${table.tableName}': Adding field: '${fieldName}' '${type}' '${size || ""}'`);
        if(this.sync) field = fields[fieldName] = { size, type };
        else field = {};
      }

      if(field.size !== size || field.type !== type) {
        this.syncLog(`'${table.tableName}': Changing field type: '${fieldName}' '${type}' '${size || ""}'`);
        if(this.sync) field = fields[fieldName] = { ...field, size, type };
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async syncSequence(table: Table): Promise<void> {}

  async syncTable(table: Table): Promise<void> {
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