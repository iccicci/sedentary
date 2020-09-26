// eslint-disable-next-line @typescript-eslint/no-var-requires
const { readdir, unlink, writeFile } = require("fs").promises;

const common: string[] = [".gitignore", ".npmignore", ".nyc_output", "*.db","*.tgz", "coverage", "node_modules", ""];
const git: string[] = ["index.js", "src/*.d.ts", "src/*.js"];
const npm: string[] = [".*", "index.ts", "src/*.ts", "test", "tsconfig.json", "utils.ts"];

async function main() {
  if(process.argv[2] === "clean") {
    const files = await readdir("src");

    try {
      await unlink("index.js");
    } catch(e) {}
    files.filter((file: string) => /\.(j|d\.t)s$/.test(file)).forEach((file: string) => unlink(`src/${file}`));
  }

  if(process.argv[2] === "ignore") {
    writeFile(".gitignore", [...git, ...common].join("\n"));
    writeFile(".npmignore", [...npm, ...common].join("\n"));
  }
}

main();
