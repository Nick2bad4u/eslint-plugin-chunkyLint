#!/usr/bin/env node

/**
 * Verify the runtime contracts of the built ESM and CommonJS entrypoints.
 */

import { createRequire } from "node:module";

const runtimeRequire = createRequire(import.meta.url);
const esmModule = await import("../dist/chunky-lint.js");
const cjsModule = runtimeRequire("../dist/chunky-lint.cjs");
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

console.log("Built ESM and CommonJS entrypoint contracts are valid.");
