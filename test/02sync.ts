import { clean, createHelper } from "./helper";

describe("sync", () => {
  const helper = createHelper();

  beforeEach(async () => {
    await clean();
  });

  describe("CREATE TABLE", function() {
    const [test, log, logs] = helper(async db => {
      db.model("test1", {});
      await db.connect();
    });

    before(test);

    log("");
    logs();
  });
});
