import { DB } from "./src/db";

type This = { [key: string]: unknown };

type native = number | string | Date;

export class Record {
  id?: number;

  init(): void {}

  async save(): Promise<boolean> {
    return false;
  }
}

class Field<N extends native, R extends unknown> {
  native?: N;
  record?: R;
}

class Meta<N extends native, R extends Record> extends Field<N, R> {
  init: () => void;

  constructor(init: () => void) {
    super();
    this.init = init;
  }
}

type TypeDefinition<N extends native, R extends unknown> = ((args: unknown) => Field<N, R>) | Field<N, R>;
interface FieldOptions<N extends native, R extends unknown> {
  defaultValue?: N;
  fieldName?: string;
  notNull?: boolean;
  type: TypeDefinition<N, R>;
  unique?: boolean;
}

interface FieldOptionsInternal<N extends native, R extends unknown> {
  defaultValue?: N;
  fieldName?: string;
  notNull?: boolean;
  type: Field<N, R>;
  unique?: boolean;
}

type FieldDefinition<N extends native, R extends unknown> = TypeDefinition<N, R> | FieldOptions<N, R>;
type FieldsDefinition = { [key: string]: FieldDefinition<native, unknown> };

type ForeignKeyFileds<T, k> = T extends FieldDefinition<native, infer R> ? (R extends Record ? k : never) : never;
type ForeignKey<T> = T extends FieldDefinition<native, infer R> ? () => Promise<R> : never;
type Keys<F extends FieldsDefinition> = { [f in keyof F]?: ForeignKeyFileds<F[f], f> }[keyof F];

type Native__<T> = T extends Field<infer N, unknown> ? N : never;
type Native_<T> = T extends (args: unknown) => Field<infer N, infer R> ? Native__<Field<N, R>> : Native__<T>;
type Native<T> = T extends FieldOptions<infer N, infer R> ? Native__<Field<N, R>> : Native_<T>;

type Parent<T> = T extends Meta<native, infer R> ? R : never;

class Table {
  parent: Meta<native, Record>;
  primaryKey: string;
  sync: boolean;
  tableName: string;

  constructor(options: { parent: Meta<native, Record>; primaryKey: string; sync: boolean; tableName: string }) {
    for(const k in options) this[k] = options[k];
  }
}

export interface SchemaOptions {
  log?: (message: string) => void;
}

export class Sedentary {
  protected db: DB;
  protected log: (message: string) => void;

  private models: { [key: string]: boolean };
  private tables: { [key: string]: Table } = {};

  constructor(filename: string, options?: SchemaOptions) {
    this.db = new DB(filename);

    if(typeof filename !== "string") throw new Error("Sedentary.constructor: Wrong 'filename' type: expected 'string'");
    if(! options) options = {};
    if(! (options instanceof Object)) throw new Error("Sedentary.constructor: Wrong 'options' type: expected 'Object'");

    // eslint-disable-next-line no-console
    this.log = options.log || console.log;
  }

  FKEY<N extends native, R extends Record>(record: Field<N, R>): Field<N, R> {
    return new Field<N, R>();
  }

  async connect(): Promise<void> {
    try {
      this.log("Connecting...");
      await this.db.connect();
      this.log("Connected, syncing...");
      await this.sync();
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

  fldNumber<R extends unknown>(options?: { foreignKey: R }): Field<number, R> {
    return new Field<number, R>();
  }

  fldString<R extends unknown>(options?: { foreignKey: R }): Field<string, R> {
    return new Field<string, R>();
  }

  model<
    F extends FieldsDefinition,
    K extends string,
    N extends K extends keyof F ? Native<F[K]> : number,
    P extends Meta<native, Record>,
    T extends Parent<P> & { [f in keyof F]?: Native<F[f]> } & { load: { [f in Keys<F>]?: ForeignKey<F[f]> } }
  >(
    name: string,
    fields: F,
    options?: {
      init?: (this: T) => void;
      parent?: P;
      primaryKey?: K;
      sync?: boolean;
      tableName?: string;
    }
  ): {
    create: () => T;
    fields: { [f in keyof F]?: Meta<Native<F[f]>, T> };
    instance?: T;
    meta: Meta<N, T>;
    load: (boh: boolean) => Promise<T[]>;
  } {
    if(typeof name !== "string") throw new Error("Sedentary.model: Wrong 'name' type: expected 'string'");
    if(! fields) fields = {} as F;
    if(! (fields instanceof Object)) throw new Error("Sedentary.model: Wrong 'fields' type: expected 'Object'");
    if(! options) options = {};
    if(! (options instanceof Object)) throw new Error("Sedentary.model: Wrong 'options' type: expected 'Object'");

    const { parent, primaryKey, sync, tableName } = { sync: true, tableName: name + "s", ...options };

    this.tables[name] = new Table({ parent, primaryKey: primaryKey as string, sync, tableName });
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

    return { create, fields: flds, meta: new Meta<N, T>(init), load };
  }

  private async sync(): Promise<void> {}
}

export const Package = Sedentary;

const db = new Sedentary("gino");

const Users = db.model("User", { foo: db.fldNumber(), bar: db.fldString(), baz: {} as Field<Date, unknown> }, {});

const fields = {
  num: db.FKEY(Users.meta),
  str: db.fldString()
};
const Items = db.model("Item", fields, {
  init: function() {
    this.num = 0;
    this.str = "0";
  }
});
type Item = typeof Items.instance;

const Supers = db.model(
  "Item",
  {
    a: db.fldNumber(),
    n: db.FKEY(Items.meta),
    s: db.FKEY(Users.fields.bar)
  },
  {
    init: async function() {
      this.n = 23;
      //const a = await this.load.n();
    },
    parent:     Items.meta,
    primaryKey: "s"
  }
);

async function prova(): Promise<boolean> {
  const item: Item = Supers.create();

  try {
    await item.save();
  } catch(e) {
    console.log(Items.load, item.save, await Items.load(true), item, e.message);
  }

  return true;
}

prova();
