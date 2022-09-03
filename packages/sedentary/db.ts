export const actions = Symbol("actions");
export const base = Symbol("base");
export const loaded = Symbol("loaded");
export const size = Symbol("size");
export const transaction = Symbol("transaction");

export interface Action {
  action: "remove" | "save";
  records: number | false;
}

export class EntryBase {
  constructor(from?: Partial<EntryBase>) {
    if(from === "load") this.preLoad();
    else {
      if(from) Object.assign(this, from);
      this.construct();
    }
  }

  construct() {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  postCommit(actions: Action[]) {}
  postLoad() {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  postRemove(deletedRecords: number) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  postSave(savedRecords: number | false) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  preCommit(actions: Action[]) {}
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

export interface Type<T, E> {
  [base]: unknown;
  entry?: E;
  native?: T;
  [size]?: number;
  type: string;
  foreignKey?: {
    attributeName: string;
    fieldName: string;
    options?: ForeignKeyOptions;
    tableName: string;
  };
}

export class Type<T, E> {
  constructor(from: Type<T, E>) {
    Object.assign(this, from);
  }
}

export interface Attribute<T, E> extends Type<T, E> {
  attributeName: string;
  defaultValue?: unknown;
  fieldName: string;
  modelName: string;
  notNull: boolean;
  tableName: string;
  unique?: boolean;
}

export class Attribute<T, E> extends Type<T, E> {
  constructor(from: Attribute<T, E>) {
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
  attribute: Attribute<unknown, unknown>;
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
  attributes: Attribute<unknown, unknown>[];
  autoIncrement: boolean;
  constraints: Constraint[];
  indexes: Index[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: { load: (where: any, order?: string[], tx?: Transaction) => Promise<EntryBase[]> };
  parent?: Attribute<unknown, unknown>;
  pk: Attribute<unknown, unknown>;
  sync: boolean;
  tableName: string;
}

export class Table extends autoImplement<ITable>() {
  autoIncrementOwn?: boolean;
  oid?: number;

  findField(name: string): Attribute<unknown, unknown> {
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

  abstract cancel(tableName: string): (where: string, tx?: Transaction) => Promise<number>;
  abstract escape(value: unknown): string;
  abstract load(
    tableName: string,
    attributes: Record<string, string>,
    pk: Attribute<unknown, unknown>,
    model: new () => EntryBase,
    table: Table
  ): (where: string, order?: string | string[], limit?: number, tx?: Transaction, lock?: boolean) => Promise<EntryBase[]>;
  abstract remove(tableName: string, pk: Attribute<unknown, unknown>): (this: EntryBase & Record<string, unknown>) => Promise<number>;
  abstract save(tableName: string, attr2field: Record<string, string>, pk: Attribute<unknown, unknown>): (this: EntryBase & Record<string, unknown>) => Promise<number | false>;

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
  private entries: (EntryBase & { [actions]?: Action[]; tx?: Transaction })[] = [];
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

  async commit() {
    const { entries } = this;

    for(const entry of entries) if(entry[actions]) entry.postCommit(entry[actions]);

    this.clean();
  }

  protected preCommit() {
    const { entries } = this;

    for(const entry of entries) if(entry[actions]) entry.preCommit(entry[actions]);
  }

  async rollback() {
    this.clean();
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
