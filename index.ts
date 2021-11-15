import { Attribute, Constraint, DB, Entry, Index, Meta, Natural, Table, Type } from "./lib/db";
import { createLogger } from "./lib/log";
import { MiniDB } from "./lib/minidb";

export { Entry, Natural, Type } from "./lib/db";
export type TypeDefinition<N extends Natural, E extends Entry> = (() => Type<N, E>) | Type<N, E>;
export interface AttributeOptions<N extends Natural, E extends Entry> {
  defaultValue?: N;
  fieldName?: string;
  notNull?: boolean;
  type: TypeDefinition<N, E>;
  unique?: boolean;
}

export type AttributeDefinition<N extends Natural, E extends Entry> = TypeDefinition<N, E> | AttributeOptions<N, E>;
export type AttributesDefinition = { [key: string]: AttributeDefinition<Natural, Entry> };

type KeysAttributes<T, k> = T extends AttributeDefinition<Natural, infer E> ? (E extends Entry ? k : never) : never;
type Keys<F extends AttributesDefinition> = { [f in keyof F]?: KeysAttributes<F[f], f> }[keyof F];

type Methods<T> = { [key: string]: (this: T) => unknown };

type Native__<T> = T extends Type<infer N, Entry> ? N : never;
type Native_<T> = T extends () => Type<infer N, infer E> ? Native__<Type<N, E>> : Native__<T>;
type Native<T> = T extends AttributeOptions<infer N, infer E> ? Native__<Type<N, E>> : Native_<T>;

type Parent<T> = T extends Meta<Natural, infer R> ? R : never;

export type IndexAttributes = string[] | string;

export interface IndexOptions {
  attributes: IndexAttributes;
  type?: "btree" | "hash";
  unique?: boolean;
}

export type IndexDefinition = IndexAttributes | IndexOptions;

export type ModelOptions<M, T> = {
  indexes?: { [key: string]: IndexDefinition };
  init?: (this: T) => void;
  methods?: M;
  sync?: boolean;
  tableName?: string;
};

type ForeignKey<T> = T extends AttributeDefinition<Natural, infer E> ? () => Promise<E> : never;
type Model<F extends AttributesDefinition, M> = { [f in keyof F]?: Native<F[f]> } & { [f in Keys<F> & string as `${f}Load`]?: ForeignKey<F[f]> } & M;
type Ancestor<F, N extends Natural, E extends Entry> = (new () => E) & { [f in keyof F]?: Meta<Native<F[f]>, E> } & { load: (boh: boolean) => Promise<E[]> } & Meta<N, E>;

export interface SchemaOptions {
  log?: ((message: string) => void) | null;
  sync?: boolean;
}

const allowedOption = ["indexes", "init", "int8id", "methods", "parent", "primaryKey", "sync", "tableName", "type"];

const reservedNames = [
  "attribute",
  "attributes",
  "attributeName",
  "autoIncrement",
  "autoIncrementOwn",
  "base",
  "class",
  "constraintName",
  "constructor",
  "defaultValue",
  "entry",
  "fieldName",
  "indexName",
  "init",
  "isModel",
  "load",
  "meta",
  "methods",
  "name",
  "native",
  "parent",
  "primaryKey",
  "prototype",
  "oid",
  "save",
  "size",
  "sync",
  "tableName",
  "type"
];

export class Sedentary {
  protected db: DB;
  protected log: (...data: unknown[]) => void;

  private sync = true;
  private models: { [key: string]: boolean } = {};

  constructor(filename: string, options?: SchemaOptions) {
    if(typeof filename !== "string") throw new Error("new Sedentary: 'filename' argument: Wrong type, expected 'string'");
    if(! options) options = {};
    if(! (options instanceof Object)) throw new Error("new Sedentary: 'options' argument: Wrong type, expected 'Object'");

    for(const k in options) if(["log", "sync"].indexOf(k) === -1) throw new Error(`new Sedentary: 'options' argument: Unknown '${k}' option`);

    this.log = createLogger(options.log);
    if("sync" in options) this.sync = options.sync;

    this.db = new MiniDB(filename, this.log);
  }

  DATETIME(): Type<Date, Entry> {
    return new Type({ base: Date, type: "DATETIME" });
  }

  FKEY<N extends Natural, E extends Entry>(attribute: Type<N, E>): Type<N, E> {
    const { attributeName, base, fieldName, size, tableName, type } = attribute as never;
    console.log("fk", { attributeName, base, fieldName, size, tableName, type }, attribute);
    return new Type({ base, size, type });
  }

  INT(size?: number): Type<number, Entry> {
    const message = "Sedentary.INT: 'size' argument: Wrong value, expected 2 or 4";

    size = size ? this.checkSize(size, message) : 4;

    if(size !== 2 && size !== 4) throw new Error(message);

    return new Type({ base: Number, size, type: "INT" });
  }

  INT8(): Type<string, Entry> {
    return new Type({ base: String, size: 8, type: "INT8" });
  }

  VARCHAR(size?: number): Type<string, Entry> {
    const message = "Sedentary.VARCHAR: 'size' argument: Wrong value, expected positive integer";

    size = size ? this.checkSize(size, message) : undefined;

    return new Type({ base: String, size, type: "VARCHAR" });
  }

  async connect(): Promise<void> {
    try {
      this.log("Connecting...");
      await this.db.connect();
      this.log("Connected, syncing...");
      await this.db.sync();
      this.log("Synced");
    } catch(e) {
      this.log("Connecting:", e.message);
      throw e;
    }
  }

  async end(): Promise<void> {
    this.log("Closing connection...");
    await this.db.end();
    this.log("Connection closed");
  }

  model<F extends AttributesDefinition, M extends Methods<T>, T extends Entry & { id?: string } & Model<F, M>>(
    name: string,
    attributes: F,
    options?: ModelOptions<M, T> & { int8id: true }
  ): Ancestor<F, string, T>;
  model<F extends AttributesDefinition, K extends keyof F, M extends Methods<T>, N extends K extends keyof F ? Native<F[K]> : never, T extends Entry & Model<F, M>>(
    name: string,
    attributes: F,
    options?: ModelOptions<M, T> & { primaryKey: K }
  ): Ancestor<F, N, T>;
  model<F extends AttributesDefinition, M extends Methods<T>, P extends Meta<Natural, Entry>, N extends P extends Meta<infer N, Entry> ? N : never, T extends Parent<P> & Model<F, M>>(
    name: string,
    attributes: F,
    options?: ModelOptions<M, T> & { parent: P }
  ): Ancestor<F, N, T>;
  model<F extends AttributesDefinition, M extends Methods<T>, T extends Entry & { id?: number } & Model<F, M>>(name: string, attributes: F, options?: ModelOptions<M, T>): Ancestor<F, number, T>;
  model<F extends AttributesDefinition, K extends string, M extends Methods<T>, N extends Natural, P extends Meta<Natural, Entry>, T extends Entry & Model<F, M>>(
    name: string,
    attributes: F,
    options?: ModelOptions<M, T> & { int8id?: boolean; parent?: P; primaryKey?: K }
  ): Ancestor<F, N, T> {
    if(typeof name !== "string") throw new Error("Sedentary.model: 'name' argument: Wrong type, expected 'string'");
    if(this.models[name]) throw new Error(`Sedentary.model: '${name}' model: Model already defined`);
    if(! attributes) attributes = {} as F;
    if(! (attributes instanceof Object)) throw new Error(`Sedentary.model: '${name}' model: 'attributes' argument: Wrong type, expected 'Object'`);
    if(! options) options = {};
    if(! (options instanceof Object)) throw new Error(`Sedentary.model: '${name}' model: 'options' argument: Wrong type, expected 'Object'`);

    for(const k in options) if(allowedOption.indexOf(k) === -1) throw new Error(`Sedentary.model: '${name}' model: 'options' argument: Unknown '${k}' option`);
    if(options.int8id && options.parent) throw new Error(`Sedentary.model: '${name}' model: 'int8id' and 'parent' options conflict each other`);
    if(options.int8id && options.primaryKey) throw new Error(`Sedentary.model: '${name}' model: 'int8id' and 'primaryKey' options conflict each other`);
    if(options.parent && options.primaryKey) throw new Error(`Sedentary.model: '${name}' model: 'parent' and 'primaryKey' options conflict each other`);

    const constraints: Constraint[] = [];
    const { indexes, int8id, parent, primaryKey, sync, tableName } = { sync: this.sync, tableName: name, ...options };
    let { methods } = options;
    let aarray: Attribute<Natural, Entry>[] = int8id
      ? [new Attribute<string, Entry>({ ...this.INT8(), attributeName: "id", fieldName: "id", notNull: true, tableName, unique: true })]
      : [new Attribute<number, Entry>({ ...this.INT(4), attributeName: "id", fieldName: "id", notNull: true, tableName, unique: true })];
    let iarray: Index[] = [{ attributes: ["id"], indexName: `${tableName}_id_unique`, type: "btree", unique: true }];
    const pk = aarray[0];

    if(methods && ! (methods instanceof Object)) throw new Error(`Sedentary.model: '${name}' model: 'methods' option: Wrong type, expected 'Object'`);

    if(parent) {
      methods = (methods ? { ...(parent.methods || {}), ...methods } : parent.methods) as never;

      try {
        if(! parent.isModel()) throw new Error();
      } catch(e) {
        throw new Error(`Sedentary.model: '${name}' model: 'parent' option: Wrong type, expected 'Model'`);
      }
    }

    if(primaryKey && typeof primaryKey !== "string") throw new Error(`Sedentary.model: '${name}' model: 'primaryKey' option: Wrong type, expected 'string'`);
    if(primaryKey && Object.keys(attributes).indexOf(primaryKey) === -1) throw new Error(`Sedentary.model: '${name}' model: 'primaryKey' option: Attribute '${primaryKey}' does not exists`);

    if(parent || primaryKey) {
      aarray = [];
      iarray = [];
    }

    for(const attributeName in attributes) {
      if(reservedNames.indexOf(attributeName) !== -1) throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: Reserved name`);

      const call = (defaultValue: unknown, fieldName: string, notNull: boolean, unique: boolean, func: () => Type<Natural, Entry>, message: string) => {
        if(func !== this.DATETIME && func !== this.FKEY && func !== this.INT && func !== this.INT8 && func !== this.VARCHAR) throw new Error(message);

        return new Attribute({ attributeName, defaultValue, fieldName, notNull, tableName, unique, ...func() });
      };

      const attribute = attributes[attributeName];
      let { base, defaultValue, fieldName, notNull, size, type, unique } = ((): Attribute<Natural, Entry> => {
        const ret = ((): Attribute<Natural, Entry> => {
          if(attribute instanceof Type) return new Attribute({ attributeName, fieldName: attributeName, notNull: false, tableName, ...attribute });
          if(attribute instanceof Function) return call(undefined, attributeName, false, false, attribute, `Sedentary.model: '${name}' model: '${attributeName}' attribute: Wrong type, expected 'Attribute'`);
          if(! (attribute instanceof Object)) throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: Wrong attribute type, expected 'Attribute'`);

          const { defaultValue, fieldName, notNull, unique, type } = { defaultValue: undefined, fieldName: attributeName, notNull: false, unique: false, ...attribute } as AttributeOptions<
            Natural,
            Entry
          >;

          if(defaultValue === null) throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: 'defaultValue' option: Does 'null' default value really makes sense?`);
          if(typeof fieldName !== "string") throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: 'fieldName' option: Wrong type, expected 'string'`);
          if(typeof notNull !== "boolean") throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: 'notNull' option: Wrong type, expected 'boolean'`);
          if(typeof unique !== "boolean") throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: 'unique' option: Wrong type, expected 'boolean'`);
          if(type === undefined) throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: Missing 'type' option`);
          if(type instanceof Type) return new Attribute({ attributeName, defaultValue, fieldName, notNull, tableName, unique, ...type });
          if(type instanceof Function) return call(defaultValue, fieldName, notNull, unique, type, `Sedentary.model: '${name}' model: '${attributeName}' attribute: 'type' option: Wrong type, expected 'Type'`);

          throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: 'type' option: Wrong type, expected 'Type'`);
        })();

        const { base, defaultValue } = ret;

        if(defaultValue !== undefined) {
          if(base === Date && ! (defaultValue instanceof Date)) throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: 'defaultValue' option: Wrong type, expected 'Date'`);
          if(base === Number && typeof defaultValue !== "number") throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: 'defaultValue' option: Wrong type, expected 'number'`);
          if(base === String && typeof defaultValue !== "string") throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: 'defaultValue' option: Wrong type, expected 'string'`);
        }

        return ret;
      })();

      if(primaryKey === (attributeName as never)) {
        notNull = true;
        unique = true;
      }

      if(defaultValue) notNull = true;

      aarray.push(new Attribute({ attributeName, base, defaultValue, fieldName, notNull, size, tableName, type, unique }));

      if(unique) iarray.push({ attributes: [fieldName], indexName: `${tableName}_${fieldName}_unique`, type: "btree", unique: true });
    }

    if(indexes) {
      const flds = attributes;

      if(! (indexes instanceof Object)) throw new Error(`Sedentary.model: '${name}' model: 'indexes' option: Wrong type, expected 'Object'`);

      for(const indexName in indexes) {
        if(iarray.filter(_ => _.indexName === indexName).length !== 0) throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: index name already inferred by the unique constraint on an attribute`);

        const idx = indexes[indexName];
        const checkField = (attribute: string, l: number): void => {
          if(typeof attribute !== "string") throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: #${l + 1} attribute: Wrong type, expected 'string'`);
          if(! (attribute in flds)) throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: #${l + 1} attribute: Unknown attribute '${attribute}'`);
        };

        let attributes: IndexAttributes;
        let type: "btree" | "hash" = "btree";
        let unique = false;

        if(idx instanceof Array) {
          idx.forEach(checkField);
          attributes = idx;
        } else if(typeof idx === "string") {
          checkField(idx, 0);
          attributes = [idx];
        } else if(idx instanceof Object) {
          for(const k in idx) if(["attributes", "type", "unique"].indexOf(k) === -1) throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: Unknown index option '${k}'`);

          ({ attributes, type, unique } = { type: "btree", unique: false, ...idx });

          if(! attributes) throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: Missing 'attributes' option`);
          if(attributes instanceof Array) attributes.forEach(checkField);
          else if(typeof attributes === "string") {
            checkField(attributes, 0);
            attributes = [attributes];
          } else throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: 'attributes' option: Wrong type, expected 'FieldNames'`);

          if(typeof type !== "string") throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: 'type' option: Wrong type, expected 'string'`);
          if(["btree", "hash"].indexOf(type) === -1) throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: 'type' option: Wrong value, expected 'btree' or 'hash'`);
          if(typeof unique !== "boolean") throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: 'unique' option: Wrong type, expected 'boolean'`);
        } else throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: Wrong type, expected 'Object'`);

        iarray.push({ attributes, indexName, type, unique });
      }
    }

    this.db.addTable(new Table({ constraints, attributes: aarray, indexes: iarray, parent, primaryKey, sync, tableName }));
    this.models[name] = true;

    const init = parent
      ? options.init
        ? function() {
          parent.init.call(this);
          options.init.call(this);
        }
        : parent.init
      : options.init;

    const flds: { [f in keyof F]?: Meta<Native<F[f]>, T> } = {};

    for(const key in attributes) flds[key] = null;

    class Class {
      constructor() {
        if(init) init.call(this);
      }

      save(): Promise<boolean> {
        return new Promise((resolve, reject) => {
          const save = (): void => reject(new Error("eh no"));
          Object.defineProperty(save, "name", { value: name + ".save" });

          setTimeout(save, 10);
        });
      }
    }

    const load: (boh: boolean) => Promise<T[]> = (boh: boolean) =>
      new Promise((resolve, reject) =>
        setTimeout(() => {
          if(boh) return resolve([new Class() as T]);
          reject(new Error("boh"));
        }, 10)
      );
    Object.defineProperty(load, "name", { value: name + ".load" });

    const meta = { base: Number, type: "meta", tableName, primaryKey, init, methods };

    Object.defineProperty(Class, "isModel", { value: () => true });
    Object.defineProperty(Class, "load", { value: load });
    Object.defineProperty(Class, "meta", { value: new Meta<N, T>(meta) });
    Object.defineProperty(Class, "name", { value: name });
    Object.defineProperty(Class.prototype.save, "name", { value: name + ".save" });
    Object.assign(Class, new Meta<N, T>(meta));
    Object.assign(Class.prototype, methods);
    for(const attribute of aarray) Object.defineProperty(Class, attribute.attributeName, { value: attribute });
    for(const key of ["attributeName", "base", "fieldName", "size", "type"]) Object.defineProperty(Class, key, { value: pk[key] });

    return Class as Ancestor<F, N, T>;
  }

  checkSize(size: number, message: string): number {
    const str = size.toString();
    const parsed = parseInt(str, 10);

    if(str !== parsed.toString()) throw new Error(message);

    return parsed;
  }
}

export const Package = Sedentary;

const db = new Sedentary("gino");

const Users = db.model("User", { foo: db.INT(), bar: db.VARCHAR() }, {});

const u = new Users();

try {
  u.barLoad();
} catch(e) {}

class Item extends db.model(
  "Item",
  {
    num: db.FKEY(Users),
    str: db.VARCHAR()
  },
  {
    init: function(): void {
      this.num = 0;
      this.str = "0";
    },
    int8id:  true,
    methods: {
      prova: (): string => "ok"
    }
  }
) {}

class Super extends db.model(
  "Super",
  {
    a: db.INT,
    n: db.FKEY(Item),
    s: db.FKEY(Users.bar)
  },
  {
    parent: Item,
    init:   async function() {
      this.n = "23";
      this.id = "0";
      this.num = 0;
      const a = this.nLoad ? await this.nLoad() : { prova: (): null => null };
      a.prova();
    }
  }
) {}

class Next extends db.model(
  "Next",
  { a: db.INT, b: db.INT },
  {
    init: function() {
      this.a = 23;
    },
    primaryKey: "a"
  }
) {}

const n = new Next();

try {
  n.aLoad();
} catch(e) {}

class Current extends db.model(
  "Current",
  { b: db.FKEY(Next) },
  {
    init: function() {
      this.b = 24;
    }
  }
) {}

class Last extends db.model(
  "Last",
  { b: db.FKEY(Current.b) },
  {
    init: function() {
      this.b = 24;
    },
    parent: Next
  }
) {}

(async function(): Promise<boolean> {
  const item = new Super();

  try {
    await item.save();
  } catch(e) {
    console.log(Item.load, item.save, await Item.load(true), item, e.message);
    console.log(new Next(), Next.load, await Next.load(true), new Last(), item.prova());
  }

  return true;
})();
