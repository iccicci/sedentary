import { ok } from "assert";

import { Record } from "../lib/db";

describe("class Record", () => {
  let done: boolean;

  before(async () => {
    const record = new Record();

    record.init();
    await record.save();

    done = true;
  });

  it("ok", () => ok(done));
});
