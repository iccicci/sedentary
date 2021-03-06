export class Record {
  init(): void {}

  async save(): Promise<boolean> {
    return false;
  }
}

export class Type<N extends unknown, R extends unknown> {
  base: unknown;
  native?: N;
  record?: R;
  size?: number;
  type: string;

  constructor(from: Partial<Type<unknown, unknown>>) {
    Object.assign(this, from);
  }
}

interface IMeta {
  init: () => void;
  methods: { [key: string]: () => unknown };
  primaryKey: string;
  tableName: string;
}

export class Meta<N extends unknown, R extends Record> extends Type<N, R> {
  init: () => void;
  methods: { [key: string]: () => unknown };
  primaryKey: string;
  tableName: string;

  constructor(options: IMeta) {
    super({ size: 0, type: "" });
    Object.assign(this, options);
  }

  isModel(): boolean {
    return true;
  }
}

export class Field<N extends unknown, R extends unknown> extends Type<N, R> {
  defaultValue?: unknown;
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

export interface Constraint {
  field: string;
  name: string;
  type: "f" | "u";
}

interface ITable {
  constraints: Constraint[];
  fields: Field<unknown, unknown>[];
  oid?: number;
  parent: Meta<unknown, Record>;
  primaryKey: string;
  sync: boolean;
  tableName: string;
}

export class Table extends autoImplement<ITable>() {
  autoIncrement: boolean;
  autoIncrementOwn: boolean;

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

  abstract connect(): Promise<void>;
  abstract end(): Promise<void>;

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
      await this.syncFields(table);
      await this.syncSequence(table);
      await this.syncConstraints(table);
    }
  }

  abstract dropConstraints(table: Table): Promise<void>;
  abstract dropFields(table: Table): Promise<void>;
  abstract dropIndexes(table: Table): Promise<void>;
  abstract syncConstraints(table: Table): Promise<void>;
  abstract syncFields(table: Table): Promise<void>;
  abstract syncSequence(table: Table): Promise<void>;
  abstract syncTable(table: Table): Promise<void>;
}
