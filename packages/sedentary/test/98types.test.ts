import path from "node:path";
import { fileURLToPath } from "node:url";

import tsd from "tsd";

type Diagnostics = ReturnType<typeof tsd> extends Promise<infer T> ? T : never;

const desc = process.env.TYPES === "no" ? describe.skip : describe;

desc("types", () => {
  let diagnostics: Diagnostics;

  beforeAll(async function() {
    const dir = path.dirname(fileURLToPath(import.meta.url));

    diagnostics = await tsd({ cwd: dir, testFiles: ["types.ts"], typingsFile: "../index.ts" });
  }, 60000);

  it("types", () => {
    if(! diagnostics.length) return;

    throw new Error(`types\n\n${diagnostics.map(_ => `${_.fileName}:${_.line}:${_.column}:${_.severity}:${_.message}`).join("\n")}\n`);
  });
});
