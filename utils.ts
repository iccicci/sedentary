// eslint-disable-next-line @typescript-eslint/no-var-requires
const { readdir, unlink, writeFile } = require("fs");

const common: string[] = [".gitignore", ".npmignore", ".nyc_output", "*.tgz", "coverage", "node_modules", ""];
const git: string[] = ["index.d.ts", "index.js", "src/*.d.ts", "src/*.js"];
const npm: string[] = [".*", "index.ts", "src/*.ts", "test", "tsconfig.json", "utils.ts"];

if(process.argv[2] === "clean") {
	unlink("index.js", (): void =>
		unlink("index.d.ts", (): void =>
			readdir("src", (error: Error, files: string[]) => files.filter((name: string) => /\.(j|d\.t)s$/.test(name)).forEach(file => unlink(`src/${file}`, (): void => {})))
		)
	);
}
if(process.argv[2] === "ignore") writeFile(".gitignore", [...git, ...common].join("\n"), (): void => writeFile(".npmignore", [...npm, ...common].join("\n"), (): void => {}));
