export type native = number | string | Date;

export class Record {
  id?: number;

  init(): void {}

  async save(): Promise<boolean> {
    return false;
  }
}

export class Type<N extends native, R extends unknown> {
  native?: N;
  record?: R;
  size: number;
  type: string;

  constructor(from: Partial<Type<native, unknown>>) {
    Object.assign(this, from);
  }
}

export class Meta<N extends native, R extends Record> extends Type<N, R> {
  init: () => void;
  primaryKey: string;
  tableName: string;

  constructor(primaryKey: string, init: () => void) {
    super({ size: 0, type: "" });
    this.primaryKey = primaryKey;
    this.init = init;
  }
}

function autoImplement<T>() {
  return class {
    constructor(defaults?: T) {
      Object.assign(this, defaults || {});
    }
  } as new (defaults?: T) => T;
}

interface ITable {
  parent: Meta<native, Record>;
  primaryKey: string;
  sync: boolean;
  tableName: string;
}

export class Table extends autoImplement<ITable>() {
  autoIncrement: boolean;

  constructor(defaults: ITable) {
    super(defaults);

    if(! this.primaryKey) {
      if(this.parent) this.primaryKey = this.parent.primaryKey;
      else {
        this.primaryKey = "id";
        this.autoIncrement = true;
      }
    }
  }
}

export abstract class DB {
  tables: { [key: string]: Table } = {};

  protected log: (message: string) => void;

  abstract async connect(): Promise<void>;
  abstract async end(): Promise<void>;

  constructor(log: (message: string) => void) {
    this.log = log;
  }

  async sync(): Promise<void> {
    for(const table in this.tables) await this.syncTable(this.tables[table]);
  }

  abstract async syncTable(table: Table): Promise<void>;
}
