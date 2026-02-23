import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import { BaseSequencer } from "vitest/node";

const dir = path.dirname(fileURLToPath(import.meta.url));

const packageOrder = ["sedentary", "sedentary-pg"];

class OrderedSequencer extends BaseSequencer {
  sort<T extends { moduleId: string }>(files: T[]) {
    const root = this.ctx.config.root;
    return Promise.resolve(
      [...files].sort((a, b) => {
        const pathA = path.normalize(a.moduleId).replace(/\\/g, "/");
        const pathB = path.normalize(b.moduleId).replace(/\\/g, "/");
        const relA = path.relative(root, pathA).replace(/\\/g, "/");
        const relB = path.relative(root, pathB).replace(/\\/g, "/");
        const pkgA = relA.startsWith("packages/") ? (relA.split("/")[1] ?? "") : "";
        const pkgB = relB.startsWith("packages/") ? (relB.split("/")[1] ?? "") : "";
        const orderA = packageOrder.indexOf(pkgA);
        const orderB = packageOrder.indexOf(pkgB);
        if(orderA !== orderB) return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
        return path.basename(relA).localeCompare(path.basename(relB));
      })
    );
  }
}

export default defineConfig({
  resolve: {
    alias: { sedentary: path.resolve(dir, "packages/sedentary/index.ts") }
  },
  test: {
    coverage: {
      exclude:  ["**/node_modules/**", "**/test/*"],
      include:  ["packages/*/*.ts"],
      provider: "v8",
      reporter: [["text"], ["html"], ["lcovonly", { file: "lcov.info" }]]
    },
    globals:    true,
    include:    ["packages/**/test/**/*.test.ts"],
    maxWorkers: 1,
    name:       "sedentary",
    root:       ".",
    sequence:   { sequencer: OrderedSequencer }
  }
});
