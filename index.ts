import { Attribute, Constraint, DB, EntryBase, ForeignKeyOptions, Index, Natural, Table, Type } from "./lib/db";
import { MiniDB } from "./lib/minidb";

export { EntryBase, ForeignKeyActions, ForeignKeyOptions, Natural, Type } from "./lib/db";
export type TypeDefinition<N extends Natural, E> = (() => Type<N, E>) | Type<N, E>;
export interface AttributeOptions<N extends Natural, E> {
  defaultValue?: N;
  fieldName?: string;
  notNull?: boolean;
  type: TypeDefinition<N, E>;
  unique?: boolean;
}

export type AttributeDefinition<N extends Natural, E> = TypeDefinition<N, E> | AttributeOptions<N, E>;
export type AttributesDefinition = { [key: string]: AttributeDefinition<Natural, unknown> };

type ForeignKeysAttributes<T, k> = T extends AttributeDefinition<Natural, infer E> ? (E extends EntryBase ? k : never) : never;
type ForeignKeys<A extends AttributesDefinition> = { [a in keyof A]?: ForeignKeysAttributes<A[a], a> }[keyof A];

type Native__<T> = T extends Type<infer N, unknown> ? N : never;
type Native_<T> = T extends () => Type<infer N, infer E> ? Native__<Type<N, E>> : Native__<T>;
type Native<T> = T extends AttributeOptions<infer N, infer E> ? Native__<Type<N, E>> : Native_<T>;

export type IndexAttributes = string[] | string;

export interface IndexOptions {
  attributes: IndexAttributes;
  type?: "btree" | "hash";
  unique?: boolean;
}

export type IndexDefinition = IndexAttributes | IndexOptions;
export type IndexesDefinition = { [key: string]: IndexDefinition };

interface BaseModelOptions {
  indexes?: IndexesDefinition;
  sync?: boolean;
  tableName?: string;
}

export interface ModelOptions extends BaseModelOptions {
  int8id?: boolean;
  parent?: Type<Natural, EntryBase>;
  primaryKey?: string;
}

const Attributes = Symbol();
const Methods = Symbol();

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
type BaseKeyType<B extends boolean> = IsUnion<B> extends true ? number : B extends true ? string : number;
type KeyType<B extends boolean, P extends Type<Natural, EntryBase>> = P extends new () => EntryBase ? (P extends Type<infer T, EntryBase> ? T : never) : BaseKeyType<B>;

type ForeignKey<A> = A extends AttributeDefinition<Natural, infer E> ? () => Promise<E> : never;
type EntryFKAttributes<A extends AttributesDefinition> = { [a in ForeignKeys<A> & string as `${a}Load`]?: ForeignKey<A[a]> };
type EntryBaseAttributes<A extends AttributesDefinition> = { [a in keyof A]?: Native<A[a]> };
type EntryFullAttributes<A extends AttributesDefinition> = keyof EntryFKAttributes<A> extends never ? EntryBaseAttributes<A> : EntryBaseAttributes<A> & EntryFKAttributes<A>;
type EntryAttributesId<B extends boolean> = { id?: IsUnion<B> extends true ? number : B extends true ? string : number };
type EntryIfAttributes<A extends AttributesDefinition, T> = keyof A extends never ? T : T & EntryFullAttributes<A>;
type EntryAttributes<A extends AttributesDefinition, B extends boolean, K extends string, P extends Type<Natural, EntryBase> & { [Attributes]: unknown }> = K extends keyof A
  ? EntryFullAttributes<A>
  : EntryIfAttributes<A, P extends new () => EntryBase ? P[typeof Attributes] : EntryAttributesId<B>>;

type EntryMethods<A extends AttributesDefinition, K extends string, P extends Type<Natural, EntryBase> & { [Methods]: unknown }> = K extends keyof A
  ? EntryBase
  : P extends new () => EntryBase
  ? P[typeof Methods]
  : EntryBase;

type Model<N extends Natural, A extends Record<string, Natural | undefined>, M extends EntryBase> = (new (from?: A) => A & M) & Type<N, A & M> & { [Attributes]: A; [Methods]: M };

export type Entry<M> = M extends new () => infer E ? E : never;

export interface SedentaryOptions {
  log?: ((message: string) => void) | null;
  serverless?: boolean;
  sync?: boolean;
}

const allowedOption = ["indexes", "int8id", "parent", "primaryKey", "sync", "tableName"];
const reservedNames = ["attributeName", "base", "class", "constructor", "defaultValue", "entry", "fieldName", "load", "name", "primaryKey", "prototype", "save", "size", "tableName", "type"];

export class Sedentary {
  protected db: DB;
  protected log: (...data: unknown[]) => void;
  protected sync = true;

  private models: { [key: string]: boolean } = {};

  constructor(filename: string, options?: SedentaryOptions) {
    if(typeof filename !== "string") throw new Error("new Sedentary: 'filename' argument: Wrong type, expected 'string'");
    if(! options) options = {};
    if(! (options instanceof Object)) throw new Error("new Sedentary: 'options' argument: Wrong type, expected 'Object'");

    for(const k in options) if(! ["log", "sync"].includes(k)) throw new Error(`new Sedentary: 'options' argument: Unknown '${k}' option`);

    const { log, sync } = { sync: true, ...options };

    if(log !== null && log !== undefined && ! (log instanceof Function)) throw new Error("new Sedentary: 'log' option: Wrong type, expected 'null' or 'Function'");
    if(typeof sync !== "boolean") throw new Error("new Sedentary: 'sync' option: Wrong type, expected 'boolean'");

    // eslint-disable-next-line no-console
    this.log = log ? log : log === null ? () => {} : console.log;
    this.db = new MiniDB(filename, this.log);
    this.sync = sync;
  }

  DATETIME(): Type<Date, unknown> {
    return new Type({ base: Date, type: "DATETIME" });
  }

  FKEY<N extends Natural, E extends EntryBase>(attribute: Type<N, E>, options?: ForeignKeyOptions): Type<N, E> {
    const { attributeName, base, fieldName, size, tableName, type } = attribute as never;

    return new Type({ base, foreignKey: { attributeName, fieldName, options, tableName }, size, type });
  }

  INT(size?: number): Type<number, unknown> {
    const message = "Sedentary.INT: 'size' argument: Wrong value, expected 2 or 4";

    size = size ? this.checkSize(size, message) : 4;

    if(size !== 2 && size !== 4) throw new Error(message);

    return new Type({ base: Number, size, type: "INT" });
  }

  INT8(): Type<string, unknown> {
    return new Type({ base: String, size: 8, type: "INT8" });
  }

  VARCHAR(size?: number): Type<string, unknown> {
    const message = "Sedentary.VARCHAR: 'size' argument: Wrong value, expected positive integer";

    size = size ? this.checkSize(size, message) : undefined;

    return new Type({ base: String, size, type: "VARCHAR" });
  }

  checkSize(size: number, message: string): number {
    const str = size.toString();
    const parsed = parseInt(str, 10);

    if(str !== parsed.toString()) throw new Error(message);

    return parsed;
  }

  async connect(): Promise<void> {
    try {
      this.log("Connecting...");
      await this.db.connect();
      this.log("Connected, syncing...");
      await this.db.syncDataBase();
      this.log("Synced");
    } catch(e) {
      this.log("Connecting:", e instanceof Error ? e.message : JSON.stringify(e));
      throw e;
    }
  }

  async end(): Promise<void> {
    this.log("Closing connection...");
    await this.db.end();
    this.log("Connection closed");
  }

  model<
    A extends AttributesDefinition,
    B extends boolean,
    K extends string,
    P extends Type<Natural, EntryBase> & { [Attributes]: unknown; [Methods]: unknown },
    EA extends EntryAttributes<A, B, K, P>,
    EM extends EntryMethods<A, K, P>
  >(modelName: string, attributes: A, options?: BaseModelOptions & { int8id?: B; parent?: P; primaryKey?: K | keyof A }): Model<K extends keyof A ? Native<A[K]> : KeyType<B, P>, EA, EM>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  model<
    A extends AttributesDefinition,
    B extends boolean,
    K extends string,
    P extends Type<Natural, EntryBase> & { [Attributes]: unknown; [Methods]: unknown },
    EA extends EntryAttributes<A, B, K, P>,
    EM extends EntryMethods<A, K, P>,
    M extends Record<string, <S extends M>(this: EA & EM & S, ...args: any[]) => void>
  >(
    modelName: string,
    attributes: A,
    options: BaseModelOptions & { int8id?: B; parent?: P; primaryKey?: K | keyof A },
    methods: M & Record<keyof M, (this: EA & EM & M, ...args: any[]) => void>
  ): Model<K extends keyof A ? Native<A[K]> : KeyType<B, P>, EA, EM & M>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  model<A extends AttributesDefinition, M extends Record<string,() => void>>(
    modelName: string,
    attributes: A,
    options?: ModelOptions,
    methods?: M
  ): Model<Natural, Record<string, Natural | undefined>, EntryBase> {
    const ret = function() {} as unknown as Model<Natural, Record<string, Natural | undefined>, EntryBase>;

    Object.defineProperty(ret, "name", { value: modelName });
    if(methods) Object.assign(ret.prototype, methods);
    ret.prototype.save = function() {
      return Promise.resolve(false);
    };

    return ret;
  }
}
