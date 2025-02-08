import { helper } from "./helper";
import { fields } from "./local";

describe("fields", () => {
  describe("order by", function() {
    helper(fields.order, async db => {
      const test1 = db.model("test1", { a: db.Int({ fieldName: "a_b" }), b: db.VarChar({ defaultValue: "test" }) });
      await db.connect();
      await test1.load({}, "-a");
      await test1.load({}, ["-b", "a"]);
    });
  });
});
