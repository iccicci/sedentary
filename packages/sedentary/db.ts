export const actions = Symbol("actions");
export const base = Symbol("base");
export const loaded = Symbol("loaded");
export const size = Symbol("size");
export const transaction = Symbol("transaction");

export type TxAction = { action: "remove"; records: number } | { action: "save"; records: number | false };

export class EntryBase {
  constructor(from?: Partial<EntryBase>) {
    if((from as unknown) === "load") this.preLoad();
    else {
      if(from) Object.assign(this, from);
      this.construct();
    }
  }

  construct() {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  postCommit(actions: TxAction[]) {}
  postLoad() {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  postRemove(deletedRecords: number) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  postSave(savedRecords: number | false) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  preCommit(actions: TxAction[]) {}
  preLoad() {}
  preRemove() {}
  preSave() {}

  remove() {
    return Promise.resolve(false);
  }

  save(): Promise<number | false> {
    return Promise.resolve(false);
  }
}

export type ForeignKeyActions = "cascade" | "no action" | "restrict" | "set default" | "set null";

export interface ForeignKeyOptions {
  onDelete?: ForeignKeyActions;
  onUpdate?: ForeignKeyActions;
}

export interface Type<T, N extends boolean, E> {
  [base]: unknown;
  entry?: E;
  native?: T;
  notNull?: N;
  [size]?: number;
  type: string;
  foreignKey?: {
    attributeName: string;
    fieldName: string;
    options?: ForeignKeyOptions;
    tableName: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Type<T, N extends boolean, E> {
  constructor(from: Type<T, N, E>) {
    Object.assign(this, from);
  }
}

export interface Attribute<T, N extends boolean, E> extends Type<T, N, E> {
  attributeName: string;
  defaultValue?: unknown;
  fieldName: string;
  modelName: string;
  notNull: N;
  tableName: string;
  unique?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Attribute<T, N extends boolean, E> extends Type<T, N, E> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(from: Attribute<T, N, E>) {
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
  attribute: Attribute<unknown, boolean, unknown>;
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
  attributes: Attribute<unknown, boolean, unknown>[];
  autoIncrement: boolean;
  constraints: Constraint[];
  indexes: Index[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: { load: (where: any, order?: any, tx?: Transaction) => Promise<EntryBase[]> };
  parent?: Attribute<unknown, boolean, unknown>;
  pk: Attribute<unknown, boolean, unknown>;
  sync: boolean;
  tableName: string;
}

export class Table extends autoImplement<ITable>() {
  autoIncrementOwn?: boolean;
  oid?: number;

  findAttribute(name: string) {
    return this.attributes.find(_ => _.attributeName === name)!;
  }

  findField(name: string) {
    return this.attributes.find(_ => _.fieldName === name)!;
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

  findTable(name: string) {
    return this.tables.find(_ => _.tableName === name)!;
  }

  protected indexesEq(a: Index, b: Index) {
    if(a.fields.length !== b.fields.length) return false;
    for(let i = 0; i < a.fields.length; ++i) if(a.fields[i] !== b.fields[i]) return false;
    if(a.type !== b.type) return false;
    if(a.unique !== b.unique) return false;

    return true;
  }

  async syncDataBase() {
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

  protected syncLog(message: string) {
    this.log(this.sync ? message : `NOT SYNCING: ${message}`);
  }

  abstract begin(): Promise<T>;

  abstract cancel(tableName: string): (where: string, tx?: Transaction) => Promise<number>;
  abstract escape(value: unknown): string;
  abstract load(
    tableName: string,
    attributes: Record<string, string>,
    pk: Attribute<unknown, boolean, unknown>,
    model: new () => EntryBase,
    table: Table
  ): (where: string, order?: string | string[], limit?: number, tx?: Transaction, lock?: boolean) => Promise<EntryBase[]>;
  abstract remove(tableName: string, pk: Attribute<unknown, boolean, unknown>): (this: EntryBase & Record<string, unknown>) => Promise<number>;
  abstract save(tableName: string, attr2field: Record<string, string>, pk: Attribute<unknown, boolean, unknown>): (this: EntryBase & Record<string, unknown>) => Promise<number | false>;

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
  private entries: (EntryBase & { [actions]?: TxAction[]; tx?: Transaction })[] = [];
  protected log: (message: string) => void;

  constructor(log: (message: string) => void) {
    this.log = log;
  }

  addEntry(entry: EntryBase) {
    Object.defineProperty(entry, transaction, { configurable: true, value: this });
    this.entries.push(entry);
  }

  clean() {
    const { entries } = this;

    for(const entry of entries) {
      Object.defineProperty(entry, actions, { configurable: true, value: undefined });
      Object.defineProperty(entry, transaction, { configurable: true, value: undefined });
    }

    this.entries = [];
  }

  commit() {
    const { entries } = this;

    for(const entry of entries) if(entry[actions]) entry.postCommit(entry[actions]);

    this.clean();

    return Promise.resolve();
  }

  protected preCommit() {
    const { entries } = this;

    for(const entry of entries) if(entry[actions]) entry.preCommit(entry[actions]);
  }

  rollback() {
    this.clean();

    return Promise.resolve();
  }
}

const sortedEntries = (obj: object) => Object.entries(obj).sort((entryA, entryB) => (entryA[0] > entryB[0] ? -1 : 1));

export function deepCopy(o: unknown) {
  if(! o || typeof o !== "object") return o;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ret, entries] = o instanceof Array ? [new Array(o.length) as any, o.entries()] : [{}, Object.entries(o)];

  for(const [k, v] of entries) ret[k] = deepCopy(v);

  return ret;
}

export function deepDiff(a: unknown, b: unknown) {
  if(typeof a !== "object") return a !== b;
  if(typeof b !== "object") return true;
  if(a === null) return b !== null;
  if(b === null) return true;

  if(a instanceof Array) {
    if(! (b instanceof Array)) return true;
    for(const [i, value] of a.entries()) if(deepDiff(value, b[i])) return true;

    return false;
  }

  const entriesA = sortedEntries(a);
  const entriesB = sortedEntries(b);

  if(entriesA.length !== entriesB.length) return true;
  for(const [i, [key, value]] of entriesA.entries()) if(key !== entriesB[i][0] || deepDiff(value, entriesB[i][1])) return true;

  return false;
}
