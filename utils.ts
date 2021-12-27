import YAML from "yamljs";
import { promises } from "fs";

const { readFile, writeFile } = promises;

const { VERSION, npm_package_name } = process.env as { VERSION: string; npm_package_name: "sedentary" | "sedentary-pg" };

const common: string[] = ["*.tgz", "coverage", "node_modules", "test.json", ""];
const git: string[] = [".gitignore", ".npmignore", ".nyc_output", "docs/build", "docs/__pycache__", "index.d.ts", "index.js", "lib/*.d.ts", "lib/*.js"];
const npm: string[] = [".*", "Makefile", "docs", "index.ts", "lib/db.ts", "lib/minidb.ts", "lib/transaction.ts", "sedentary-*", "test", "tsconfig.json", "utils.ts"];

const descriptions = { sedentary: "", "sedentary-mysql": " - MySQL", "sedentary-pg": " - PostgreSQL", "sedentary-sqlite": " - SQLite" };
const urls = { sedentary: "", "sedentary-mysql": "-mysql", "sedentary-pg": "-pg", "sedentary-sqlite": "-sqlite" };
const deps = { sedentary: {}, "sedentary-mysql": {}, "sedentary-pg": { "@types/pg": "8.6.3", "@types/pg-format": "1.0.2", pg: "8.7.1", "pg-format": "1.0.4" }, "sedentary-sqlite": {} };

const packagejson = {
  author:          "Daniele Ricci <daniele.icc@gmail.com> (https://github.com/iccicci)",
  dependencies:    {},
  devDependencies: {
    "@types/mocha":                     "9.0.0",
    "@types/node":                      "17.0.4",
    "@types/yamljs":                    "0.2.31",
    "@typescript-eslint/eslint-plugin": "5.8.0",
    "@typescript-eslint/parser":        "5.8.0",
    eslint:                             "8.5.0",
    mocha:                              "9.1.3",
    prettier:                           "2.5.1",
    nyc:                                "15.1.0",
    "ts-node":                          "10.4.0",
    tsd:                                "0.19.0",
    typescript:                         "4.5.4",
    yamljs:                             "0.3.0"
  },
  engines:  { node: ">=12.0" },
  funding:  { url: "https://blockchain.info/address/1Md9WFAHrXTb3yPBwQWmUfv2RmzrtbHioB" },
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
    coverage:    "nyc -r lcov -r text -r text-summary -r html mocha -r ts-node/register test/*ts",
    gitignore:   "node -r ts-node/register utils.ts gitignore",
    npmignore:   "node -r ts-node/register utils.ts npmignore",
    packagejson: "node -r ts-node/register utils.ts packagejson",
    test:        "mocha -r ts-node/register test/*ts",
    travis:      "node -r ts-node/register utils.ts travis",
    tsc:         "tsc --declaration",
    version:     "node -r ts-node/register utils.ts version"
  },
  tsd:   { compilerOptions: {} },
  types: "index.d.ts"
};

const before_script_common = [
  "curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter",
  "chmod +x ./cc-test-reporter",
  "./cc-test-reporter before-build"
];
const conditions = { sedentary: "", "sedentary-pg": "&& $PG_VERSION == 14 " };
const travis = {
  common: {
    after_script:  [`if [[ \`node --version\` =~ ^v16 ${conditions[npm_package_name]}]] ; then ./cc-test-reporter after-build --exit-code $TRAVIS_TEST_RESULT ; fi`],
    before_script: before_script_common,
    language:      "node_js",
    node_js:       ["16", "14", "12"],
    script:        "npm run coverage",
    sudo:          "required"
  },
  sedentary:      { env: { global: ["CC_TEST_REPORTER_ID=1aa1f737e7bf7d2859a2c7d9a0d9634a0d9aa89e3a19476d576faa7d02a1d46f"] } },
  "sedentary-pg": {
    before_install: ["sudo service postgresql stop", "sudo service postgresql restart $PG_VERSION"],
    before_script:  [
      ...before_script_common,
      'psql -c "CREATE DATABASE sedentary;" -U postgres',
      "psql -c \"ALTER DATABASE sedentary SET timezone TO 'GMT';\" -U postgres",
      'export SPG=\'{"database":"sedentary","password":"postgres","user":"postgres"}\''
    ],
    env: {
      global: ["CC_TEST_REPORTER_ID=c7519657dfea145349c1b7a98f7134f033c25f598b40ad5b077744eb4beb7c66"],
      matrix: ["PG_VERSION=14", "PG_VERSION=13", "PG_VERSION=12", "PG_VERSION=11", "PG_VERSION=10"]
    }
  }
};

function sort(obj: { [key: string]: unknown } | unknown): { [key: string]: unknown } | unknown {
  const ret: Record<string, unknown> = {};

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
    const { compilerOptions } = JSON.parse(await readFile("tsconfig.json", "utf-8"));
    const { name, version } = pkg;
    const tsd = { compilerOptions };
    let { dependencies } = pkg;
    let { sedentary } = dependencies;

    try {
      const { version } = JSON.parse(await readFile("../package.json", "utf-8"));

      sedentary = version;
      dependencies = { ...deps[npm_package_name], sedentary };
    } catch(e) {}

    await writeFile("package.json", JSON.stringify(sort({ ...packagejson, bugs, dependencies, description, homepage, name, repository, tsd, version }), null, 2), "utf-8");
  }

  if(process.argv[2] === "version") {
    const pkg = JSON.parse(await readFile("package.json", "utf-8"));

    pkg.version = VERSION;

    await writeFile("package.json", JSON.stringify(pkg, null, 2), "utf-8");
  }
})();
