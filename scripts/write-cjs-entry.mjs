import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const cjsDistDir = resolve(process.cwd(), "dist", "cjs"),
    cjsPackageJsonPath = resolve(cjsDistDir, "package.json"),
    cjsEntryPath = resolve(process.cwd(), "dist", "chunky-lint.cjs"),
    cjsTypesPath = resolve(process.cwd(), "dist", "chunky-lint.d.cts");

await mkdir(cjsDistDir, { recursive: true });

await writeFile(
    cjsPackageJsonPath,
    `${JSON.stringify(
        {
            type: "commonjs",
        },
        null,
        4
    )}\n`,
    "utf8"
);

await writeFile(
    cjsEntryPath,
    '"use strict";\n\nmodule.exports = require("./cjs/chunky-lint.js");\n',
    "utf8"
);

await writeFile(
    cjsTypesPath,
    [
        'import type * as ChunkyLintModule from "./chunky-lint.js";',
        "",
        "declare const chunkyLint: typeof ChunkyLintModule;",
        "",
        "export = chunkyLint;",
        "",
    ].join("\n"),
    "utf8"
);
