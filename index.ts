import { Attribute, Constraint, DB, EntryBase, ForeignKeyOptions, Index, Natural, Table, Type } from "./db";

export { EntryBase, ForeignKeyActions, ForeignKeyOptions, Natural, Type } from "./db";
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
  parent?: Attribute<Natural, EntryBase>;
  primaryKey?: string;
}

type ConditionAttribute<N extends Natural> = N | [">" | "<" | ">=" | "<=" | "<>", N] | ["IN", ...N[]] | ["IS NULL"] | ["LIKE", string];
type ConditionBase<A extends AttributesDefinition> = string | { [a in keyof A]?: ConditionAttribute<Native<A[a]>> };
type Condition<A extends AttributesDefinition> = ConditionBase<A> | ["NOT", Condition<A>] | ["AND", ...Condition<A>[]] | ["OR", ...Condition<A>[]];

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
type BaseKeyType<B extends boolean> = IsUnion<B> extends true ? number : B extends true ? string : number;
type KeyType<B extends boolean, P extends ModelStd> = P extends new () => EntryBase ? (P extends Attribute<infer T, EntryBase> ? T : never) : BaseKeyType<B>;

type ForeignKey<A> = A extends AttributeDefinition<Natural, infer E> ? () => Promise<E> : never;
type EntryBaseAttributes<A extends AttributesDefinition> = { [a in keyof A]?: Native<A[a]> };

type EntryMethodsBase<P extends ModelStd> = P extends new () => EntryBase ? P["methods"] : EntryBase;
type EntryMethodsFK<A extends AttributesDefinition> = { [a in ForeignKeys<A> & string as `${a}Load`]: ForeignKey<A[a]> };
type EntryMethods<A extends AttributesDefinition, P extends ModelStd> = keyof EntryMethodsFK<A> extends never ? EntryMethodsBase<P> : EntryMethodsBase<P> & EntryMethodsFK<A>;

type ModelAttributesIf<A extends AttributesDefinition, T> = keyof A extends never ? T : T & A;
type ModelAttributes<A extends AttributesDefinition, B extends boolean, K extends string, P extends ModelStd> = K extends keyof A
  ? A
  : ModelAttributesIf<A, P extends new () => EntryBase ? P["attributes"] : { id: Type<BaseKeyType<B>, unknown> }>;

type ModelBase<N extends Natural, A extends AttributesDefinition, EA extends Record<string, Natural | undefined>, EM extends EntryBase, E extends EntryBase> = (new (from?: EA) => E) &
  Attribute<N, E> & { attributes: A; foreignKeys: Record<string, boolean>; methods: EM; parent?: ModelStd; tableName: string; load: (where?: Condition<A>) => Promise<E[]> } & {
    [a in keyof A]: Attribute<Native<A[a]>, E>;
  };
type Model<N extends Natural, A extends AttributesDefinition, EM extends EntryBase> = ModelBase<N, A, EntryBaseAttributes<A>, EM, EntryBaseAttributes<A> & EM>;
type ModelStd = Attribute<Natural, EntryBase> & { attributes: AttributesDefinition; foreignKeys: Record<string, boolean>; methods: EntryBase; parent?: ModelStd };

export type Entry<M> = M extends new () => infer E ? E : never;
export type Where<M> = M extends { load: (where: infer T) => void } ? Exclude<T, undefined> : never;

export interface SedentaryOptions {
  autoSync?: boolean;
  log?: ((message: string) => void) | null;
  sync?: boolean;
}

const allowedOption = ["indexes", "int8id", "parent", "primaryKey", "sync", "tableName"];
const reservedNames = [
  ...["attributeName", "attributes", "base", "class", "construct", "constructor", "defaultValue", "entry", "fieldName", "foreignKeys", "load"],
  ...["loaded", "methods", "name", "postLoad", "postSave", "preLoad", "preSave", "primaryKey", "prototype", "save", "size", "tableName", "tx", "type"]
];

export class Sedentary {
  protected autoSync: boolean;
  protected db: DB;
  protected log: (...data: unknown[]) => void;
  protected sync = true;

  private models: { [key: string]: boolean } = {};

  constructor(options?: SedentaryOptions) {
    if(! options) options = {};
    if(! (options instanceof Object)) throw new Error("new Sedentary: 'options' argument: Wrong type, expected 'Object'");

    for(const k in options) if(! ["autoSync", "log", "sync"].includes(k)) throw new Error(`new Sedentary: 'options' argument: Unknown '${k}' option`);

    const { autoSync, log, sync } = { autoSync: true, sync: true, ...options };

    if(typeof autoSync !== "boolean") throw new Error("new Sedentary: 'autoSync' option: Wrong type, expected 'boolean'");
    if(log !== null && log !== undefined && ! (log instanceof Function)) throw new Error("new Sedentary: 'log' option: Wrong type, expected 'null' or 'Function'");
    if(typeof sync !== "boolean") throw new Error("new Sedentary: 'sync' option: Wrong type, expected 'boolean'");

    this.autoSync = autoSync;
    this.db = null as unknown as DB;
    // eslint-disable-next-line no-console
    this.log = log ? log : log === null ? () => {} : console.log;
    this.sync = sync;
  }

  DATETIME(): Type<Date, unknown> {
    return new Type({ base: Date, type: "DATETIME" });
  }

  FKEY<N extends Natural, E extends EntryBase>(attribute: Attribute<N, E>, options?: ForeignKeyOptions): Type<N, E> {
    const { attributeName, base, fieldName, size, tableName, type } = attribute;

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

  checkDB() {
    if(! this.db) throw new Error("Package sedentary can't be used directly. Please check: https://www.npmjs.com/package/sedentary#disclaimer");
  }

  checkSize(size: number, message: string): number {
    const str = size.toString();
    const parsed = parseInt(str, 10);

    if(str !== parsed.toString()) throw new Error(message);

    return parsed;
  }

  async connect(sync?: boolean): Promise<void> {
    try {
      this.checkDB();

      this.log("Connecting...");
      await this.db.connect();
      this.log("Connected");

      if(this.autoSync || sync) {
        this.log("Syncing...");
        await this.db.syncDataBase();
        this.log("Synced");
      }
    } catch(e) {
      this.log("Connecting: " + (e instanceof Error ? e.message : JSON.stringify(e)));
      throw e;
    }
  }

  async end(): Promise<void> {
    this.log("Closing connection...");
    await this.db.end();
    this.log("Connection closed");
  }

  escape(value: Natural): string {
    return this.db.escape(value);
  }

  model<A extends AttributesDefinition, B extends boolean, K extends string, P extends ModelStd, EM extends EntryMethods<A, P>>(
    modelName: string,
    attributes: A,
    options?: BaseModelOptions & { int8id?: B; parent?: P; primaryKey?: K | keyof A }
  ): Model<K extends keyof A ? Native<A[K]> : KeyType<B, P>, ModelAttributes<A, B, K, P>, EM>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  model<
    A extends AttributesDefinition,
    B extends boolean,
    K extends string,
    P extends ModelStd,
    EA extends EntryBaseAttributes<ModelAttributes<A, B, K, P>>,
    EM extends EntryMethods<A, P>,
    M extends Record<string, <S extends M>(this: EA & EM & S, ...args: any[]) => void>
  >(
    modelName: string,
    attributes: A,
    options: BaseModelOptions & { int8id?: B; parent?: P; primaryKey?: K | keyof A },
    methods: M & Record<keyof M, (this: EA & EM & M, ...args: any[]) => void>
  ): Model<K extends keyof A ? Native<A[K]> : KeyType<B, P>, ModelAttributes<A, B, K, P>, EM & M>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  model<A extends AttributesDefinition, P extends ModelStd, M extends Record<string,() => void>>(
    modelName: string,
    attributes: A,
    options?: ModelOptions & { parent?: P & (new () => EntryBase) },
    methods?: M
  ): Model<Natural, A, EntryBase> {
    this.checkDB();

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

    if(! methods) methods = {} as M;
    if(! (methods instanceof Object)) throw new Error(`Sedentary.model: '${modelName}' model: 'methods' option: Wrong type, expected 'Object'`);

    if(parent) if(! parent.attributes) throw new Error(`Sedentary.model: '${modelName}' model: 'parent' option: Wrong type, expected 'Model'`);

    if(primaryKey && typeof primaryKey !== "string") throw new Error(`Sedentary.model: '${modelName}' model: 'primaryKey' option: Wrong type, expected 'string'`);
    if(primaryKey && ! Object.keys(attributes).includes(primaryKey)) throw new Error(`Sedentary.model: '${modelName}' model: 'primaryKey' option: Attribute '${primaryKey}' does not exists`);

    if(parent || primaryKey) {
      autoIncrement = false;
      aarray = [];
      constraints = [];
    }

    for(const attributeName of Object.keys(attributes).sort()) {
      if(reservedNames.includes(attributeName)) throw new Error(`Sedentary.model: '${modelName}' model: '${attributeName}' attribute: Reserved name`);

      const call = (defaultValue: Natural | undefined, fieldName: string, notNull: boolean, unique: boolean, func: () => Type<Natural, unknown>, message1: string, message2: string) => {
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
        const options = foreignKey.options || ({} as ForeignKeyOptions);

        if(foreignKey.options !== undefined && ! (foreignKey.options instanceof Object)) throw new Error(`Sedentary.FKEY: '${modelName}' model: '${attributeName}' attribute: Wrong options type, expected 'Object'`);
        for(const k in options) if(! ["onDelete", "onUpdate"].includes(k)) throw new Error(`Sedentary.FKEY: '${modelName}' model: '${attributeName}' attribute: Unknown option '${k}'`);

        for(const onChange of ["onDelete", "onUpdate"] as const) {
          const actions = ["cascade", "no action", "restrict", "set default", "set null"];
          let action = options[onChange];

          if(! action) action = options[onChange] = "no action";
          if(action && ! actions.includes(action)) throw new Error(`Sedentary.FKEY: '${modelName}' model: '${attributeName}' attribute: '${onChange}' option: Wrong value, expected ${actions.map(_ => `'${_}'`).join(" | ")}`);
        }

        foreignKey.options = options;
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

    const foreignKeys = aarray
      .filter(_ => _.foreignKey)
      .reduce<Record<string, boolean>>((ret, curr) => {
        ret[curr.attributeName] = true;
        return ret;
      }, {});

    for(const foreignKey in foreignKeys) {
      if(foreignKey + "Load" in attributes) throw new Error(`Sedentary.model: '${modelName}' model: '${foreignKey}' attribute: '${foreignKey}Load' inferred methods conflicts with an attribute`);
      if(foreignKey + "Load" in methods) throw new Error(`Sedentary.model: '${modelName}' model: '${foreignKey}' attribute: '${foreignKey}Load' inferred methods conflicts with a method`);
    }

    for(const method in methods) if(method in attributes) throw new Error(`Sedentary.model: '${modelName}' model: '${method}' method: conflicts with an attribute`);

    const checkParent = (parent?: ModelStd) => {
      if(! parent) return;

      for(const attribute in attributes) {
        if(attribute in parent.attributes) throw new Error(`Sedentary.model: '${modelName}' model: '${attribute}' attribute: conflicts with an attribute of '${parent.modelName}' model`);
        if(attribute in parent.methods) throw new Error(`Sedentary.model: '${modelName}' model: '${attribute}' attribute: conflicts with a method of '${parent.modelName}' model`);

        for(const foreignKey in parent.foreignKeys) if(attribute === foreignKey + "Load") throw new Error(`Sedentary.model: '${modelName}' model: '${attribute}' attribute: conflicts with an inferred methods of '${parent.modelName}' model`);
      }

      for(const foreignKey in foreignKeys) {
        if(foreignKey + "Load" in parent.attributes) throw new Error(`Sedentary.model: '${modelName}' model: '${foreignKey}' attribute: '${foreignKey}Load' inferred methods conflicts with an attribute of '${parent.modelName}' model`);
        if(foreignKey + "Load" in parent.methods) throw new Error(`Sedentary.model: '${modelName}' model: '${foreignKey}' attribute: '${foreignKey}Load' inferred methods conflicts with a method of '${parent.modelName}' model`);
      }

      for(const method in methods) {
        if(method in parent.attributes) throw new Error(`Sedentary.model: '${modelName}' model: '${method}' method: conflicts with an attribute of '${parent.modelName}' model`);
        for(const foreignKey in parent.foreignKeys) if(foreignKey + "Load" === method) throw new Error(`Sedentary.model: '${modelName}' model: '${method}' method: conflicts with an inferred methods of '${parent.modelName}' model`);
        if(method in parent.methods) throw new Error(`Sedentary.model: '${modelName}' model: '${method}' method: conflicts with a method of '${parent.modelName}' model`);
      }

      checkParent(parent.parent);
    };

    checkParent(parent);

    const ret = class extends (parent || EntryBase) {} as unknown as Model<Natural, A, EntryBase>;

    const load: (boh: boolean) => Promise<EntryBase[]> = (boh: boolean) =>
      new Promise((resolve, reject) =>
        setTimeout(() => {
          if(boh) return resolve([new ret()]);
          reject(new Error("boh"));
        }, 10)
      );
    Object.defineProperty(load, "name", { value: modelName + ".load" });

    Object.defineProperty(ret, "name", { value: modelName });
    Object.defineProperty(ret, "load", { value: load });
    Object.defineProperty(ret, "attributes", { value: attributes });
    Object.defineProperty(ret, "foreignKeys", { value: foreignKeys });
    Object.defineProperty(ret, "methods", { value: methods });
    Object.assign(ret.prototype, methods);

    ret.prototype.save = this.db.save(tableName, aarray);
    Object.defineProperty(ret.prototype.save, "name", { value: modelName + ".save" });

    for(const attribute of aarray) Object.defineProperty(ret, attribute.attributeName, { value: attribute });
    for(const key of ["attributeName", "base", "fieldName", "modelName", "size", "tableName", "type", "unique"] as const) Object.defineProperty(ret, key, { value: pk[key] });

    return ret;
  }
}
