import { readFile, writeFile } from "fs/promises";

const [, , file] = process.argv;
const { PACKAGE } = process.env as { PACKAGE: "core" | "sedentary" | "sedentary-pg" };
const sedentary = PACKAGE === "sedentary";

function sort(obj: { [key: string]: unknown } | unknown): { [key: string]: unknown } | unknown {
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
  const packages = {
    core:      {},
    sedentary: {
      description,
      tsd: {
        compilerOptions: {
          alwaysStrict:                 true,
          esModuleInterop:              true,
          moduleResolution:             "Node",
          noImplicitAny:                true,
          noImplicitReturns:            true,
          noImplicitThis:               true,
          strict:                       true,
          strictBindCallApply:          true,
          strictFunctionTypes:          true,
          strictNullChecks:             true,
          strictPropertyInitialization: true,
          target:                       "ESNext"
        }
      }
    },
    "sedentary-pg": {
      dependencies: { "@types/pg": "8.6.5", pg: "8.7.3", "pg-format": "1.0.4", sedentary: version },
      description:  description + " - PostgreSQL"
    }
  };
  const res: Record<string, unknown> = {
    author,
    bugs,
    contributors,
    engines,
    funding,
    homepage: `https://github.com/iccicci/sedentary/packages/${PACKAGE}#readme`,
    keywords,
    license,
    main:     "./dist/cjs/index.js",
    module:   "./dist/es/index.js",
    name:     PACKAGE,
    optionalDependencies,
    readmeFilename,
    repository,
    scripts:  {
      build:       "make build",
      coverage:    "jest --coverage --runInBand",
      deploy:      'npm_config_registry="registry.npmjs.org" npm publish',
      precoverage: "make pretest",
      preinstall:  "if [ -f Makefile ] ; then make ; fi",
      pretest:     "make pretest",
      test:        "jest --runInBand"
    },
    types: "./dist/types/index.d.ts",
    version,
    ...packages[PACKAGE]
  };

  writeFile(file, JSON.stringify(sort(res), null, 2) + "\n");
}

const common = ["*.tgz", ".gitignore", ".npmignore", "coverage", "jest.config.js", "node_modules", ...(sedentary ? ["test.json"] : []), "tsconfig.*.json"];
const ignored = {
  ".gitignore": [...common, "dist", ...(sedentary ? [] : ["test/0*.test.ts", "test/helper.ts"])],
  ".npmignore": [...common, ".*", "*.ts", "!*.d.ts", "Makefile", "test", "tsconfig.json"]
};

function ignore() {
  writeFile(file, [...ignored[file as keyof typeof ignored]].join("\n") + "\n");
}

const coverage = { core: [], sedentary: ["db.ts", "index.ts"], "sedentary-pg": ["index.ts", "pgdb.ts"] };

function jest_config_js() {
  const collect = coverage[PACKAGE].map(_ => `"${_}"`).join(", ");
  const content = `module.exports = { collectCoverageFrom: [${collect}], preset: "ts-jest", testEnvironment: "jest-environment-node-single-context", testSequencer: "../../scripts/testSequencer.js" };\n`;

  writeFile(file, content);
}

async function version() {
  const { version } = await read_package_json("package.json");

  process.stdout.write(version + "\n", "utf-8");
}

const specificOptions = {
  "tsconfig.json":       {},
  "tsconfig.cjs.json":   { module: "CommonJS", outDir: "dist/cjs", target: "ES2020" },
  "tsconfig.es.json":    { module: "ESNext", outDir: "dist/es" },
  "tsconfig.types.json": { declaration: true, emitDeclarationOnly: true, outDir: "dist/types" }
};
const compilerOptions = {
  alwaysStrict:                 true,
  esModuleInterop:              true,
  moduleResolution:             "Node",
  noImplicitAny:                true,
  noImplicitThis:               true,
  noImplicitReturns:            true,
  strict:                       true,
  strictBindCallApply:          true,
  strictFunctionTypes:          true,
  strictNullChecks:             true,
  strictPropertyInitialization: true,
  target:                       "ESNext",
  ...specificOptions[file as keyof typeof specificOptions]
};
const include = file === "tsconfig.json" ? (PACKAGE === "core" ? ["packages/**/*.ts", "scripts/*.ts"] : ["*.ts", "test/*.ts"]) : ["*.ts"];

function tsconfig_json() {
  writeFile(file, JSON.stringify(sort({ compilerOptions, include }), null, 2) + "\n");
}

(() => {
  switch(file) {
  case ".gitignore":
  case ".npmignore":
    return ignore();
  case "deploy":
    return version();
  case "jest.config.js":
    return jest_config_js();
  case "package.json":
    return package_json();
  case "tsconfig.json":
  case "tsconfig.cjs.json":
  case "tsconfig.es.json":
  case "tsconfig.types.json":
    return tsconfig_json();
  }

  process.stderr.write(`Unknown file: ${file}\n`, "utf-8", () => process.exit(1));
})();
