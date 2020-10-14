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

  async end(): Promise<void> {}

  async save(): Promise<void> {
    await writeFile(this.file, JSON.stringify(this.body));
  }

  async syncTable(table: Table): Promise<void> {
    if(! this.body.tables[table.tableName]) {
      this.log("Adding table: " + table.tableName);
      this.body.tables[table.tableName] = {};

      if(table.autoIncrement && ! this.body.next[table.tableName]) {
        this.log("Setting auto increment: " + table.tableName);
        this.body.next[table.tableName] = 1;
      }
    }

    await this.save();
  }
}
