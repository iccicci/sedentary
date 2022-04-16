export type Natural = BigInt | Date | Record<string, unknown> | boolean | number | string | null;

export class EntryBase {
  constructor(from?: Partial<EntryBase>) {
    if(from === "load") this.preLoad();
    else {
      if(from) Object.assign(this, from);
      this.construct();
    }
  }

  construct() {}
  postLoad() {}
  postRemove() {}
  postSave() {}
  preLoad() {}
  preRemove() {}
  preSave() {}

  async remove(): Promise<boolean> {
    return false;
  }

  async save(): Promise<boolean> {
    return false;
  }
}

export type ForeignKeyActions = "cascade" | "no action" | "restrict" | "set default" | "set null";

export interface ForeignKeyOptions {
  onDelete?: ForeignKeyActions;
  onUpdate?: ForeignKeyActions;
}

export interface Type<N extends Natural, E> {
  base: unknown;
  entry?: E;
  native?: N;
  size?: number;
  type: string;
  foreignKey?: {
    attributeName: string;
    fieldName: string;
    options?: ForeignKeyOptions;
    tableName: string;
  };
}

export class Type<N extends Natural, E> {
  constructor(from: Type<N, E>) {
    Object.assign(this, from);
  }
}

export interface Attribute<N extends Natural, E> extends Type<N, E> {
  attributeName: string;
  defaultValue?: Natural;
  fieldName: string;
  modelName: string;
  notNull: boolean;
  tableName: string;
  unique?: boolean;
}

export class Attribute<N extends Natural, E> extends Type<N, E> {
  constructor(from: Attribute<N, E>) {
    super(from);
  }
}

function autoImplement<T>() {
  return class {
    constructor(defaults?: T) {
      Object.assign(this, defaults);
    }
  } as new (defaults?: T) => T;
}

export interface Constraint {
  attribute: Attribute<Natural, unknown>;
  constraintName: string;
  type: "f" | "u";
}

export interface Index {
  fields: string[];
  indexName: string;
  type: "btree" | "hash";
  unique: boolean;
}

interface ITable {
  attributes: Attribute<Natural, unknown>[];
  autoIncrement: boolean;
  constraints: Constraint[];
  indexes: Index[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: { load: (where: any, order?: string[], tx?: Transaction) => Promise<EntryBase[]> };
  parent?: Attribute<Natural, unknown>;
  pk: Attribute<Natural, unknown>;
  sync: boolean;
  tableName: string;
}

export class Table extends autoImplement<ITable>() {
  autoIncrementOwn?: boolean;
  oid?: number;

  findField(name: string): Attribute<Natural, unknown> {
    return this.attributes.filter(_ => _.fieldName === name)[0];
  }
}

export abstract class DB<T extends Transaction> {
  tables: Table[] = [];

  protected log: (message: string) => void;
  protected sync = true;

  abstract connect(): Promise<void>;
  abstract end(): Promise<void>;

  constructor(log: (message: string) => void) {
    this.log = log;
  }

  findTable(name: string): Table {
    return this.tables.filter(_ => _.tableName === name)[0];
  }

  protected indexesEq(a: Index, b: Index): boolean {
    if(a.fields.length !== b.fields.length) return false;
    for(const i in a.fields) if(a.fields[i] !== b.fields[i]) return false;
    if(a.type !== b.type) return false;
    if(a.unique !== b.unique) return false;

    return true;
  }

  async syncDataBase(): Promise<void> {
    for(const table of this.tables) {
      this.sync = table.sync;

      await this.syncTable(table);
      const indexes = await this.dropConstraints(table);
      await this.dropIndexes(table, indexes);
      await this.dropFields(table);
      await this.syncFields(table);
      await this.syncSequence(table);
      await this.syncConstraints(table);
      await this.syncIndexes(table);
    }
  }

  protected syncLog(message: string): void {
    this.log(this.sync ? message : "NOT SYNCING: " + message);
  }

  abstract begin(): Promise<T>;

  abstract escape(value: Natural): string;
  abstract load(
    tableName: string,
    attributes: Record<string, string>,
    pk: Attribute<Natural, unknown>,
    model: new () => EntryBase,
    table: Table
  ): (where: string, order?: string[], tx?: Transaction, lock?: boolean) => Promise<EntryBase[]>;
  abstract remove(tableName: string, pk: Attribute<Natural, unknown>): (this: EntryBase & Record<string, Natural>) => Promise<boolean>;
  abstract save(tableName: string, attributes: Record<string, string>, pk: Attribute<Natural, unknown>): (this: EntryBase & Record<string, Natural>) => Promise<boolean>;

  abstract dropConstraints(table: Table): Promise<number[]>;
  abstract dropFields(table: Table): Promise<void>;
  abstract dropIndexes(table: Table, constraintIndexes: number[]): Promise<void>;
  abstract syncConstraints(table: Table): Promise<void>;
  abstract syncFields(table: Table): Promise<void>;
  abstract syncIndexes(table: Table): Promise<void>;
  abstract syncSequence(table: Table): Promise<void>;
  abstract syncTable(table: Table): Promise<void>;
}

export class Transaction {
  private entries: (EntryBase & { tx?: Transaction })[] = [];
  protected log: (message: string) => void;

  constructor(log: (message: string) => void) {
    this.log = log;
  }

  addEntry(entry: EntryBase) {
    Object.defineProperty(entry, "tx", { configurable: true, value: this });
    this.entries.push(entry);
  }

  clean() {
    const { entries } = this;

    for(const entry of entries) Object.defineProperty(entry, "tx", { configurable: true, value: null });
    this.entries = [];
  }

  async commit() {
    this.clean();
  }

  async rollback() {
    this.clean();
  }
}
