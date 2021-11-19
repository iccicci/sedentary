/* eslint-disable @typescript-eslint/no-explicit-any */

import { DB, Table } from "./db";
import { promises } from "fs";

const { readFile, writeFile } = promises;

export class MiniDB extends DB {
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
      if(e.code !== "ENOENT") throw e;
    }
  }

  async dropConstraints(table: Table): Promise<void> {
    const { constraints } = this.body.tables[table.tableName];

    for(const constraint in constraints.f) {
      if(! table.constraints.filter(({ constraintName, type }) => constraintName === constraint && type === "f").length) {
        this.log(`'${table.tableName}': Removing foreign key: '${constraint}'`);
        delete constraints.f[constraint];
      }
    }

    await this.save();
  }

  async dropFields(table: Table): Promise<void> {
    const { fields } = this.body.tables[table.tableName];

    for(const attribute in fields) {
      if(table.attributes.filter(f => f.fieldName === attribute).length === 0) {
        this.log(`'${table.tableName}': Removing field: '${attribute}'`);
        delete fields[attribute];
      }
    }

    await this.save();
  }

  async dropIndexes(table: Table): Promise<void> {
    const { indexes } = this.body.tables[table.tableName];

    for(const name in indexes) {
      const index = table.indexes.filter(_ => _.indexName === name);

      if(index.length === 0 || ! this.indexesEq(indexes[name], index[0])) {
        this.log(`'${table.tableName}': Removing index: '${name}'`);
        delete indexes[name];
      }
    }

    await this.save();
  }

  async end(): Promise<void> {}

  async save(): Promise<void> {
    await writeFile(this.file, JSON.stringify(this.body));
  }

  async syncConstraints(table: Table): Promise<void> {
    const { constraints } = this.body.tables[table.tableName];

    for(const i in table.constraints) {
      const constraint = table.constraints[i];
      const { constraintName, type } = constraint;
      const { fieldName, foreignKey } = constraint.attribute;

      if(! constraints[type][constraintName]) {
        this.log(`'${table.tableName}': Adding foreign key '${constraint.constraintName}' on field: '${fieldName}' references '${foreignKey.tableName}(${foreignKey.fieldName})'`);
        constraints[type][constraintName] = { fieldName, toField: foreignKey.fieldName, toTable: foreignKey.tableName };
      }
    }

    await this.save();
  }

  async syncIndexes(table: Table): Promise<void> {
    const { indexes } = this.body.tables[table.tableName];

    for(const index of table.indexes) {
      const { indexName } = index;

      if(! (indexName in indexes)) {
        this.log(`'${table.tableName}': Adding index: '${indexName}' on (${index.fields.map(_ => `'${_}'`).join(", ")}) type '${index.type}'${index.unique ? " unique" : ""}`);
        indexes[indexName] = index;
      }
    }

    await this.save();
  }

  async syncFields(table: Table): Promise<void> {
    for(const attribute of table.attributes) {
      const { fields } = this.body.tables[table.tableName];
      const { defaultValue, fieldName, notNull, size, type } = attribute;
      let field = fields[fieldName];

      if(! field) {
        this.log(`'${table.tableName}': Adding field: '${fieldName}' '${type}' '${size || ""}'`);
        field = fields[fieldName] = { size, type };
      }

      if(field.size !== size || field.type !== type) {
        this.log(`'${table.tableName}': Changing field type: '${fieldName}' '${type}' '${size || ""}'`);
        field = fields[fieldName] = { ...field, size, type };
      }

      if(field.default) {
        if(! defaultValue) {
          this.log(`'${table.tableName}': Dropping default value for field: '${fieldName}'`);
          delete field.default;
        } else if(field.default !== defaultValue) {
          this.log(`'${table.tableName}': Changing default value to '${defaultValue}' for field: '${fieldName}'`);
          field.default = defaultValue;
        }
      } else if(defaultValue) {
        this.log(`'${table.tableName}': Setting default value '${defaultValue instanceof Date ? defaultValue.toISOString() : defaultValue}' for field: '${fieldName}'`);
        field.default = defaultValue;
      }

      if(field.notNull) {
        if(! notNull) {
          this.log(`'${table.tableName}': Dropping not null for field: '${fieldName}'`);
          delete field.notNull;
        }
      } else if(notNull) {
        this.log(`'${table.tableName}': Setting not null for field: '${fieldName}'`);
        field.notNull = true;
      }
    }

    await this.save();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async syncSequence(table: Table): Promise<void> {}

  async syncTable(table: Table): Promise<void> {
    if(this.body.tables[table.tableName]) {
      (() => {
        if(table.parent) {
          if(this.body.tables[table.tableName].parent === table.parent.tableName) return;
        } else if(! this.body.tables[table.tableName].parent) return;

        this.log(`Removing table: '${table.tableName}'`);
        delete this.body.tables[table.tableName];
      })();
    }

    if(! this.body.tables[table.tableName]) {
      this.log(`Adding table: '${table.tableName}'`);
      this.body.tables[table.tableName] = { constraints: { f: {} }, fields: {}, indexes: {} };

      if(table.parent) {
        this.log(`Setting parent: '${table.parent.tableName}' - to table: '${table.tableName}'`);
        this.body.tables[table.tableName].parent = table.parent.tableName;
      }

      if(table.autoIncrement && ! this.body.next[table.tableName]) {
        this.log(`Setting auto increment: '${table.tableName}'`);
        this.body.next[table.tableName] = 1;
      }
    }

    await this.save();
  }
}
