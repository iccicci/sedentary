import YAML from "yamljs";
import { promises } from "fs";

const { readFile, writeFile } = promises;

const { VERSION, npm_package_name } = process.env;

const common: string[] = ["*.db", "*.tgz", "coverage", "node_modules", "sedentary-mysql", "sedentary-pg", "sedentary-sqlite", ""];
const git: string[] = [".gitignore", ".npmignore", ".nyc_output", "index.d.ts", "index.js", "lib/*.d.ts", "lib/*.js"];
const npm: string[] = [".*", "Makefile", "index.ts", "lib/db.ts", "lib/minidb.ts", "lib/transaction.ts", "test", "tsconfig.json", "utils.ts"];

const descriptions = { sedentary: "", "sedentary-mysql": " - MySQL", "sedentary-pg": " - PostgreSQL", "sedentary-sqlite": " - SQLite" };
const urls = { sedentary: "", "sedentary-mysql": "-mysql", "sedentary-pg": "-pg", "sedentary-sqlite": "-sqlite" };
const deps = { "sedentary-mysql": {}, "sedentary-pg": { "@types/pg": "7.14.6", pg: "8.5.1" }, "sedentary-sqlite": {} };

const packagejson = {
  author:          "Daniele Ricci <daniele.icc@gmail.com> (https://github.com/iccicci)",
  dependencies:    {},
  devDependencies: {
    "@types/mocha":                     "8.0.4",
    "@types/node":                      "14.14.7",
    "@types/yamljs":                    "0.2.31",
    "@typescript-eslint/eslint-plugin": "4.8.1",
    "@typescript-eslint/parser":        "4.8.1",
    eslint:                             "7.13.0",
    mocha:                              "8.2.1",
    prettier:                           "2.1.2",
    nyc:                                "15.1.0",
    "ts-node":                          "9.0.0",
    typescript:                         "4.0.5",
    yamljs:                             "0.3.0"
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
    travis:      "node -r ts-node/register utils.ts travis",
    tsc:         "tsc --declaration",
    version:     "node -r ts-node/register utils.ts version"
  },
  types: "index.d.ts"
};

const conditions = { sedentary: "", "sedentary-pg": "&& $PG_VERSION == 13 " };
const travis = {
  common: {
    after_script: [
      `if [[ \`node --version\` =~ ^v14 ${conditions[npm_package_name]}]] ; then npm run coverage ; npm install codeclimate-test-reporter ; codeclimate-test-reporter < coverage/lcov.info ; fi`
    ],
    language: "node_js",
    node_js:  ["14", "12", "10"],
    sudo:     "required"
  },
  sedentary:      { env: { global: "CODECLIMATE_REPO_TOKEN=1aa1f737e7bf7d2859a2c7d9a0d9634a0d9aa89e3a19476d576faa7d02a1d46f" } },
  "sedentary-pg": {
    before_install: ["sudo service postgresql stop", "sudo service postgresql restart $PG_VERSION"],
    before_script:  [
      'psql -c "CREATE DATABASE sedentary;" -U postgres',
      "psql -c \"ALTER DATABASE sedentary SET timezone TO 'GMT';\" -U postgres",
      'export SPG=\'{"user":"postgres","password":"postgres"}\''
    ],
    env: {
      global: ["CODECLIMATE_REPO_TOKEN=c7519657dfea145349c1b7a98f7134f033c25f598b40ad5b077744eb4beb7c66"],
      matrix: ["PG_VERSION=13", "PG_VERSION=12", "PG_VERSION=11", "PG_VERSION=10"]
    }
  }
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
  if(process.argv[2] === "travis") writeFile(".travis.yml", YAML.stringify(sort({ ...travis.common, ...travis[npm_package_name] }), 4, 2), "utf-8");

  if(process.argv[2] === "packagejson") {
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

  if(process.argv[2] === "version") {
    const pkg = JSON.parse(await readFile("package.json", "utf-8"));

    pkg.version = VERSION;

    writeFile("package.json", JSON.stringify(pkg, null, 2), "utf-8");
  }
})();
