export type Natural = Date | Record<string, unknown> | boolean | number | string;

export class Entry {
  init(): void {}

  async save(): Promise<boolean> {
    return false;
  }
}

export class Type<N extends Natural, E extends Entry> {
  base: unknown;
  native?: N;
  record?: E;
  size?: number;
  type: string;

  constructor(from: Partial<Type<N, Entry>>) {
    Object.assign(this, from);
  }
}

interface IMeta {
  init: () => void;
  methods: { [key: string]: () => unknown };
  primaryKey: string;
  tableName: string;
}

export class Meta<N extends Natural, E extends Entry> extends Type<N, E> {
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

export class Field<N extends Natural, E extends Entry> extends Type<N, E> {
  defaultValue?: unknown;
  fieldName?: string;
  notNull?: boolean;
  unique?: boolean;

  constructor(from: Partial<Field<N, E>>) {
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

export type IndexFields = string[] | string;

export interface IndexDef {
  fields: string[];
  name: string;
  type: "btree" | "hash";
  unique: boolean;
}

interface IndexOptions {
  fields: IndexFields;
  type?: "btree" | "hash";
  unique?: boolean;
}

export type Index = IndexFields | IndexOptions;

interface ITable {
  constraints: Constraint[];
  fields: Field<Natural, Entry>[];
  indexes: IndexDef[];
  oid?: number;
  parent: Meta<Natural, Entry>;
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

  protected log: (...data: unknown[]) => void;

  abstract connect(): Promise<void>;
  abstract end(): Promise<void>;

  constructor(log: (message: string) => void) {
    this.log = log;
  }

  addTable(table: Table): void {
    this.tables[table.tableName] = table;
    this.tablesArr.push(table);
  }

  protected indexesEq(a: IndexDef, b: IndexDef): boolean {
    if(a.fields.length !== b.fields.length) return false;
    for(const i in a.fields) if(a.fields[i] !== b.fields[i]) return false;
    if(a.type !== b.type) return false;
    if(a.unique !== b.unique) return false;

    return true;
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
      await this.syncIndexes(table);
    }
  }

  abstract dropConstraints(table: Table): Promise<void>;
  abstract dropFields(table: Table): Promise<void>;
  abstract dropIndexes(table: Table): Promise<void>;
  abstract syncConstraints(table: Table): Promise<void>;
  abstract syncFields(table: Table): Promise<void>;
  abstract syncIndexes(table: Table): Promise<void>;
  abstract syncSequence(table: Table): Promise<void>;
  abstract syncTable(table: Table): Promise<void>;
}
