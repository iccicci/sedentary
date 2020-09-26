/* eslint-disable @typescript-eslint/no-explicit-any */

import { promises } from "fs";

const { readFile } = promises;

export class DB {
  private body: any;
  private file: string;

  constructor(filename: string | null) {
    this.file = filename;
  }

  async connect(done: (err?: Error) => void): Promise<void> {
    try {
      this.body = {};

      if(this.file !== "test.db") {
        try {
          this.body = (await readFile(this.file)).toJSON();
        } catch(e) {
          if(e.code !== "ENOENT") throw e;
        }
      }
    } catch(err) {
      return done(err);
    }

    done();
  }

  async end(done: (err?: Error) => void): Promise<void> {
    done();
  }
}
