import { readFile, writeFile } from "fs/promises";
import { inspect } from "util";

const [, , file] = process.argv;
const { PACKAGE } = process.env as { PACKAGE: "core" | "sedentary" | "sedentary-pg" };

function sort(obj: unknown) {
  const ret: Record<string, unknown> = {};

  if(obj instanceof Array || ! (obj instanceof Object)) return obj;

  Object.entries(obj)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .forEach(([k, v]) => (ret[k] = sort(v)));

  return ret;
}

async function read_package_json(path: string) {
  return JSON.parse(await readFile(path, { encoding: "utf-8" }));
}

async function package_json() {
  const { author, bugs, contributors, description, engines, funding, keywords, license, optionalDependencies, readmeFilename, repository, version } = await read_package_json("../../package.json");
  const files = ["dist"];
  const packages = {
    core:      {},
    sedentary: {
      description,
      files
    },
    "sedentary-pg": {
      dependencies: { "@types/pg": "^8.16.0", pg: "^8.18.0", "pg-format": "^1.0.4", sedentary: version },
      description:  `${description} - PostgreSQL`,
      files
    }
  };
  const res: Record<string, unknown> = {
    author,
    bugs,
    contributors,
    engines,
    funding,
    homepage: `https://github.com/iccicci/sedentary/tree/master/packages/${PACKAGE}#readme`,
    keywords,
    license,
    main:     "./dist/cjs/index.js",
    module:   "./dist/es/index.js",
    name:     PACKAGE,
    optionalDependencies,
    readmeFilename,
    repository,
    scripts:  {
      build:      "make build",
      deploy:     "make deploy",
      preinstall: "if [ -f Makefile ] ; then make ; fi"
    },
    types: "./dist/types/index.d.ts",
    version,
    ...packages[PACKAGE]
  };

  await writeFile(file, `${JSON.stringify(sort(res), null, 2)}\n`);
}

async function version() {
  const { version } = await read_package_json("package.json");

  process.stdout.write(`${version}\n`, "utf-8");
}

const specificOptions = {
  "tsconfig.cjs.json":   { composite: false, declaration: false, module: "CommonJS", outDir: "dist/cjs", target: "ES2020" },
  "tsconfig.es.json":    { composite: false, declaration: false, outDir: "dist/es" },
  "tsconfig.json":       {},
  "tsconfig.types.json": { emitDeclarationOnly: true, outDir: "dist/types" }
};
const compilerOptions = {
  alwaysStrict:                 true,
  composite:                    true,
  declaration:                  true,
  esModuleInterop:              true,
  module:                       "ESNext",
  moduleResolution:             "Node",
  noImplicitAny:                true,
  noImplicitReturns:            true,
  noImplicitThis:               true,
  strict:                       true,
  strictBindCallApply:          true,
  strictFunctionTypes:          true,
  strictNullChecks:             true,
  strictPropertyInitialization: true,
  target:                       "ESNext",
  ...specificOptions[file as keyof typeof specificOptions]
};
const include = file === "tsconfig.json" ? (PACKAGE === "core" ? ["packages/**/*.ts", "utils.ts"] : ["*.ts", "test/*.ts", "../../vitest-env.d.ts"]) : ["*.ts"];
const references = ["core", "sedentary"].includes(PACKAGE) || file !== "tsconfig.json" ? {} : { references: [{ path: "../sedentary" }] };

function tsconfig_json() {
  return writeFile(file, `${JSON.stringify(sort({ compilerOptions, include, ...references }), null, 2)}\n`);
}

(() => {
  switch(file) {
  case "deploy":
    return version();
  case "package.json":
    return package_json();
  case "tsconfig.json":
  case "tsconfig.cjs.json":
  case "tsconfig.es.json":
  case "tsconfig.types.json":
    return tsconfig_json();
  }

  return new Promise<void>(() => process.stderr.write(`Unknown file: ${file}\n`, "utf-8", () => process.exit(1)));
})().catch(error => process.stderr.write(inspect(error, { depth: null })));
