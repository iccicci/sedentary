import { helper } from "./helper";
import { wheres } from "./local";

describe("where", () => {
  describe("empty where conditions", function() {
    helper(wheres.empty, async db => {
      const test1 = db.model("test1", {});
      await db.connect();
      await test1.load(["AND", ["NOT", null], {}, ["NOT"]] as never);
    });
  });

  describe("where conditions", function() {
    helper(wheres.where, async db => {
      const test1 = db.model("test1", { a: db.INT, b: db.VARCHAR, c: db.INT, d: db.INT, e: db.INT });
      await db.connect();
      await test1.load(["OR", ["AND", "fixed", ["OR", ["NOT", { a: 23, b: ["IS NULL"], c: ["NOT"], d: [">", 23], e: ["IN", [23, 42]] }]]], "fixed"]);
    });
  });

  describe("order by", function() {
    helper(wheres.order, async db => {
      const test1 = db.model("test1", { a: db.INT, b: db.VARCHAR });
      await db.connect();
      await test1.load({}, ["a", "-b"]);
    });
  });
});
