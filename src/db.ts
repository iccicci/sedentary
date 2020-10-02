/* eslint-disable @typescript-eslint/no-explicit-any */

import { promises } from "fs";

const { readFile } = promises;

export class DB {
  private body: any;
  private file: string;
  private tables: any;

  constructor(filename: string) {
    this.file = filename;
  }

  async connect(): Promise<void> {
    this.body = { tables: {} };

    if(this.file !== "test.db") {
      try {
        this.body = (await readFile(this.file)).toJSON();
      } catch(e) {
        if(e.code !== "ENOENT") throw e;
      }
    }

    this.tables = this.body.tables;
  }

  async end(): Promise<void> {}
}
