import { helper } from "./helper";
import { fields } from "./local";

describe("fields", () => {
  describe("order by", function() {
    helper(fields.order, async db => {
      const test1 = db.model("test1", { a: { fieldName: "a_b", type: db.Int }, b: { defaultValue: "test", type: db.VarChar } });
      await db.connect();
      await test1.load({}, "-a");
      await test1.load({}, ["-b", "a"]);
    });
  });
});
