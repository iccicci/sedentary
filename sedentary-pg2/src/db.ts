/* eslint-disable @typescript-eslint/no-explicit-any */

import { promises } from "fs";

const { readFile } = promises;

export class DB {
  private body: any;
  private file: string;

  constructor(filename: string | null) {
    this.file = filename;
  }

  async connect(): Promise<void> {
    this.body = {};

    if(this.file !== "test.db") {
      try {
        this.body = (await readFile(this.file)).toJSON();
      } catch(e) {
        if(e.code !== "ENOENT") throw e;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async end(): Promise<void> {}
}
