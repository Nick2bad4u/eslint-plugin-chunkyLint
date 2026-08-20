#!/usr/bin/env node

/**
 * Verify the runtime contracts of the built ESM and CommonJS entrypoints.
 */

import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const runtimeRequire = createRequire(import.meta.url);
const esmModule = await import("../dist/chunky-lint.js");
const cjsModule = runtimeRequire("../dist/chunky-lint.cjs");
const packageMetadata = runtimeRequire("../package.json");
const {
    ConsoleLogger: cjsConsoleLogger,
    ESLintChunker: cjsESLintChunker,
    FileScanner: cjsFileScanner,
} = cjsModule;

/**
 * Assert that a runtime export is a constructor function.
 *
 * @param {unknown} value
 * @param {string} exportName
 *
 * @returns {asserts value is new (...arguments_: never[]) => unknown}
 */
const assertConstructor = (value, exportName) => {
    if (typeof value !== "function") {
        throw new TypeError(
            `Expected ${exportName} to be a constructor function.`
        );
    }
};

assertConstructor(esmModule.default, "ESM default export");
assertConstructor(esmModule.ESLintChunker, "ESM ESLintChunker export");
assertConstructor(esmModule.FileScanner, "ESM FileScanner export");
assertConstructor(esmModule.ConsoleLogger, "ESM ConsoleLogger export");
assertConstructor(cjsModule, "CommonJS default export");
assertConstructor(cjsESLintChunker, "CommonJS ESLintChunker export");
assertConstructor(cjsFileScanner, "CommonJS FileScanner export");
assertConstructor(cjsConsoleLogger, "CommonJS ConsoleLogger export");

if (esmModule.default !== esmModule.ESLintChunker) {
    throw new TypeError(
        "The ESM default export must equal the named ESLintChunker export."
    );
}

if (!Object.is(cjsModule, cjsESLintChunker)) {
    throw new TypeError(
        "The CommonJS default export must equal the named ESLintChunker export."
    );
}

const packageVersion = packageMetadata["version"];

if (typeof packageVersion !== "string" || packageVersion.trim().length === 0) {
    throw new TypeError(
        "Expected package.json to contain a non-empty string version."
    );
}

const cliPath = fileURLToPath(
        new URL("../dist/bin/eslint-chunker.js", import.meta.url)
    ),
    cliVersion = execFileSync(process.execPath, [cliPath, "--version"], {
        encoding: "utf8",
    }).trim();

if (cliVersion !== packageVersion) {
    throw new TypeError(
        `Expected the built CLI version to equal package.json (${packageVersion}), received ${cliVersion}.`
    );
}

console.log(
    `Built ESM, CommonJS, and CLI entrypoint contracts are valid for v${packageVersion}.`
);
