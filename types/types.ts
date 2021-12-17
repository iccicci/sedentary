import { expectType, expectAssignable } from "tsd";

import { Sedentary, BaseEntry, Entry, EntryId } from "..";

const db = new Sedentary("test.json");

const T1 = db.model("T1", { a: db.INT, b: db.VARCHAR });
type ET1 = Entry<typeof T1>;
const t1 = new T1();

expectType<BaseEntry & EntryId<boolean> & { a?: number; b?: string }>(t1);
expectType<ET1>(t1);
expectAssignable<BaseEntry & { id?: number; a?: number; b?: string }>(t1);

const T2 = db.model("T1", { a: db.INT, b: db.VARCHAR }, { int8id: true });
type ET2 = Entry<typeof T2>;
const t2 = new T2();

expectType<BaseEntry & EntryId<true> & { a?: number; b?: string }>(t2);
expectType<ET2>(t2);
expectAssignable<BaseEntry & { id?: string; a?: number; b?: string }>(t2);
