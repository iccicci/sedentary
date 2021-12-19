import { Attribute, Constraint, DB, EntryBase, ForeignKeyOptions, Index, Meta, Natural, Table, Type } from "./lib/db";
import { createLogger } from "./lib/log";
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

type Methods<E> = { [key: string]: (this: E) => unknown };

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
export type IndexesDefinition = { [key: string]: IndexDefinition };

type BaseModelOptions<B extends boolean, T> = {
  indexes?: IndexesDefinition;
  init?: (this: T) => void;
  int8id?: B;
  sync?: boolean;
  tableName?: string;
};

export type ModelOptions<B extends boolean, K extends string, M extends Methods<T>, P extends Meta<Natural, EntryBase>, T extends EntryBase> = BaseModelOptions<B, T> & {
  methods?: M;
  parent?: P;
  primaryKey?: K;
};

type ModelBaseOptions = {
  indexes?: IndexesDefinition;
  sync?: boolean;
  tableName?: string;
};

export type ModelOptions2 = ModelBaseOptions & {
  int8id?: boolean;
  parent?: Type<Natural, EntryBase>;
  primaryKey?: string;
};

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
type EntryIdNatural<B extends boolean> = IsUnion<B> extends true ? number : B extends true ? string : number;
export type EntryId<B extends boolean> = { id?: EntryIdNatural<B> };

type ForeignKey<A> = A extends AttributeDefinition<Natural, infer E> ? () => Promise<E> : never;
type ModelFKAttributes<A extends AttributesDefinition> = { [a in ForeignKeys<A> & string as `${a}Load`]?: ForeignKey<A[a]> };
type ModelBaseAttributes<A extends AttributesDefinition> = { [a in keyof A]?: Native<A[a]> };
type ModelAttributes<A extends AttributesDefinition> = keyof ModelFKAttributes<A> extends never ? ModelBaseAttributes<A> : ModelBaseAttributes<A> & ModelFKAttributes<A>;
type Ancestor<A, N extends Natural, T extends EntryBase> = (new () => T) & { [a in keyof A]?: Meta<Native<A[a]>, T> } & { load: (boh: boolean) => Promise<T[]> } & Meta<N, T> & { tmp: number };

type EntryFKAttributes<A extends AttributesDefinition> = { [a in ForeignKeys<A> & string as `${a}Load`]?: ForeignKey<A[a]> };
type EntryBaseAttributes<A extends AttributesDefinition> = { [a in keyof A]?: Native<A[a]> };
type EntryFullAttributes<A extends AttributesDefinition> = keyof EntryFKAttributes<A> extends never ? EntryBaseAttributes<A> : EntryBaseAttributes<A> & EntryFKAttributes<A>;
type EntryAttributes<A extends AttributesDefinition> = keyof A extends never ? EntryBase : EntryBase & EntryFullAttributes<A>;

type ModelBase<E extends EntryBase> = new () => E;
type Model<N extends Natural, E extends EntryBase> = ModelBase<E> & Type<N, E>;

export type Entry<M> = M extends new () => infer E ? E : never;

export interface SedentaryOptions {
  log?: ((message: string) => void) | null;
  serverless?: boolean;
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

    this.log = createLogger(log);
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
      this.log("Connecting:", e.message);
      throw e;
    }
  }

  async end(): Promise<void> {
    this.log("Closing connection...");
    await this.db.end();
    this.log("Connection closed");
  }

  model2<E extends EntryBase>(modelName: string): ModelBase<E>;
  model2<E extends EntryBase, M extends Record<string, <S extends M>(this: E & S) => unknown>>(modelName: string, methods: M & Record<string, (this: E & M) => void>): ModelBase<E & M>;
  model2<E extends EntryBase, M extends Record<string, <S extends M>(this: E & S) => unknown>>(modelName: string, methods?: M): ModelBase<E> {
    const ret = function(this: EntryBase) {
      this.save();
    };

    Object.defineProperty(ret, "name", { value: name });
    if(methods) Object.assign(ret.prototype, methods);

    return ret as unknown as ModelBase<E>;
  }
  /*
  model2<A extends AttributesDefinition, E extends EntryAttributes<A> & { id?: number }>(modelName: string, attributes: A, options?: ModelBaseOptions): Model<number, E>;
  model2<A extends AttributesDefinition, E extends EntryAttributes<A> & { id?: string }>(modelName: string, attributes: A, options: ModelBaseOptions & { int8id: true }): Model<string, E>;
  model2<A extends AttributesDefinition, E extends EntryAttributes<A> & { id?: number }, M extends Record<string, <S extends M>(this: E & S) => unknown>>(
    modelName: string,
    attributes: A,
    options: ModelBaseOptions,
    methods: M & Record<keyof M, (this: E & Partial<M>) => void>
  ): Model<number, E & Partial<M>>;
  model2<A extends AttributesDefinition, E extends EntryAttributes<A> & { id?: string }, M extends Record<string, <S extends M>(this: E & S) => unknown>>(
    modelName: string,
    attributes: A,
    options: ModelBaseOptions & { int8id: true },
    methods: M & Record<keyof M, (this: E & Partial<M>) => void>
  ): Model<string, E & Partial<M>>;
  model2<A extends AttributesDefinition, E extends EntryAttributes<A>, M extends Record<string, <S extends M>(this: E & S) => unknown>>(
    modelName: string,
    attributes: A,
    options?: ModelBaseOptions & { int8id: true },
    methods?: M & Record<string, (this: E & Partial<M>) => void>
  ): Model<Natural, E> {
    const ret = function(this: E) {};

    Object.defineProperty(ret, "name", { value: modelName });
    if(methods) Object.assign(ret.prototype, methods);

    return ret as unknown as Model<Natural, E>;
  }
  */

  model<A extends AttributesDefinition, B extends boolean, E extends EntryBase & EntryId<B> & ModelAttributes<A>>(
    modelName: string,
    attributes: A,
    options?: BaseModelOptions<B, E>
  ): Ancestor<A, string, E>;
  model<
    A extends AttributesDefinition,
    B extends boolean,
    K extends keyof A,
    P extends Meta<Natural, EntryBase>,
    N extends P extends { tmp: number } ? (P extends Meta<infer N, EntryBase> ? N : never) : Native<A[K]>,
    E extends (P extends { tmp: number } ? Parent<P> : EntryBase) & ModelAttributes<A>
  >(modelName: string, attributes: A, options?: BaseModelOptions<B, E> & { parent?: P; primaryKey?: K }): Ancestor<A, N, E>;
  model<A extends AttributesDefinition, B extends boolean, E extends EntryBase & EntryId<B> & ModelAttributes<A>, M extends Record<string, <S extends M>(this: E & S) => unknown>>(
    modelName: string,
    attributes: A,
    options: BaseModelOptions<B, E>,
    methods: M & Record<string, (this: E & M) => unknown>
  ): Ancestor<A, string, E & M>;
  model<
    A extends AttributesDefinition,
    B extends boolean,
    K extends keyof A,
    P extends Meta<Natural, EntryBase>,
    N extends P extends { tmp: number } ? (P extends Meta<infer N, EntryBase> ? N : never) : Native<A[K]>,
    E extends (P extends { tmp: number } ? Parent<P> : EntryBase) & ModelAttributes<A>,
    M extends Record<string, <S extends M>(this: E & S) => unknown>
  >(modelName: string, attributes: A, options: BaseModelOptions<B, E> & { parent?: P; primaryKey?: K }, methods: M & Record<string, (this: E & M) => unknown>): Ancestor<A, N, E & M>;
  model<
    A extends AttributesDefinition,
    B extends boolean,
    K extends string,
    N extends Natural,
    P extends Meta<Natural, EntryBase>,
    E extends EntryBase & ModelAttributes<A>,
    M extends Record<string, <S extends M>(this: E & S) => unknown>
  >(modelName: string, attributes: A, options?: ModelOptions<B, K, M, P, E>, methods?: M & Record<string, (this: E & M) => unknown>): Ancestor<A, N, E & M> {
    if(typeof modelName !== "string") throw new Error("Sedentary.model: 'name' argument: Wrong type, expected 'string'");
    if(this.models[modelName]) throw new Error(`Sedentary.model: '${modelName}' model: Model already defined`);
    if(! attributes) attributes = {} as A;
    if(! (attributes instanceof Object)) throw new Error(`Sedentary.model: '${modelName}' model: 'attributes' argument: Wrong type, expected 'Object'`);
    if(! options) options = {};
    if(! (options instanceof Object)) throw new Error(`Sedentary.model: '${modelName}' model: 'options' argument: Wrong type, expected 'Object'`);

    for(const k in options) if(! allowedOption.includes(k)) throw new Error(`Sedentary.model: '${modelName}' model: 'options' argument: Unknown '${k}' option`);
    if(options.int8id && options.parent) throw new Error(`Sedentary.model: '${modelName}' model: 'int8id' and 'parent' options conflict each other`);
    if(options.int8id && options.primaryKey) throw new Error(`Sedentary.model: '${modelName}' model: 'int8id' and 'primaryKey' options conflict each other`);
    if(options.parent && options.primaryKey) throw new Error(`Sedentary.model: '${modelName}' model: 'parent' and 'primaryKey' options conflict each other`);

    let autoIncrement = true;
    const { indexes, int8id, parent, primaryKey, sync, tableName } = { sync: this.sync, tableName: modelName, ...options };
    let aarray: Attribute<Natural, unknown>[] = int8id
      ? [new Attribute<string, unknown>({ ...this.INT8(), attributeName: "id", fieldName: "id", modelName, notNull: true, tableName, unique: true })]
      : [new Attribute<number, unknown>({ ...this.INT(4), attributeName: "id", fieldName: "id", modelName, notNull: true, tableName, unique: true })];
    let constraints: Constraint[] = [{ attribute: aarray[0], constraintName: `${tableName}_id_unique`, type: "u" }];
    const iarray: Index[] = [];
    const pk = aarray[0];

    if(methods && ! (methods instanceof Object)) throw new Error(`Sedentary.model: '${modelName}' model: 'methods' option: Wrong type, expected 'Object'`);

    const originalMethods = methods;

    if(parent) {
      try {
        if(! parent.isModel()) throw new Error();
      } catch(e) {
        throw new Error(`Sedentary.model: '${modelName}' model: 'parent' option: Wrong type, expected 'Model'`);
      }

      methods = (methods ? { ...(parent.methods || {}), ...methods } : parent.methods) as never;
    }

    if(primaryKey && typeof primaryKey !== "string") throw new Error(`Sedentary.model: '${modelName}' model: 'primaryKey' option: Wrong type, expected 'string'`);
    if(primaryKey && ! Object.keys(attributes).includes(primaryKey)) throw new Error(`Sedentary.model: '${modelName}' model: 'primaryKey' option: Attribute '${primaryKey}' does not exists`);

    if(parent || primaryKey) {
      autoIncrement = false;
      aarray = [];
      constraints = [];
    }

    for(const attributeName of Object.keys(attributes).sort()) {
      if(reservedNames.includes(attributeName)) throw new Error(`Sedentary.model: '${modelName}' model: '${attributeName}' attribute: Reserved name`);

      const call = (defaultValue: unknown, fieldName: string, notNull: boolean, unique: boolean, func: () => Type<Natural, unknown>, message1: string, message2: string) => {
        if(func === this.FKEY) throw new Error(`${message1} 'this.FKEY' can't be used directly`);
        if(func !== this.DATETIME && func !== this.INT && func !== this.INT8 && func !== this.VARCHAR) throw new Error(`${message1} ${message2}`);

        return new Attribute({ attributeName, defaultValue, fieldName, modelName, notNull, tableName, unique, ...func() });
      };

      const attributeDefinition = attributes[attributeName];
      let { base, defaultValue, fieldName, foreignKey, notNull, size, type, unique } = ((): Attribute<Natural, unknown> => {
        const ret = ((): Attribute<Natural, unknown> => {
          if(attributeDefinition instanceof Type) return new Attribute({ attributeName, fieldName: attributeName, modelName, notNull: false, tableName, ...attributeDefinition });
          if(attributeDefinition instanceof Function) return call(undefined, attributeName, false, false, attributeDefinition, `Sedentary.model: '${modelName}' model: '${attributeName}' attribute:`, "Wrong type, expected 'Attribute'");
          if(! (attributeDefinition instanceof Object)) throw new Error(`Sedentary.model: '${modelName}' model: '${attributeName}' attribute: Wrong attribute type, expected 'Attribute'`);

          const attributeDefaults = { defaultValue: undefined, fieldName: attributeName, notNull: false, unique: false, ...attributeDefinition } as AttributeOptions<Natural, unknown>;
          const { defaultValue, fieldName, notNull, unique, type } = attributeDefaults;

          if(defaultValue === null) throw new Error(`Sedentary.model: '${modelName}' model: '${attributeName}' attribute: 'defaultValue' option: Does 'null' default value really makes sense?`);
          if(typeof fieldName !== "string") throw new Error(`Sedentary.model: '${modelName}' model: '${attributeName}' attribute: 'fieldName' option: Wrong type, expected 'string'`);
          if(typeof notNull !== "boolean") throw new Error(`Sedentary.model: '${modelName}' model: '${attributeName}' attribute: 'notNull' option: Wrong type, expected 'boolean'`);
          if(typeof unique !== "boolean") throw new Error(`Sedentary.model: '${modelName}' model: '${attributeName}' attribute: 'unique' option: Wrong type, expected 'boolean'`);
          if(type === undefined) throw new Error(`Sedentary.model: '${modelName}' model: '${attributeName}' attribute: Missing 'type' option`);
          if(type instanceof Type) return new Attribute({ attributeName, defaultValue, fieldName, modelName, notNull, tableName, unique, ...type });
          if(type instanceof Function) return call(defaultValue, fieldName, notNull, unique, type, `Sedentary.model: '${modelName}' model: '${attributeName}' attribute: 'type' option:`, "Wrong type, expected 'Type'");

          throw new Error(`Sedentary.model: '${modelName}' model: '${attributeName}' attribute: 'type' option: Wrong type, expected 'Type'`);
        })();

        const { base, defaultValue } = ret;

        if(defaultValue !== undefined) {
          if(base === Date && ! (defaultValue instanceof Date)) throw new Error(`Sedentary.model: '${modelName}' model: '${attributeName}' attribute: 'defaultValue' option: Wrong type, expected 'Date'`);
          if(base === Number && typeof defaultValue !== "number") throw new Error(`Sedentary.model: '${modelName}' model: '${attributeName}' attribute: 'defaultValue' option: Wrong type, expected 'number'`);
          if(base === String && typeof defaultValue !== "string") throw new Error(`Sedentary.model: '${modelName}' model: '${attributeName}' attribute: 'defaultValue' option: Wrong type, expected 'string'`);
        }

        return ret;
      })();

      if(foreignKey) {
        if(! foreignKey.options) foreignKey.options = {};
        if(! (foreignKey.options instanceof Object)) throw new Error(`Sedentary.FKEY: '${modelName}' model: '${attributeName}' attribute: Wrong options type, expected 'Object'`);
        for(const k in foreignKey.options) if(! ["onDelete", "onUpdate"].includes(k)) throw new Error(`Sedentary.FKEY: '${modelName}' model: '${attributeName}' attribute: Unknown option '${k}'`);

        for(const onChange of ["onDelete", "onUpdate"]) {
          const actions = ["cascade", "no action", "restrict", "set default", "set null"];
          let action = foreignKey.options[onChange];

          if(! action) action = foreignKey.options[onChange] = "no action";
          if(action && ! actions.includes(action)) throw new Error(`Sedentary.FKEY: '${modelName}' model: '${attributeName}' attribute: '${onChange}' option: Wrong value, expected ${actions.map(_ => `'${_}'`).join(" | ")}`);
        }
      }

      if(primaryKey === (attributeName as never)) {
        notNull = true;
        unique = true;
      }

      if(defaultValue) notNull = true;

      const attribute = new Attribute({ attributeName, base, defaultValue, fieldName, foreignKey, modelName, notNull, size, tableName, type, unique });

      aarray.push(attribute);
      if(foreignKey) constraints.push({ attribute, constraintName: `fkey_${fieldName}_${foreignKey.tableName}_${foreignKey.fieldName}`, type: "f" });
      if(unique) constraints.push({ attribute, constraintName: `${tableName}_${fieldName}_unique`, type: "u" });
    }

    if(indexes) {
      const flds = attributes;

      if(! (indexes instanceof Object)) throw new Error(`Sedentary.model: '${modelName}' model: 'indexes' option: Wrong type, expected 'Object'`);

      for(const indexName in indexes) {
        if(aarray.filter(({ fieldName, unique }) => unique && `${tableName}_${fieldName}_unique` === indexName).length !== 0) throw new Error(`Sedentary.model: '${modelName}' model: '${indexName}' index: index name already inferred by the unique constraint on an attribute`);

        const idx = indexes[indexName];
        const checkAttribute = (attribute: string, l: number): void => {
          if(typeof attribute !== "string") throw new Error(`Sedentary.model: '${modelName}' model: '${indexName}' index: #${l + 1} attribute: Wrong type, expected 'string'`);
          if(! (attribute in flds)) throw new Error(`Sedentary.model: '${modelName}' model: '${indexName}' index: #${l + 1} attribute: Unknown attribute '${attribute}'`);
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
          for(const k in idx) if(! ["attributes", "type", "unique"].includes(k)) throw new Error(`Sedentary.model: '${modelName}' model: '${indexName}' index: Unknown index option '${k}'`);

          ({ attributes, type, unique } = { type: "btree", unique: false, ...idx });

          if(! attributes) throw new Error(`Sedentary.model: '${modelName}' model: '${indexName}' index: Missing 'attributes' option`);
          if(attributes instanceof Array) attributes.forEach(checkAttribute);
          else if(typeof attributes === "string") {
            checkAttribute(attributes, 0);
            attributes = [attributes];
          } else throw new Error(`Sedentary.model: '${modelName}' model: '${indexName}' index: 'attributes' option: Wrong type, expected 'FieldNames'`);

          if(typeof type !== "string") throw new Error(`Sedentary.model: '${modelName}' model: '${indexName}' index: 'type' option: Wrong type, expected 'string'`);
          if(! ["btree", "hash"].includes(type)) throw new Error(`Sedentary.model: '${modelName}' model: '${indexName}' index: 'type' option: Wrong value, expected 'btree' or 'hash'`);
          if(typeof unique !== "boolean") throw new Error(`Sedentary.model: '${modelName}' model: '${indexName}' index: 'unique' option: Wrong type, expected 'boolean'`);
        } else throw new Error(`Sedentary.model: '${modelName}' model: '${indexName}' index: Wrong type, expected 'Object'`);

        iarray.push({ fields: attributes, indexName, type, unique });
      }
    }

    this.db.tables.push(new Table({ autoIncrement, constraints, attributes: aarray, indexes: iarray, parent, sync, tableName }));
    this.models[modelName] = true;

    const init = parent
      ? options.init
        ? function() {
          parent.init.call(this);
          options.init.call(this);
        }
        : parent.init
      : options.init;

    class Class {
      constructor() {
        if(init) init.call(this);
      }

      save(): Promise<boolean> {
        return new Promise((resolve, reject) => {
          const save = (): void => reject(new Error("eh no"));
          Object.defineProperty(save, "name", { value: modelName + ".save" });

          setTimeout(save, 10);
        });
      }
    }

    const load: (boh: boolean) => Promise<(E & M)[]> = (boh: boolean) =>
      new Promise((resolve, reject) =>
        setTimeout(() => {
          if(boh) return resolve([new Class() as E & M]);
          reject(new Error("boh"));
        }, 10)
      );
    Object.defineProperty(load, "name", { value: modelName + ".load" });

    const metaAttributes: { [key: string]: Attribute<Natural, unknown> } = aarray.reduce((ret, curr) => {
      ret[curr.attributeName] = curr;
      return ret;
    }, {});
    const metaForeignKeys = aarray
      .filter(_ => _.foreignKey)
      .reduce((ret, curr) => {
        ret[curr.attributeName] = curr;
        return ret;
      }, {});
    const meta = new Meta<N, E & M>({ base: Number, attributes: metaAttributes, foreignKeys: metaForeignKeys, modelName, parent: parent as never, type: "meta", tableName, primaryKey, init, methods });

    for(const foreignKey in metaForeignKeys) {
      if(foreignKey + "Load" in metaAttributes) throw new Error(`Sedentary.model: '${modelName}' model: '${foreignKey}' attribute: '${foreignKey}Load' inferred methods conflicts with an attribute`);
      if(originalMethods && foreignKey + "Load" in originalMethods) throw new Error(`Sedentary.model: '${modelName}' model: '${foreignKey}' attribute: '${foreignKey}Load' inferred methods conflicts with a method`);
    }

    if(originalMethods) for(const method in originalMethods) if(method in metaAttributes) throw new Error(`Sedentary.model: '${modelName}' model: '${method}' method: conflicts with an attribute`);

    const checkParent = (parent: Meta<Natural, unknown>) => {
      if(! parent) return;

      for(const attribute in metaAttributes) {
        if(attribute in parent.attributes) throw new Error(`Sedentary.model: '${modelName}' model: '${attribute}' attribute: conflicts with an attribute of '${parent.modelName}' model`);
        if(parent.methods && attribute in parent.methods) throw new Error(`Sedentary.model: '${modelName}' model: '${attribute}' attribute: conflicts with a method of '${parent.modelName}' model`);

        for(const foreignKey in parent.foreignKeys) if(attribute === foreignKey + "Load") throw new Error(`Sedentary.model: '${modelName}' model: '${attribute}' attribute: conflicts with an inferred methods of '${parent.modelName}' model`);
      }

      for(const foreignKey in metaForeignKeys) {
        if(foreignKey + "Load" in parent.attributes) throw new Error(`Sedentary.model: '${modelName}' model: '${foreignKey}' attribute: '${foreignKey}Load' inferred methods conflicts with an attribute of '${parent.modelName}' model`);
        if(parent.methods && foreignKey + "Load" in parent.methods) throw new Error(`Sedentary.model: '${modelName}' model: '${foreignKey}' attribute: '${foreignKey}Load' inferred methods conflicts with a method of '${parent.modelName}' model`);
      }

      if(originalMethods) {
        for(const method in originalMethods) {
          if(method in parent.attributes) throw new Error(`Sedentary.model: '${modelName}' model: '${method}' method: conflicts with an attribute of '${parent.modelName}' model`);
          for(const foreignKey in parent.foreignKeys) if(foreignKey + "Load" === method) throw new Error(`Sedentary.model: '${modelName}' model: '${method}' method: conflicts with an inferred methods of '${parent.modelName}' model`);
          if(parent.methods && method in parent.methods) throw new Error(`Sedentary.model: '${modelName}' model: '${method}' method: conflicts with a method of '${parent.modelName}' model`);
        }
      }

      checkParent(parent.parent);
    };

    checkParent(parent);

    Object.defineProperty(Class, "isModel", { value: () => true });
    Object.defineProperty(Class, "load", { value: load });
    Object.defineProperty(Class, "meta", { value: meta });
    Object.defineProperty(Class, "name", { value: modelName });
    Object.defineProperty(Class.prototype.save, "name", { value: modelName + ".save" });
    Object.assign(Class, meta);
    Object.assign(Class.prototype, methods);
    for(const attribute of aarray) Object.defineProperty(Class, attribute.attributeName, { value: attribute });
    for(const key of ["attributeName", "base", "fieldName", "modelName", "size", "type", "unique"]) Object.defineProperty(Class, key, { value: pk[key] });

    return Class as Ancestor<A, N, E & M>;
  }
}

export const Package = Sedentary;

const db = new Sedentary("gino");

const Users = db.model("User", { foo: db.INT(), bar: { type: db.VARCHAR(), unique: true } }, {});

class Item extends db.model(
  "Item",
  {
    num: db.FKEY(Users),
    str: db.VARCHAR()
  },
  {
    init: function(): void {
      this.num = "0";
      this.str = "0";
    },
    int8id: true
    /*
    methods: {
      prova: (): string => "ok"
    }
    */
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
    parent: Item
    /*
    init:   async function() {
      this.n = "23";
      this.id = 0;
      this.num = 0;
      const a = this.nLoad ? await this.nLoad() : { prova: (): null => null };
      a.prova();
      this.prova();
    }
    */
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
  { b: { type: db.FKEY(Next), unique: true } },
  {
    init: function() {
      this.b = 24;
    }
  }
) {}

class Last extends db.model(
  "Last",
  { c: db.FKEY(Current.b) },
  {
    init: function() {
      this.c = 24;
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
    //console.log(new Next(), Next.load, await Next.load(true), new Last(), item.prova());
  }

  return true;
})();

/*
export let factory = () => {
    class Foo {
        a = 3;
        b = 'bar'
        c?: boolean
    }
    return Foo as (new () => { [key in keyof Foo]: Foo[key] })
};

export const FooConstr = factory()
export type TypeExtractor<T> = T extends (new() => infer E) ? E : never;
export type FooType = TypeExtractor<typeof FooConstr>;

const foo = new FooConstr()

function rino(a:FooType){
    if(a instanceof FooConstr){console.log("sisi")}
    if(a instanceof FooType){console.log("sisi")}
}

rino(foo);


B.prototype instanceof A
*/

/*
interface EntryBase {
  save: () => Promise<boolean>;
}

type BaseModelOptions2 = {
  indexes?: IndexesDefinition;
  sync?: boolean;
  tableName?: string;
};

export type ModelOptions2 = BaseModelOptions2 & {
  int8id?: boolean;
  primaryKey?: string;
};

type Methods2<E> = Record<string, (this: E) => unknown>;

type Model2<E> = new () => E;

function model<A extends AttributesDefinition, E extends EntryBase>(modelName: string, attributes: A, options?: ModelOptions2): Model2<E>;
function model<A extends AttributesDefinition, E extends EntryBase, M extends Record<string, <S extends M>(this: E & S) => unknown>>(
  modelName: string,
  attributes: A,
  options: ModelOptions2,
  methods: M,
  useless: (this: E & M) => void
): Model2<E & M>;
function model<A extends AttributesDefinition, E extends EntryBase, M extends Record<string, <S extends M>(this: E & S) => unknown>>(
  modelName: string,
  attributes: A,
  options?: ModelOptions2,
  methods?: M,
  useless?: (this: E & M) => void
): Model2<E> {
  const model = function() {};

  Object.defineProperty(model, "name", { value: modelName });

  if(methods) for(const method in methods) Object.defineProperty(model.prototype, method, { value: methods[method] });

  return model as unknown as Model2<E>;
}

const T1 = model("T1", {});
const t1 = new T1();
console.log(t1);

const T2 = model(
  "T2",
  { a: db.INT, b: db.VARCHAR },
  {},
  {
    test: function() {
      this.test();
      return "test";
    }
  },
  function() {
    this.test();
  }
);
const t2 = new T1();
console.log(t2);
*/

interface BaseId<B extends boolean> {
  id?: B extends true ? string : number;
}

type Model2<E> = new () => E;

function model<A extends AttributesDefinition, B extends boolean, E extends EntryBase & BaseId<false> & ModelAttributes<A>>(
  modelName: string,
  attributes: A,
  options?: BaseModelOptions<B, E>
): Model2<E> & Type<number, E>;
function model<A extends AttributesDefinition, B extends boolean, E extends EntryBase & BaseId<true> & ModelAttributes<A>>(
  modelName: string,
  attributes: A,
  options?: BaseModelOptions<B, E> & { int8id: true }
): Model2<E> & Type<string, E>;
function model<A extends AttributesDefinition, B extends boolean, E extends EntryBase & BaseId<false> & ModelAttributes<A>, M extends Record<string, <S extends M>(this: E & S) => unknown>>(
  modelName: string,
  attributes: A,
  options: BaseModelOptions<B, E>,
  methods: M & Record<string, (this: E & M) => unknown>
): Model2<E & M> & Type<number, E>;
function model<A extends AttributesDefinition, B extends boolean, E extends EntryBase & BaseId<true> & ModelAttributes<A>, M extends Record<string, <S extends M>(this: E & S) => unknown>>(
  modelName: string,
  attributes: A,
  options: BaseModelOptions<B, E> & { int8id: true },
  methods: M & Record<string, (this: E & M) => unknown>
): Model2<E & M> & Type<string, E>;
function model<A extends AttributesDefinition, B extends boolean, E extends EntryBase, M extends Record<string, <S extends M>(this: E & S) => unknown>>(
  modelName: string,
  attributes: A,
  options?: BaseModelOptions<B, E> & { int8id?: boolean },
  methods?: M
): Model2<E> {
  const model = function() {};

  Object.defineProperty(model, "name", { value: modelName });
  if(methods) Object.assign(model.prototype, methods);

  return model as unknown as Model2<E>;
}

const T1 = model("T1", {});
const t1 = new T1();
t1.id = 0;
console.log(t1);

const T2 = model(
  "T2",
  { a: db.INT, b: db.VARCHAR },
  { int8id: true },
  {
    test: function(repeat = true) {
      if(repeat) this.b = this.test(false);
      this.c = this.a = 0;

      return "test";
    }
  }
);
type ET2 = Entry<typeof T2>;
const t2 = new T2();
//t2.id = "0";
const tt2 = (t: ET2) => console.log(t, t.test(), t.a, t.b);
tt2(t2);

export class Sedentary2 {
  model<E extends EntryBase>(modelName: string): ModelBase<E>;
  model<E extends EntryBase, M extends Record<string, <S extends M>(this: E & S) => unknown>>(modelName: string, methods: M & Record<string, (this: E & M) => void>): ModelBase<E & M>;
  model<E extends EntryBase, M extends Record<string, <S extends M>(this: E & S) => unknown>>(modelName: string, methods?: M): ModelBase<E> {
    const ret = function(this: EntryBase) {};

    Object.defineProperty(ret, "name", { value: modelName });
    if(methods) Object.assign(ret.prototype, methods);
    ret.prototype.save = () => new Promise(resolve => resolve(false));

    return ret as unknown as ModelBase<E>;
  }
}

const db2 = new Sedentary2();

const T22 = db2.model("T2", {
  c: function() {
    this.id = "0";
    this.c();
    return 0;
  }
});
