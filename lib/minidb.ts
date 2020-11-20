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

  async dropIndexes(table: Table): Promise<void> {}

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

  async syncFields(table: Table): Promise<void> {
    for(const i in table.fields) {
      const field = table.fields[i];
      const { fields } = this.body.tables[table.tableName];
      const { size, type } = field;

      if(! fields[field.fieldName]) {
        this.log(`'${table.tableName}': Adding field: '${field.fieldName}' '${type}' '${size}'`);
        fields[field.fieldName] = { size, type };
      }
    }

    await this.save();
  }

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
      this.body.tables[table.tableName] = { constraints: { f: {}, u: {} }, fields: {} };

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
