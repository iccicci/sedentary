import { promises } from "fs";

const { readFile, writeFile } = promises;

const common: string[] = ["*.db", "*.tgz", "coverage", "node_modules", "sedentary-mysql", "sedentary-pg", "sedentary-sqlite", ""];
const git: string[] = [".gitignore", ".npmignore", ".nyc_output", "index.d.ts", "index.js", "src/*.d.ts", "src/*.js"];
const npm: string[] = [".*", "Makefile", "index.ts", "src/*.ts", "test", "tsconfig.json", "utils.ts"];

const descriptions = { sedentary: "", "sedentary-mysql": " - MySQL", "sedentary-pg": " - PostgreSQL", "sedentary-sqlite": " - SQLite" };
const urls = { sedentary: "", "sedentary-mysql": "-mysql", "sedentary-pg": "-pg", "sedentary-sqlite": "-sqlite" };
const deps = { "sedentary-mysql": {}, "sedentary-pg": { "@types/pg": "7.14.5", pg: "8.3.3" }, "sedentary-sqlite": {} };

const packagejson = {
  author:          "Daniele Ricci <daniele.icc@gmail.com> (https://github.com/iccicci)",
  dependencies:    {},
  devDependencies: {
    "@types/mocha":                     "8.0.3",
    "@types/node":                      "14.11.2",
    "@typescript-eslint/eslint-plugin": "4.3.0",
    "@typescript-eslint/parser":        "4.3.0",
    eslint:                             "7.10.0",
    mocha:                              "8.1.3",
    nyc:                                "15.1.0",
    "ts-node":                          "9.0.0",
    typescript:                         "4.0.3"
  },
  engines:  { node: ">=10.0" },
  keywords: ["DB", "ORM", "database", "migration", "mysql", "postgresql", "sqlite"],
  license:  "MIT",
  prettier: {
    arrowParens:        "avoid",
    endOfLine:          "lf",
    jsxBracketSameLine: true,
    printWidth:         200,
    trailingComma:      "none",
    useTabs:            false
  },
  readmeFilename: "README.md",
  scripts:        {
    coverage:    "nyc -r lcov -r text -r text-summary -r html mocha -r ts-node/register test/*js test/*ts",
    gitignore:   "node -r ts-node/register utils.ts gitignore",
    npmignore:   "node -r ts-node/register utils.ts npmignore",
    packagejson: "node -r ts-node/register utils.ts packagejson",
    test:        "mocha -r ts-node/register test/*js test/*ts",
    tsc:         "tsc --declaration"
  },
  types: "index.d.ts"
};

function sort(obj: { [key: string]: unknown } | unknown): { [key: string]: unknown } | unknown {
  const ret = {};

  if(obj instanceof Array || ! (obj instanceof Object)) return obj;

  Object.entries(obj)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .forEach(([k, v]) => (ret[k] = sort(v)));

  return ret;
}

(async function() {
  if(process.argv[2] === "gitignore") writeFile(".gitignore", [...git, ...common].join("\n"), "utf-8");
  if(process.argv[2] === "npmignore") writeFile(".npmignore", [...npm, ...common].join("\n"), "utf-8");

  if(process.argv[2] === "packagejson") {
    const { npm_package_name } = process.env;
    const bugs = `https://github.com/iccicci/sedentary${urls[npm_package_name]}/issues`;
    const description = "The ORM which never needs to migrate" + descriptions[npm_package_name];
    const homepage = `https://github.com/iccicci/sedentary${urls[npm_package_name]}#readme`;
    const repository = `https://github.com/iccicci/sedentary${urls[npm_package_name]}`;
    const pkg = JSON.parse(await readFile("package.json", "utf-8"));
    const { name, version } = pkg;
    let { dependencies } = pkg;
    let { sedentary } = dependencies;

    try {
      const { version } = JSON.parse(await readFile("../package.json", "utf-8"));

      sedentary = version;
      dependencies = { ...deps[npm_package_name], sedentary };
    } catch(e) {}

    writeFile("package.json", JSON.stringify(sort({ ...packagejson, bugs, dependencies, description, homepage, name, repository, version }), null, 2), "utf-8");
  }
})();
