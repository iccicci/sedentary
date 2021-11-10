import { ok } from "assert";

import { Entry } from "../lib/db";

describe("class Entry", () => {
  let done: boolean;

  before(async () => {
    const record = new Entry();

    record.init();
    await record.save();

    done = true;
  });

  it("ok", () => ok(done));
});
