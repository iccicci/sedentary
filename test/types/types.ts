import { expectType, expectAssignable } from "tsd";

import { EntryBase, Entry, EntryId, Sedentary2 } from "../..";

const db = new Sedentary2();

const T1 = db.model("T1");
type ET1 = Entry<typeof T1>;
const t1 = new T1();
expectType<EntryBase>(t1);
expectType<ET1>(t1);

const T2 = db.model("T2", {
  c: function() {
    this.id = "0";
    this.c();
    return 0;
  }
});
type ET2 = Entry<typeof T2>;
const t2 = new T2();
expectType<EntryBase & { c: () => number }>(t2);
expectType<ET2>(t2);

/*
const T3 = db.model2(
  "T3",
  { a: db.INT },
  { int8id: true },
  {
    c: function() {
      this.id = "0";
      this.c();
      return 0;
    }
  }
);
type ET3 = Entry<typeof T3>;
const t3 = new T3();
expectType<ET3>(t3);
expectAssignable<EntryBase & { id?: string }>(t3);
*/
