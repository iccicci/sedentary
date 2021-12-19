import tsd from "tsd";

type Diagnostics = ReturnType<typeof tsd> extends Promise<infer T> ? T : never;

describe("types", () => {
  let diagnostics: Diagnostics;

  before(async function() {
    this.timeout(10000);
    diagnostics = await tsd({ cwd: ".", testFiles: ["test/types/types.ts"], typingsFile: "index.ts" });
  });

  it("types", () => {
    if(! diagnostics.length) return;

    throw new Error("types\n\n" + diagnostics.map(_ => `${_.fileName}:${_.line}:${_.column}:${_.severity}:${_.message}`).join("\n") + "\n");
  });
});
