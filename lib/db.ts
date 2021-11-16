export type Natural = Date | Record<string, unknown> | boolean | number | string;

export class Entry {
  init(): void {}

  async save(): Promise<boolean> {
    return false;
  }
}

export class Type<N extends Natural, E> {
  base: unknown;
  entry?: E;
  native?: N;
  size?: number;
  type: string;

  constructor(from: Type<N, E>) {
    Object.assign(this, from);
  }
}

export class Meta<N extends Natural, E> extends Type<N, E> {
  init: () => void;
  isModel?: () => boolean;
  methods: { [key: string]: () => unknown };
  primaryKey: string;
  tableName: string;

  constructor(from: Meta<N, E>) {
    super(from);
  }
}

export class Attribute<N extends Natural, E> extends Type<N, E> {
  attributeName: string;
  defaultValue?: unknown;
  fieldName: string;
  notNull: boolean;
  tableName: string;
  unique?: boolean;

  constructor(from: Attribute<N, E>) {
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
  attribute: string;
  constraintName: string;
  type: "f" | "u";
}

export interface Index {
  attributes: string[];
  indexName: string;
  type: "btree" | "hash";
  unique: boolean;
}

interface ITable {
  attributes: Attribute<Natural, unknown>[];
  constraints: Constraint[];
  indexes: Index[];
  oid?: number;
  parent: Meta<Natural, unknown>;
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

  protected indexesEq(a: Index, b: Index): boolean {
    if(a.attributes.length !== b.attributes.length) return false;
    for(const i in a.attributes) if(a.attributes[i] !== b.attributes[i]) return false;
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
