// eslint-disable-next-line @typescript-eslint/no-var-requires
const { writeFile } = require("fs").promises;

const common: string[] = ["*.db", "*.tgz", "coverage", "node_modules", "sedentary-mysql", "sedentary-pg", "sedentary-sqlite", ""];
const git: string[] = [".gitignore", ".npmignore", ".nyc_output", "index.js", "src/*.d.ts", "src/*.js"];
const npm: string[] = [".*", "Makefile", "index.ts", "src/*.ts", "test", "tsconfig.json", "utils.ts"];

async function main() {
  if(process.argv[2] === "clean") console.log("OVVAIAAAAAAAAAAAAAAAAAAAAA");

  if(process.argv[2] === "ignore") console.log("OLLEATIIIIIIIIIIIII");

  if(process.argv[2] === "gitignore") writeFile(".gitignore", [...git, ...common].join("\n"));
  if(process.argv[2] === "npmignore") writeFile(".npmignore", [...npm, ...common].join("\n"));
}

main();
