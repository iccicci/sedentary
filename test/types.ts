import { expectAssignable, expectNotAssignable, expectType } from "tsd";

import { EntryBase, Entry, OrderBy, Type, Where } from "..";
import { Sedentary } from "./package";

const db = new Sedentary("test.json");

const T1 = db.model("T1", {});
type ET1 = Entry<typeof T1>;
const t1 = new T1();
expectAssignable<Type<number, EntryBase>>(T1);
expectNotAssignable<Type<string, EntryBase>>(T1);
expectType<ET1>(t1);
expectType<EntryBase & { id: number }>(t1);

type t2_1 = () => number;
const T2 = db.model(
  "T2",
  {},
  {},
  {
    c: function(): number {
      expectType<t2_1>(this.c);
      return 0;
    }
  }
);
type ET2 = Entry<typeof T2>;
const t2 = new T2();
expectAssignable<Type<number, EntryBase>>(T2);
expectNotAssignable<Type<string, EntryBase>>(T2);
expectType<ET2>(t2);
expectType<EntryBase & { id: number } & { c: () => number }>(t2);

type t3_1 = (a: number) => string;
type t3_2 = (a: number) => number;
const T3 = db.model(
  "T3",
  {},
  {},
  {
    a: function(a: number): string {
      expectType<t3_1>(this.a);
      expectType<t3_2>(this.b);
      this.a(this.b(a));
      return "test";
    },
    b: function(a: number) {
      expectType<t3_1>(this.a);
      expectType<t3_2>(this.b);
      this.a(a);
      return a;
    }
  }
);
type ET3 = Entry<typeof T3>;
const t3 = new T3();
expectAssignable<Type<number, EntryBase>>(T3);
expectNotAssignable<Type<string, EntryBase>>(T3);
expectType<ET3>(t3);
expectType<EntryBase & { id: number } & { a: (a: number) => string; b: (a: number) => number }>(t3);
expectAssignable<Partial<ET3>>({ a: (t1: number) => t1.toString() });
expectNotAssignable<Partial<ET3>>({ a: (t1: number, t2: number) => t1.toString() + t2.toString() });
expectNotAssignable<Partial<ET3>>({ c: () => "" });

type t4_1 = (a: number) => string;
type t4_2 = (a: number) => number;
const T4 = db.model(
  "T4",
  { a: db.INT, b: db.VARCHAR(10), c: { type: db.INT, notNull: true }, d: { type: db.VARCHAR(10), notNull: true } },
  {},
  {
    m: function(a: number): string {
      expectType<t4_1>(this.m);
      expectType<t4_2>(this.n);
      expectAssignable<Partial<typeof this>>({ a: 0, b: "", c: 0, d: "" });
      expectType<number | null>(this.a);
      expectType<string | null>(this.b);
      expectType<number>(this.c);
      expectType<string>(this.d);
      this.m(this.n(a));
      return "test";
    },
    n: function(a: number) {
      expectType<t4_1>(this.m);
      expectType<t4_2>(this.n);
      this.m(a);
      return a;
    }
  }
);
type ET4 = Entry<typeof T4>;
const t4 = new T4({ id: 0 });
expectAssignable<Type<number, EntryBase>>(T4);
expectNotAssignable<Type<string, EntryBase>>(T4);
expectType<ET4>(t4);
expectType<number | null>(t4.a);
expectType<string | null>(t4.b);
expectType<number>(t4.c);
expectType<string>(t4.d);
expectType<EntryBase & { a: number | null; b: string | null; c: number; d: string; id: number } & { m: (a: number) => string; n: (a: number) => number }>(t4);
expectAssignable<Partial<ET4>>({ m: (t1: number) => t1.toString() });
expectNotAssignable<Partial<ET4>>({ m: (t1: number, t2: number) => t1.toString() + t2.toString() });
expectNotAssignable<Partial<ET4>>({ o: () => "" });
expectAssignable<Partial<ET4>>({ a: 0, b: "", c: 0, d: "" });
expectNotAssignable<Partial<ET4>>({ a: "" });
expectNotAssignable<Partial<ET4>>({ e: 0 });

const T5 = db.model("T5", {}, { int8id: true });
type ET5 = Entry<typeof T5>;
const t5 = new T5();
expectAssignable<Type<string, EntryBase>>(T5);
expectNotAssignable<Type<number, EntryBase>>(T5);
expectType<ET5>(t5);
expectType<EntryBase & { id: string }>(t5);

const T6 = db.model("T6", { a: db.DATETIME }, { primaryKey: "a" });
type ET6 = Entry<typeof T6>;
const t6 = new T6({ a: new Date() });
expectAssignable<Type<Date | null, EntryBase>>(T6);
expectNotAssignable<Type<number, EntryBase>>(T6);
expectNotAssignable<Type<string, EntryBase>>(T6);
expectType<ET6>(t6);
expectType<EntryBase & { a: Date | null }>(t6);

const T7 = db.model("T7", {}, { int8id: false });
type ET7 = Entry<typeof T7>;
const t7 = new T7();
expectAssignable<Type<number, EntryBase>>(T7);
expectNotAssignable<Type<string, EntryBase>>(T7);
expectType<ET7>(t7);
expectType<EntryBase & { id: number }>(t7);

const T8 = db.model("T8", {}, { parent: T6 });
type ET8 = Entry<typeof T8>;
const t8 = new T8();
expectAssignable<Type<Date | null, EntryBase>>(T8);
expectNotAssignable<Type<string, EntryBase>>(T8);
expectType<ET8>(t8);
expectType<EntryBase & { a: Date | null }>(t8);

const T9 = db.model("T9", { b: db.INT8 }, { parent: T6 });
type ET9 = Entry<typeof T9>;
const t9 = new T9({ a: new Date(), b: 0n });
expectAssignable<Type<Date | null, EntryBase>>(T9);
expectNotAssignable<Type<string, EntryBase>>(T9);
expectType<ET9>(t9);
expectType<EntryBase & { a: Date | null; b: BigInt | null }>(t9);

const T10 = db.model("T10", {}, { parent: T6 }, { m: (i?: string) => (i ? i.length : 0) });
type ET10 = Entry<typeof T10>;
const t10 = new T10();
expectAssignable<Type<Date | null, EntryBase>>(T10);
expectNotAssignable<Type<string, EntryBase>>(T10);
expectType<ET10>(t10);
expectType<EntryBase & { a: Date | null } & { m: (i?: string) => number }>(t10);

const T11 = db.model("T11", { b: db.INT8 }, { parent: T6 }, { m: (i?: string) => (i ? i.length : 0) });
type ET11 = Entry<typeof T11>;
const t11 = new T11();
expectAssignable<Type<Date | null, EntryBase>>(T11);
expectNotAssignable<Type<string, EntryBase>>(T11);
expectType<ET11>(t11);
expectType<EntryBase & { a: Date | null; b: BigInt | null } & { m: (i?: string) => number }>(t11);

type t12_1 = (a?: Date) => void;
const T12 = db.model(
  "T12",
  { e: db.DATETIME },
  { parent: T4 },
  {
    o: function(a?: Date): void {
      expectType<t4_1>(this.m);
      expectType<t4_2>(this.n);
      expectType<t12_1>(this.o);
      expectAssignable<Partial<typeof this>>({ a: 0, b: "", c: 0, d: "" });
      expectType<number | null>(this.a);
      expectType<string | null>(this.b);
      expectType<number>(this.c);
      expectType<string>(this.d);
      expectType<Date | null>(this.e);
      this.m(this.n(a ? a.getTime() : 0));
    }
  }
);
type ET12 = Entry<typeof T12>;
type OT12 = OrderBy<typeof T12>;
type WT12 = Where<typeof T12>;
const t12 = new T12();
expectAssignable<Type<number, EntryBase>>(T12);
expectNotAssignable<Type<string, EntryBase>>(T12);
expectType<ET12>(t12);
expectType<number | null>(t12.a);
expectType<string | null>(t12.b);
expectType<number>(t12.c);
expectType<string>(t12.d);
expectType<Date | null>(t12.e);
expectType<
  EntryBase & { a: number | null; b: string | null; c: number; d: string; e: Date | null; id: number } & { m: (a: number) => string; n: (a: number) => number } & {
    o: (a?: Date) => void;
  }
    >(t12);
expectAssignable<Partial<ET12>>({ m: (t1: number) => t1.toString() });
expectNotAssignable<Partial<ET12>>({ m: (t1: number, t2: number) => t1.toString() + t2.toString() });
expectAssignable<Partial<ET12>>({ o: function() {} });
expectNotAssignable<Partial<ET12>>({ p: () => "" });
expectAssignable<Partial<ET12>>({ a: 0, b: "", c: 0, d: "", e: new Date() });
expectNotAssignable<Partial<ET12>>({ e: "" });
expectNotAssignable<Partial<ET12>>({ f: 0 });
type t12_2 = typeof T12 extends new (from: infer T) => EntryBase ? Exclude<T, undefined> : never;
expectType<{ a?: number | null; b?: string | null; c?: number; d?: string; e?: Date | null; id?: number }>({} as t12_2);
expectAssignable<WT12>(["AND", ["NOT", { a: ["=", 0], b: [">", "test"] }], { c: ["IN", [2, 3, 4]] }, "plain condition"]);
expectAssignable<WT12>(["OR", ["NOT", { a: 0, b: [">", "test"] }], { c: ["IN", [2, 3, 4]] }, "plain condition"]);
expectAssignable<OT12>([]);
expectAssignable<OT12>(["a", "-b", "id", "-c"]);

const T13 = db.model("T13", { a: db.FKEY(T6) });
type ET13 = Entry<typeof T13>;
const t13 = new T13();
expectAssignable<Type<number, EntryBase>>(T13);
expectNotAssignable<Type<string, EntryBase>>(T13);
expectType<ET13>(t13);
expectType<EntryBase & { a: Date | null; id: number } & { aLoad: () => Promise<ET6> }>(t13);
type t13_1 = typeof T13 extends new (from: infer T) => EntryBase ? Exclude<T, undefined> : never;
expectType<{ a?: Date | null; id?: number }>({} as t13_1);

const T14 = db.model("T14", { a: db.FKEY(T6.a) });
type ET14 = Entry<typeof T14>;
const t14 = new T14();
expectAssignable<Type<number, EntryBase>>(T14);
expectNotAssignable<Type<string, EntryBase>>(T14);
expectType<ET14>(t14);
expectType<EntryBase & { a: Date | null; id: number } & { aLoad: () => Promise<ET6> }>(t14);
type t14_1 = typeof T14 extends new (from: infer T) => EntryBase ? Exclude<T, undefined> : never;
expectType<{ a?: Date | null; id?: number }>({} as t14_1);
