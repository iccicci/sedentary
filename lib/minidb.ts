/* eslint-disable @typescript-eslint/no-explicit-any */

import { DB, IndexDef, Table } from "./db";
import { promises } from "fs";

const { readFile, writeFile } = promises;

function indexName(idx: IndexDef): string {
  return `${idx.fields.reduce((t, c) => `${t}_${c}`)}_${idx.type}`;
}

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

    for(const constraint in constraints.u) {
      if(! table.constraints.filter(({ field, type }) => field === constraint && type === "u").length) {
        this.log(`'${table.tableName}': Removing unique constraint on field: '${constraint}'`);
        delete constraints.u[constraint];
      }
    }

    await this.save();
  }

  async dropFields(table: Table): Promise<void> {
    const { fields } = this.body.tables[table.tableName];

    for(const field in fields) {
      if(table.fields.filter(f => f.fieldName === field).length === 0) {
        this.log(`'${table.tableName}': Removing field: '${field}'`);
        delete fields[field];
      }
    }

    await this.save();
  }

  async dropIndexes(table: Table): Promise<void> {
    const names = table.indexes.map(indexName);
    const { indexes } = this.body.tables[table.tableName];

    for(const name in indexes) {
      if(names.indexOf(name) === -1) {
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

      if(! constraints[constraint.type][constraint.field]) {
        this.log(`'${table.tableName}': Adding unique constraint on field: '${constraint.field}'`);
        constraints[constraint.type][constraint.field] = true;
      }
    }

    await this.save();
  }

  async syncIndexes(table: Table): Promise<void> {
    const { indexes } = this.body.tables[table.tableName];

    for(const index of table.indexes) {
      const name = indexName(index);

      if(! (name in indexes)) {
        this.log(`'${table.tableName}': Adding index: '${name}'`);
        indexes[name] = index;
      }
    }

    await this.save();
  }

  async syncFields(table: Table): Promise<void> {
    for(const field of table.fields) {
      const { fields } = this.body.tables[table.tableName];
      const { defaultValue, fieldName, notNull, size, type } = field;
      let dbField = fields[fieldName];

      if(! dbField) {
        this.log(`'${table.tableName}': Adding field: '${fieldName}' '${type}' '${size || ""}'`);
        dbField = fields[fieldName] = { size, type };
      }

      if(dbField.size !== size || dbField.type !== type) {
        this.log(`'${table.tableName}': Changing field type: '${fieldName}' '${type}' '${size || ""}'`);
        dbField = fields[fieldName] = { ...dbField, size, type };
      }

      if(dbField.default) {
        if(! defaultValue) {
          this.log(`'${table.tableName}': Dropping default value for field: '${fieldName}'`);
          delete dbField.default;
        } else if(dbField.default !== defaultValue) {
          this.log(`'${table.tableName}': Changing default value to '${defaultValue}' for field: '${fieldName}'`);
          dbField.default = defaultValue;
        }
      } else if(defaultValue) {
        this.log(`'${table.tableName}': Setting default value '${defaultValue}' for field: '${fieldName}'`);
        dbField.default = defaultValue;
      }

      if(dbField.notNull) {
        if(! notNull) {
          this.log(`'${table.tableName}': Dropping not null for field: '${fieldName}'`);
          delete dbField.notNull;
        }
      } else if(notNull) {
        this.log(`'${table.tableName}': Setting not null for field: '${fieldName}'`);
        dbField.notNull = true;
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
      this.body.tables[table.tableName] = { constraints: { f: {}, u: {} }, fields: {}, indexes: {} };

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
