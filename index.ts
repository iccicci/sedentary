import { DB, Meta, Record, Table, Type, native } from "./lib/db";
import { MiniDB } from "./lib/minidb";

type This = { [key: string]: unknown };

type TypeDefinition<N extends native, R extends unknown> = ((...args: unknown[]) => Type<N, R>) | Type<N, R>;
interface FieldOptions<N extends native, R extends unknown> {
  defaultValue?: N;
  fieldName?: string;
  notNull?: boolean;
  type: TypeDefinition<N, R>;
  unique?: boolean;
}

type FieldDefinition<N extends native, R extends unknown> = TypeDefinition<N, R> | FieldOptions<N, R>;
type FieldsDefinition = { [key: string]: FieldDefinition<native, unknown> };

type ForeignKeyFileds<T, k> = T extends FieldDefinition<native, infer R> ? (R extends Record ? k : never) : never;
type ForeignKey<T> = T extends FieldDefinition<native, infer R> ? () => Promise<R> : never;
type Keys<F extends FieldsDefinition> = { [f in keyof F]?: ForeignKeyFileds<F[f], f> }[keyof F];

type Native__<T> = T extends Type<infer N, unknown> ? N : never;
type Native_<T> = T extends (...args: unknown[]) => Type<infer N, infer R> ? Native__<Type<N, R>> : Native__<T>;
type Native<T> = T extends FieldOptions<infer N, infer R> ? Native__<Type<N, R>> : Native_<T>;

type Parent<T> = T extends Meta<native, infer R> ? R : never;

interface Constraint {
  name: string;
  type: "u";
  field: string;
}

class Field<N extends native, R extends unknown> extends Type<N, R> {
  defaultValue?: string;
  fieldName?: string;
  notNull?: boolean;
  unique?: boolean;

  constructor(from: Partial<Field<N, R>>) {
    super(from);
  }
}

export interface SchemaOptions {
  log?: (message: string) => void;
}

export class Sedentary {
  protected db: DB;
  protected log: (message: string) => void;

  private constraints: Constraint[] = [];
  private sync = true;
  private models: { [key: string]: boolean };
  private tables: { [key: string]: Table } = {};

  constructor(filename: string, options?: SchemaOptions) {
    if(typeof filename !== "string") throw new Error("Sedentary.constructor: Wrong 'filename' type: expected 'string'");
    if(! options) options = {};
    if(! (options instanceof Object)) throw new Error("Sedentary.constructor: Wrong 'options' type: expected 'Object'");

    for(const k in options) {
      if(["log", "sync"].indexOf(k) === -1) throw new Error(`Sedentary.constructor: Unknown '${k}' option`);

      this[k] = options[k];
    }

    // eslint-disable-next-line no-console
    this.log ||= console.log;

    this.db = new MiniDB(filename, this.log);
  }

  INT(size?: number): Type<number, unknown> {
    const message = "Sedentary.INT: Wrong 'size': expected 2, 4 or 8";

    size = size ? this.checkSize(size, message) : 8;

    if(size !== 2 && size !== 4 && size !== 8) throw new Error(message);

    return new Type({ size, type: "INT" });
  }

  FKEY<N extends native, R extends Record>(record: Type<N, R>): Type<N, R> {
    return new Type({ size: 0, type: "" });
  }

  async connect(): Promise<void> {
    try {
      this.log("Connecting...");
      await this.db.connect();
      this.log("Connected, syncing...");
      await this.db.sync();
      this.log("Synced");
    } catch(e) {
      this.log("Connecting: " + e.message);
      throw e;
    }
  }

  async end(): Promise<void> {
    this.log("Closing connection...");
    await this.db.end();
    this.log("Connection closed");
  }

  fldString<R extends unknown>(options?: { foreignKey: R }): Type<string, R> {
    return new Type<string, R>({ size: 0, type: "" });
  }

  model<
    F extends FieldsDefinition,
    K extends string,
    // eslint-disable-next-line space-before-function-paren
    M extends { [key: string]: (this: T) => unknown },
    N extends K extends keyof F ? Native<F[K]> : number,
    P extends Meta<native, Record>,
    T extends Parent<P> & { [f in keyof F]?: Native<F[f]> } & { load: { [f in Keys<F>]?: ForeignKey<F[f]> } } & M
  >(
    name: string,
    fields: F,
    options?: {
      init?: (this: T) => void;
      methods?: M;
      parent?: P;
      primaryKey?: K;
      sync?: boolean;
      tableName?: string;
    }
  ): (new () => T) &
    { [f in keyof F]?: Meta<Native<F[f]>, T> } & {
      load: (boh: boolean) => Promise<T[]>;
    } & Meta<N, T> {
    if(this.db.tables[name]) throw new Error(`Sedentary.model: model '${name}' already defined`);
    if(typeof name !== "string") throw new Error("Sedentary.model: Wrong 'name' type: expected 'string'");
    if(! fields) fields = {} as F;
    if(! (fields instanceof Object)) throw new Error("Sedentary.model: Wrong 'fields' type: expected 'Object'");
    if(! options) options = {};
    if(! (options instanceof Object)) throw new Error("Sedentary.model: Wrong 'options' type: expected 'Object'");

    for(const k in options) if(["init", "methods", "parent", "primaryKey", "sync", "tableName", "type"].indexOf(k) === -1) throw new Error(`Sedentary.model: Unknown '${k}' option`);

    const { parent, primaryKey, sync, tableName } = { sync: this.sync, tableName: name + "s", ...options };
    const pkName = primaryKey || "id";
    let farray = [new Field<number, unknown>({ fieldName: "id", notNull: true, size: 8, type: "INT", unique: true })];

    if(primaryKey && Object.keys(fields).indexOf(primaryKey) === -1) throw new Error(`Sedentary.model: 'primaryKey' field '${primaryKey}' does not exists`);
    if(parent && primaryKey) throw new Error("Sedentary.model: Both 'parent' and 'primaryKey' options provided");
    if(parent || primaryKey) farray = [];

    if(! parent) this.constraints.push({ name: `${tableName}_${pkName}_unique`, type: "u", field: pkName });

    for(const fname in fields) {
      const field = fields[fname];
      // eslint-disable-next-line prefer-const
      let { defaultValue, fieldName, notNull, size, type, unique } = ((): Field<native, unknown> => {
        // eslint-disable-next-line prefer-const
        let { fieldName, type } = { fieldName: fname as string, type: null as unknown };

        const call = (message: string) => {
          const func: () => Type<native, unknown> = field as never;

          if(func !== this.INT && func !== this.FKEY) throw new Error(message);

          return new Field({ fieldName: fname, ...func() });
        };

        if(field instanceof Type) return new Field({ fieldName: fname, ...field });
        if(field instanceof Function) return call(`Sedentary.model: Wrong '${fname}' field value`);
        if(! (field instanceof Object)) throw new Error(`Sedentary.model: Wrong '${fname}' field type`);

        ({ fieldName, type } = field as FieldOptions<native, unknown>);
        if(! fieldName) fieldName = fname;
        if(typeof fieldName !== "string") throw new Error(`Sedentary.model: Wrong 'fieldName' attribute of '${fname}' field type`);

        if(! type) throw new Error(`Sedentary.model: Missing 'type' attribute of '${fname}' field`);

        if(type instanceof Type) return new Field({ ...((field as unknown) as Type<native, unknown>), ...type });
        if(type instanceof Function) return call(`Sedentary.model: Wrong 'type' attribute of '${fname}' field value`);

        throw new Error(`Sedentary.model: Wrong 'type' attribute of '${fname}' field type`);
      })();

      if(primaryKey === (fname as never)) {
        notNull = true;
        unique = true;
      }

      if(defaultValue) notNull = true;

      farray.push(new Field({ defaultValue, fieldName, notNull, size, type, unique }));
    }

    this.db.addTable(new Table({ parent, primaryKey, sync, tableName }));

    const init = parent
      ? options.init
        ? function() {
          parent.init.call(this);
          options.init.call(this);
        }
        : parent.init
      : options.init;

    const flds: { [f in keyof F]?: Meta<Native<F[f]>, T> } = {};

    for(const key in fields) flds[key] = null;

    const record = (function(this: T): void {
      const t = this as This;
      t.a = "sisi";
      t.b = 2;
      this.id = 1;
      if(init) init.call(this);
    } as unknown) as typeof Record;
    Object.defineProperty(record, "name", { value: name });

    const save = function(this: T): Promise<boolean> {
      return new Promise((resolve, reject) => {
        const save = (): void => reject(new Error("eh no"));
        Object.defineProperty(save, "name", { value: name + ".save" });

        setTimeout(save, 10);
      });
    };
    Object.defineProperty(save, "name", { value: name + ".save" });

    record.prototype = new Record();
    record.prototype.constructor = record;
    record.prototype.save = save;

    ["init"].forEach(method => (options[method] ? (record.prototype[method] = options[method]) : null));

    const create: () => T = () => new record() as T;
    Object.defineProperty(create, "name", { value: name + "s.create" });

    const load: (boh: boolean) => Promise<T[]> = (boh: boolean) =>
      new Promise((resolve, reject) =>
        setTimeout(() => {
          if(boh) return resolve([new record() as T]);
          reject(new Error("boh"));
        }, 10)
      );
    Object.defineProperty(load, "name", { value: name + "s.load" });

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

    const load2: (boh: boolean) => Promise<T[]> = (boh: boolean) =>
      new Promise((resolve, reject) =>
        setTimeout(() => {
          if(boh) return resolve([new Class() as T]);
          reject(new Error("boh"));
        }, 10)
      );
    Object.defineProperty(load2, "name", { value: name + "s.load" });

    Object.defineProperty(Class, "name", { value: name });
    Object.defineProperty(Class, "fields", { value: flds });
    Object.defineProperty(Class, "load", { value: load2 });
    Object.defineProperty(Class, "meta", { value: new Meta<N, T>(tableName, primaryKey, init, options.methods) });
    Object.defineProperty(Class.prototype.save, "name", { value: name + ".save" });
    Object.assign(Class, new Meta<N, T>(tableName, primaryKey, init, options.methods));
    Object.assign(Class, flds);
    Object.assign(Class.prototype, options.methods);
    if(options.parent) Object.assign(Class.prototype, options.parent.methods);

    return Class as never;
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

const Users = db.model("User", { foo: db.INT(), bar: db.fldString() }, {});

const fields = {
  num: db.FKEY(Users),
  str: db.fldString()
};

class Item extends db.model("Item", fields, {
  init: function() {
    this.num = 0;
    this.str = "0";
  },
  methods: {
    prova: (): string => "ok"
  }
}) {}

class Super extends db.model(
  "Super",
  {
    a: db.INT,
    n: db.FKEY(Item),
    s: db.FKEY(Users.bar)
  },
  {
    init: async function() {
      this.n = 23;
      //const a = await this.load.n();
    },
    parent: Item
  }
) {}

class Next extends db.model(
  "Next",
  { a: db.INT },
  {
    init: function() {
      this.a = 23;
    }
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
  console.log(Item.prototype, Item.prototype.prova);
  console.log(Super.prototype, Super.prototype.prova);

  try {
    await item.save();
  } catch(e) {
    console.log(Item.load, item.save, await Item.load(true), item, e.message);
    console.log(new Next(), Next.load, await Next.load(true), new Last(), new Item().prova());
  }

  return true;
})();
