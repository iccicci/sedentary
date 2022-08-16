import { expectAssignable, expectNotAssignable, expectType } from "tsd";

import { EntryBase, Entry, OrderBy, Type, Where } from "..";
import { Sedentary } from "./package";

const db = new Sedentary("test.json");

const T1 = db.model("T1", {});
type T1 = Entry<typeof T1>;
const t1 = new T1();
expectAssignable<Type<number, EntryBase>>(T1);
expectNotAssignable<Type<string, EntryBase>>(T1);
expectType<T1>(t1);
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
type T2 = Entry<typeof T2>;
const t2 = new T2();
expectAssignable<Type<number, EntryBase>>(T2);
expectNotAssignable<Type<string, EntryBase>>(T2);
expectType<T2>(t2);
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
type T3 = Entry<typeof T3>;
const t3 = new T3();
expectAssignable<Type<number, EntryBase>>(T3);
expectNotAssignable<Type<string, EntryBase>>(T3);
expectType<T3>(t3);
expectType<EntryBase & { id: number } & { a: (a: number) => string; b: (a: number) => number }>(t3);
expectAssignable<Partial<T3>>({ a: (t1: number) => t1.toString() });
expectNotAssignable<Partial<T3>>({ a: (t1: number, t2: number) => t1.toString() + t2.toString() });
expectNotAssignable<Partial<T3>>({ c: () => "" });

type t4_1 = (a: number) => string;
type t4_2 = (a: number) => number;
const T4 = db.model(
  "T4",
  { a: db.Int, b: db.VarChar(10), c: { notNull: true, type: db.Int }, d: { notNull: true, type: db.VarChar(10) }, e: db.VarChar<"foo" | "bar">() },
  {},
  {
    m: function(a: number): string {
      expectType<t4_1>(this.m);
      expectType<t4_2>(this.n);
      expectAssignable<Partial<typeof this>>({ a: 0, b: "", c: 0, d: "", e: "foo" });
      expectType<number | null>(this.a);
      expectType<string | null>(this.b);
      expectType<number>(this.c);
      expectType<string>(this.d);
      expectType<"foo" | "bar" | null>(this.e);
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
type T4 = Entry<typeof T4>;
const t4 = new T4({ id: 0 });
expectAssignable<Type<number, EntryBase>>(T4);
expectNotAssignable<Type<string, EntryBase>>(T4);
expectType<T4>(t4);
expectType<number | null>(t4.a);
expectType<string | null>(t4.b);
expectType<number>(t4.c);
expectType<string>(t4.d);
expectType<"foo" | "bar" | null>(t4.e);
expectType<EntryBase & { a: number | null; b: string | null; c: number; d: string; e: "foo" | "bar" | null; id: number } & { m: (a: number) => string; n: (a: number) => number }>(t4);
expectAssignable<Partial<T4>>({ m: (t1: number) => t1.toString() });
expectNotAssignable<Partial<T4>>({ m: (t1: number, t2: number) => t1.toString() + t2.toString() });
expectNotAssignable<Partial<T4>>({ o: () => "" });
expectAssignable<Partial<T4>>({ a: 0, b: "", c: 0, d: "", e: "bar" });
expectNotAssignable<Partial<T4>>({ a: "" });
expectNotAssignable<Partial<T4>>({ f: 0 });

const T5 = db.model("T5", {}, { int8id: true });
type T5 = Entry<typeof T5>;
const t5 = new T5();
expectAssignable<Type<string, EntryBase>>(T5);
expectNotAssignable<Type<number, EntryBase>>(T5);
expectType<T5>(t5);
expectType<EntryBase & { id: string }>(t5);

const T6 = db.model("T6", { a: db.DateTime }, { primaryKey: "a" });
type T6 = Entry<typeof T6>;
const t6 = new T6({ a: new Date() });
expectAssignable<Type<Date | null, EntryBase>>(T6);
expectNotAssignable<Type<number, EntryBase>>(T6);
expectNotAssignable<Type<string, EntryBase>>(T6);
expectType<T6>(t6);
expectType<EntryBase & { a: Date | null }>(t6);

const T7 = db.model("T7", {}, { int8id: false });
type T7 = Entry<typeof T7>;
const t7 = new T7();
expectAssignable<Type<number, EntryBase>>(T7);
expectNotAssignable<Type<string, EntryBase>>(T7);
expectType<T7>(t7);
expectType<EntryBase & { id: number }>(t7);

const T8 = db.model("T8", {}, { parent: T6 });
type T8 = Entry<typeof T8>;
const t8 = new T8();
expectAssignable<Type<Date | null, EntryBase>>(T8);
expectNotAssignable<Type<string, EntryBase>>(T8);
expectType<T8>(t8);
expectType<EntryBase & { a: Date | null }>(t8);

const T9 = db.model("T9", { b: db.Int8 }, { parent: T6 });
type T9 = Entry<typeof T9>;
const t9 = new T9({ a: new Date(), b: 0n });
expectAssignable<Type<Date | null, EntryBase>>(T9);
expectNotAssignable<Type<string, EntryBase>>(T9);
expectType<T9>(t9);
expectType<EntryBase & { a: Date | null; b: bigint | null }>(t9);

const T10 = db.model("T10", {}, { parent: T6 }, { m: (i?: string) => (i ? i.length : 0) });
type T10 = Entry<typeof T10>;
const t10 = new T10();
expectAssignable<Type<Date | null, EntryBase>>(T10);
expectNotAssignable<Type<string, EntryBase>>(T10);
expectType<T10>(t10);
expectType<EntryBase & { a: Date | null } & { m: (i?: string) => number }>(t10);

const T11 = db.model("T11", { b: db.Int8 }, { parent: T6 }, { m: (i?: string) => (i ? i.length : 0) });
type T11 = Entry<typeof T11>;
const t11 = new T11();
expectAssignable<Type<Date | null, EntryBase>>(T11);
expectNotAssignable<Type<string, EntryBase>>(T11);
expectType<T11>(t11);
expectType<EntryBase & { a: Date | null; b: bigint | null } & { m: (i?: string) => number }>(t11);

type t12_1 = (a?: Date) => void;
const T12 = db.model(
  "T12",
  { e: db.DateTime },
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
type T12 = Entry<typeof T12>;
type OT12 = OrderBy<typeof T12>;
type WT12 = Where<typeof T12>;
const t12 = new T12();
expectAssignable<Type<number, EntryBase>>(T12);
expectNotAssignable<Type<string, EntryBase>>(T12);
expectType<T12>(t12);
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
expectAssignable<Partial<T12>>({ m: (t1: number) => t1.toString() });
expectNotAssignable<Partial<T12>>({ m: (t1: number, t2: number) => t1.toString() + t2.toString() });
expectAssignable<Partial<T12>>({ o: function() {} });
expectNotAssignable<Partial<T12>>({ p: () => "" });
expectAssignable<Partial<T12>>({ a: 0, b: "", c: 0, d: "", e: new Date() });
expectNotAssignable<Partial<T12>>({ e: "" });
expectNotAssignable<Partial<T12>>({ f: 0 });
type t12_2 = typeof T12 extends new (from: infer T) => EntryBase ? Exclude<T, undefined> : never;
expectType<{ a?: number | null; b?: string | null; c?: number; d?: string; e?: Date | null; id?: number }>({} as t12_2);
expectAssignable<WT12>(["AND", ["NOT", { a: ["=", 0], b: [">", "test"] }], { c: ["IN", [2, 3, 4]] }, "plain condition"]);
expectAssignable<WT12>(["OR", ["NOT", { a: 0, b: [">", "test"] }], { c: ["IN", [2, 3, 4]] }, "plain condition"]);
expectAssignable<OT12>([]);
expectAssignable<OT12>(["a", "-b", "id", "-c"]);
expectAssignable<OT12>("a");

const T13 = db.model("T13", { a: db.FKey(T6) });
type T13 = Entry<typeof T13>;
const t13 = new T13();
expectAssignable<Type<number, EntryBase>>(T13);
expectNotAssignable<Type<string, EntryBase>>(T13);
expectType<T13>(t13);
expectType<EntryBase & { a: Date | null; id: number } & { aLoad: () => Promise<T6> }>(t13);
type t13_1 = typeof T13 extends new (from: infer T) => EntryBase ? Exclude<T, undefined> : never;
expectType<{ a?: Date | null; id?: number }>({} as t13_1);

const T14 = db.model("T14", { a: db.FKey(T6.a) });
type T14 = Entry<typeof T14>;
const t14 = new T14();
expectAssignable<Type<number, EntryBase>>(T14);
expectNotAssignable<Type<string, EntryBase>>(T14);
expectType<T14>(t14);
expectType<EntryBase & { a: Date | null; id: number } & { aLoad: () => Promise<T6> }>(t14);
type t14_1 = typeof T14 extends new (from: infer T) => EntryBase ? Exclude<T, undefined> : never;
expectType<{ a?: Date | null; id?: number }>({} as t14_1);

type t15_1 = { a: number; b?: string[] };
const T15 = db.model("T15", { a: db.JSON(), b: db.JSON<t15_1>() });
type T15 = Entry<typeof T15>;
const t15 = new T15();
expectAssignable<Type<number, EntryBase>>(T15);
expectNotAssignable<Type<string, EntryBase>>(T15);
expectType<T15>(t15);
expectType<EntryBase & { a: unknown | null; b: t15_1 | null; id: number }>(t15);
type t15_2 = typeof T15 extends new (from: infer T) => EntryBase ? Exclude<T, undefined> : never;
expectType<{ a?: unknown | null; b?: t15_1 | null; id?: number }>({} as t15_2);
