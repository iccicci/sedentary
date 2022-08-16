import tsd from "tsd";

type Diagnostics = ReturnType<typeof tsd> extends Promise<infer T> ? T : never;

const desc = process.env.TYPES === "no" ? xdescribe : describe;

desc("types", () => {
  let diagnostics: Diagnostics;

  beforeAll(async function() {
    diagnostics = await tsd({ cwd: ".", testFiles: ["test/types.ts"], typingsFile: "index.ts" });
  });

  it("types", () => {
    if(! diagnostics.length) return;

    throw new Error("types\n\n" + diagnostics.map(_ => `${_.fileName}:${_.line}:${_.column}:${_.severity}:${_.message}`).join("\n") + "\n");
  });
});
