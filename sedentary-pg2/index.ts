import { DB } from "./src/db";
import { Transaction } from "./src/transaction";

export type This = { [key: string]: unknown };

class Type {
  native: number | string;
}

class TypeNumber extends Type {
  native: number;
}

class TypeString extends Type {
  native: string;
}

type Native<T extends Type> = T extends TypeNumber ? number : T extends TypeString ? string : never;

export function fldNumber(): TypeNumber {
  return new TypeNumber();
}

export function fldString(): TypeString {
  return new TypeString();
}

export class Instance {
  save(): Promise<boolean> {
    return new Promise(resolve => resolve());
  }
}

export class Sedentary {
  protected db: DB;

  constructor(filename: string | null) {
    this.db = new DB(filename);
  }

  connect(done?: (err?: Error) => void): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connect = async(resolve: (value?: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => {
      try {
        await this.db.connect();
        resolve();
      } catch(e) {
        reject(e);
      }
    };

    if(done) return connect(() => done(), done);

    return new Promise(connect);
  }

  end(done?: (err?: Error) => void): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const end = async(resolve: (value?: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => {
      try {
        await this.db.end();
        resolve();
      } catch(e) {
        reject(e);
      }
    };

    if(done) return end(() => done(), done);

    return new Promise(end);
  }

  model<FT extends Type, F extends { [key: string]: FT }>(
    name: string,
    fields: F
  ): {
    create: () => Instance & { [fld in keyof F]: Native<typeof fields[fld]> };
    instance: Instance & { [fld in keyof F]: Native<typeof fields[fld]> };
    select: (boh: boolean) => Promise<(Instance & { [fld in keyof F]: Native<typeof fields[fld]> })[]>;
  } {
    const instance = (function(this: This): void {
      this.a = "sisi";
      this.b = 2;
      console.log("almeno");
    } as unknown) as typeof Instance & { [fld in keyof F]: Native<typeof fields[fld]> };
    Object.defineProperty(instance, "name", { value: name });

    const save = function(this: This): Promise<boolean> {
      return new Promise((resolve, reject) => {
        const save = (): void => reject(new Error("eh no"));
        Object.defineProperty(save, "name", { value: name + ".save" });

        console.log(this.a, this.num);
        setTimeout(save, 10);
      });
    };
    Object.defineProperty(save, "name", { value: name + ".save" });

    instance.prototype = new Instance();
    instance.prototype.constructor = instance;
    instance.prototype.save = save;

    const create: () => Instance & { [fld in keyof F]: Native<typeof fields[fld]> } = () => new instance() as Instance & { [fld in keyof F]: Native<typeof fields[fld]> };
    Object.defineProperty(create, "name", { value: name + "s.create" });

    const select: (boh: boolean) => Promise<(Instance & { [fld in keyof F]: Native<typeof fields[fld]> })[]> = (boh: boolean) =>
      new Promise((resolve, reject) =>
        setTimeout(() => {
          if(boh) return resolve([new instance() as Instance & { [fld in keyof F]: Native<typeof fields[fld]> }]);
          reject(new Error("boh"));
        }, 10)
      );
    Object.defineProperty(select, "name", { value: name + "s.select" });

    const model = { create, instance: create(), select };

    return model;
  }

  protected select(bho: boolean): void {}
}

const db = new Sedentary("gino");

const fields = {
  num: fldNumber(),
  str: fldString()
};

const Items = db.model("Item", fields);
type Item = typeof Items.instance;

async function prova(): Promise<boolean> {
  try {
    console.log(await Items.select(true));

    const item: Item = Items.create();

    item.num = 0;
    item.str = "0";

    console.log(Items.select, item.save);
    await item.save();
  } catch(e) {
    console.log("però", e);
  }
  return true;
}

prova();
