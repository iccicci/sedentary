import { Attribute, Constraint, DB, Entry, Index, Meta, Natural, Table, Type } from "./lib/db";
import { createLogger } from "./lib/log";
import { MiniDB } from "./lib/minidb";

export { Entry, Natural, Type } from "./lib/db";
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

type KeysAttributes<T, k> = T extends AttributeDefinition<Natural, infer E> ? (E extends Entry ? k : never) : never;
type Keys<F extends AttributesDefinition> = { [f in keyof F]?: KeysAttributes<F[f], f> }[keyof F];

type Methods<T> = { [key: string]: (this: T) => unknown };

type Native__<T> = T extends Type<infer N, unknown> ? N : never;
type Native_<T> = T extends () => Type<infer N, infer E> ? Native__<Type<N, E>> : Native__<T>;
type Native<T> = T extends AttributeOptions<infer N, infer E> ? Native__<Type<N, E>> : Native_<T>;

type Parent<T> = T extends Meta<Natural, infer E> ? E : never;

export type IndexAttributes = string[] | string;

export interface IndexOptions {
  attributes: IndexAttributes;
  type?: "btree" | "hash";
  unique?: boolean;
}

export type IndexDefinition = IndexAttributes | IndexOptions;

export type BaseModelOptions<T> = {
  indexes?: { [key: string]: IndexDefinition };
  init?: (this: T) => void;
  sync?: boolean;
  tableName?: string;
};

export type ModelOptions<K extends string, M extends Methods<T>, P extends Meta<Natural, Entry>, T extends Entry> = BaseModelOptions<T> & {
  int8id?: boolean;
  methods?: M;
  parent?: P;
  primaryKey?: K;
};

type ForeignKey<T> = T extends AttributeDefinition<Natural, infer E> ? () => Promise<E> : never;
type ModelWithMetods<A extends AttributesDefinition, M> = { [a in keyof A]?: Native<A[a]> } & { [a in Keys<A> & string as `${a}Load`]?: ForeignKey<A[a]> } & M;
type Model<A extends AttributesDefinition> = { [a in keyof A]?: Native<A[a]> } & { [a in Keys<A> & string as `${a}Load`]?: ForeignKey<A[a]> };
type Ancestor<A, N extends Natural, T extends Entry> = (new () => T) & { [a in keyof A]?: Meta<Native<A[a]>, T> } & { load: (boh: boolean) => Promise<T[]> } & Meta<N, T>;

export interface SchemaOptions {
  log?: ((message: string) => void) | null;
  sync?: boolean;
}

const allowedOption = ["indexes", "init", "int8id", "methods", "parent", "primaryKey", "sync", "tableName", "type"];

const reservedNames = [
  ...["attributeName", "base", "class", "constructor", "defaultValue", "entry", "fieldName", "init", "isModel"],
  ...["load", "meta", "methods", "name", "primaryKey", "prototype", "save", "size", "tableName", "type"]
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

  DATETIME(): Type<Date, unknown> {
    return new Type({ base: Date, type: "DATETIME" });
  }

  FKEY<N extends Natural, E extends Entry>(attribute: Type<N, E>): Type<N, E> {
    const { attributeName, base, fieldName, size, tableName, type } = attribute as never;

    return new Type({ base, foreignKey: { attributeName, fieldName, tableName }, size, type });
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

  model<A extends AttributesDefinition, M extends Methods<T>, T extends Entry & { id?: string } & ModelWithMetods<A, M>>(
    name: string,
    attributes: A,
    options?: BaseModelOptions<T> & { int8id: true; methods: M }
  ): Ancestor<A, string, T>;
  model<A extends AttributesDefinition, K extends keyof A, M extends Methods<T>, N extends K extends keyof A ? Native<A[K]> : never, T extends Entry & ModelWithMetods<A, M>>(
    name: string,
    attributes: A,
    options?: BaseModelOptions<T> & { methods: M; primaryKey: K }
  ): Ancestor<A, N, T>;
  model<A extends AttributesDefinition, M extends Methods<T>, P extends Meta<Natural, Entry>, N extends P extends Meta<infer N, Entry> ? N : never, T extends Parent<P> & ModelWithMetods<A, M>>(
    name: string,
    attributes: A,
    options?: BaseModelOptions<T> & { methods: M; parent: P }
  ): Ancestor<A, N, T>;
  model<A extends AttributesDefinition, M extends Methods<T>, T extends Entry & { id?: number } & ModelWithMetods<A, M>>(
    name: string,
    attributes: A,
    options?: BaseModelOptions<T> & { methods: M }
  ): Ancestor<A, number, T>;
  model<A extends AttributesDefinition, T extends Entry & { id?: string } & Model<A>>(name: string, attributes: A, options?: BaseModelOptions<T> & { int8id: true }): Ancestor<A, string, T>;
  model<A extends AttributesDefinition, K extends keyof A, N extends K extends keyof A ? Native<A[K]> : never, T extends Entry & Model<A>>(
    name: string,
    attributes: A,
    options?: BaseModelOptions<T> & { primaryKey: K }
  ): Ancestor<A, N, T>;
  model<A extends AttributesDefinition, P extends Meta<Natural, Entry>, N extends P extends Meta<infer N, Entry> ? N : never, T extends Parent<P> & Model<A>>(
    name: string,
    attributes: A,
    options?: BaseModelOptions<T> & { parent: P }
  ): Ancestor<A, N, T>;
  model<A extends AttributesDefinition, T extends Entry & { id?: number } & Model<A>>(name: string, attributes: A, options?: BaseModelOptions<T>): Ancestor<A, number, T>;
  model<A extends AttributesDefinition, K extends string, M extends Methods<T>, N extends Natural, P extends Meta<Natural, Entry>, T extends Entry &(Model<A> | ModelWithMetods<A, M>)>(
    name: string,
    attributes: A,
    options?: ModelOptions<K, M, P, T>
  ): Ancestor<A, N, T> {
    if(typeof name !== "string") throw new Error("Sedentary.model: 'name' argument: Wrong type, expected 'string'");
    if(this.models[name]) throw new Error(`Sedentary.model: '${name}' model: Model already defined`);
    if(! attributes) attributes = {} as A;
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
    let aarray: Attribute<Natural, unknown>[] = int8id
      ? [new Attribute<string, unknown>({ ...this.INT8(), attributeName: "id", fieldName: "id", notNull: true, tableName, unique: true })]
      : [new Attribute<number, unknown>({ ...this.INT(4), attributeName: "id", fieldName: "id", notNull: true, tableName, unique: true })];
    let iarray: Index[] = [{ fields: ["id"], indexName: `${tableName}_id_unique`, type: "btree", unique: true }];
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

      const call = (defaultValue: unknown, fieldName: string, notNull: boolean, unique: boolean, func: () => Type<Natural, unknown>, message1: string, message2: string) => {
        if(func === this.FKEY) throw new Error(`${message1} 'this.FKEY' can't be used directly`);
        if(func !== this.DATETIME && func !== this.INT && func !== this.INT8 && func !== this.VARCHAR) throw new Error(`${message1} ${message2}`);

        return new Attribute({ attributeName, defaultValue, fieldName, notNull, tableName, unique, ...func() });
      };

      const attributeDefinition = attributes[attributeName];
      let { base, defaultValue, fieldName, foreignKey, notNull, size, type, unique } = ((): Attribute<Natural, unknown> => {
        const ret = ((): Attribute<Natural, unknown> => {
          if(attributeDefinition instanceof Type) return new Attribute({ attributeName, fieldName: attributeName, notNull: false, tableName, ...attributeDefinition });
          if(attributeDefinition instanceof Function) return call(undefined, attributeName, false, false, attributeDefinition, `Sedentary.model: '${name}' model: '${attributeName}' attribute:`, "Wrong type, expected 'Attribute'");
          if(! (attributeDefinition instanceof Object)) throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: Wrong attribute type, expected 'Attribute'`);

          const attributeDefaults = { defaultValue: undefined, fieldName: attributeName, notNull: false, unique: false, ...attributeDefinition } as AttributeOptions<Natural, unknown>;
          const { defaultValue, fieldName, notNull, unique, type } = attributeDefaults;

          if(defaultValue === null) throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: 'defaultValue' option: Does 'null' default value really makes sense?`);
          if(typeof fieldName !== "string") throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: 'fieldName' option: Wrong type, expected 'string'`);
          if(typeof notNull !== "boolean") throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: 'notNull' option: Wrong type, expected 'boolean'`);
          if(typeof unique !== "boolean") throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: 'unique' option: Wrong type, expected 'boolean'`);
          if(type === undefined) throw new Error(`Sedentary.model: '${name}' model: '${attributeName}' attribute: Missing 'type' option`);
          if(type instanceof Type) return new Attribute({ attributeName, defaultValue, fieldName, notNull, tableName, unique, ...type });
          if(type instanceof Function) return call(defaultValue, fieldName, notNull, unique, type, `Sedentary.model: '${name}' model: '${attributeName}' attribute: 'type' option:`, "Wrong type, expected 'Type'");

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

      console.log("ffkk", foreignKey);

      if(primaryKey === (attributeName as never)) {
        notNull = true;
        unique = true;
      }

      if(defaultValue) notNull = true;

      const attribute = new Attribute({ attributeName, base, defaultValue, fieldName, foreignKey, notNull, size, tableName, type, unique });

      aarray.push(attribute);
      if(foreignKey) constraints.push({ attribute, constraintName: `fkey_${fieldName}_${foreignKey.tableName}_${foreignKey.fieldName}`, type: "f" });
      if(unique) iarray.push({ fields: [fieldName], indexName: `${tableName}_${fieldName}_unique`, type: "btree", unique: true });
    }

    if(indexes) {
      const flds = attributes;

      if(! (indexes instanceof Object)) throw new Error(`Sedentary.model: '${name}' model: 'indexes' option: Wrong type, expected 'Object'`);

      for(const indexName in indexes) {
        if(iarray.filter(_ => _.indexName === indexName).length !== 0) throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: index name already inferred by the unique constraint on an attribute`);

        const idx = indexes[indexName];
        const checkAttribute = (attribute: string, l: number): void => {
          if(typeof attribute !== "string") throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: #${l + 1} attribute: Wrong type, expected 'string'`);
          if(! (attribute in flds)) throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: #${l + 1} attribute: Unknown attribute '${attribute}'`);
        };

        let attributes: IndexAttributes;
        let type: "btree" | "hash" = "btree";
        let unique = false;

        if(idx instanceof Array) {
          idx.forEach(checkAttribute);
          attributes = idx;
        } else if(typeof idx === "string") {
          checkAttribute(idx, 0);
          attributes = [idx];
        } else if(idx instanceof Object) {
          for(const k in idx) if(["attributes", "type", "unique"].indexOf(k) === -1) throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: Unknown index option '${k}'`);

          ({ attributes, type, unique } = { type: "btree", unique: false, ...idx });

          if(! attributes) throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: Missing 'attributes' option`);
          if(attributes instanceof Array) attributes.forEach(checkAttribute);
          else if(typeof attributes === "string") {
            checkAttribute(attributes, 0);
            attributes = [attributes];
          } else throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: 'attributes' option: Wrong type, expected 'FieldNames'`);

          if(typeof type !== "string") throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: 'type' option: Wrong type, expected 'string'`);
          if(["btree", "hash"].indexOf(type) === -1) throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: 'type' option: Wrong value, expected 'btree' or 'hash'`);
          if(typeof unique !== "boolean") throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: 'unique' option: Wrong type, expected 'boolean'`);
        } else throw new Error(`Sedentary.model: '${name}' model: '${indexName}' index: Wrong type, expected 'Object'`);

        iarray.push({ fields: attributes, indexName, type, unique });
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

    const flds: { [a in keyof A]?: Meta<Native<A[a]>, T> } = {};

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

    return Class as Ancestor<A, N, T>;
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
