import { DB } from "./db";

export type native = number | string | Date;

export class Record {
  id?: number;

  init(): void {}

  async save(): Promise<boolean> {
    return false;
  }
}

export class Field<N extends native, R extends unknown> {
  native?: N;
  record?: R;
}

class Table {}

export class Sync {
  private tables: Table[];

  protected db: DB;
}
