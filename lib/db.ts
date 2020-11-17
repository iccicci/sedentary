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

interface IMeta {
  init: () => void;
  methods: { [key: string]: () => unknown };
  primaryKey: string;
  tableName: string;
}

export class Meta<N extends native, R extends Record> extends Type<N, R> {
  init: () => void;
  methods: { [key: string]: () => unknown };
  primaryKey: string;
  tableName: string;

  constructor(options: IMeta) {
    super({ size: 0, type: "" });

    for(const key in options) this[key] = options[key];
  }

  isModel(): boolean {
    return true;
  }
}

export class Field<N extends native, R extends unknown> extends Type<N, R> {
  defaultValue?: string;
  fieldName?: string;
  notNull?: boolean;
  unique?: boolean;

  constructor(from: Partial<Field<N, R>>) {
    super(from);
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
  fields: Field<native, unknown>[];
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
    for(const i in this.tablesArr) {
      const table = this.tablesArr[i];

      await this.syncTable(table);
      await this.dropConstraints(table);
      await this.dropIndexes(table);
      await this.dropFields(table);

      for(const l in table.fields) await this.syncField(table, table.fields[l]);
    }
  }

  abstract async dropConstraints(table: Table): Promise<void>;
  abstract async dropFields(table: Table): Promise<void>;
  abstract async dropIndexes(table: Table): Promise<void>;
  abstract async syncField(table: Table, field: Field<native, unknown>): Promise<void>;
  abstract async syncTable(table: Table): Promise<void>;
}
