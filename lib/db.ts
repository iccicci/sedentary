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
  methods: { [key: string]: () => unknown };
  primaryKey: string;
  tableName: string;

  constructor(tableName: string, primaryKey: string, init: () => void, methods: { [key: string]: () => unknown }) {
    super({ size: 0, type: "" });
    this.primaryKey = primaryKey;
    this.tableName = tableName;
    this.init = init;
    this.methods = methods;
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
  oid?: number;
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
  tablesArr: Table[] = [];

  protected log: (message: string) => void;

  abstract async connect(): Promise<void>;
  abstract async end(): Promise<void>;

  constructor(log: (message: string) => void) {
    this.log = log;
  }

  addTable(table: Table): void {
    this.tables[table.tableName] = table;
    this.tablesArr.push(table);
  }

  async sync(): Promise<void> {
    for(const i in this.tablesArr) await this.syncTable(this.tablesArr[i]);
  }

  abstract async syncTable(table: Table): Promise<void>;
}
