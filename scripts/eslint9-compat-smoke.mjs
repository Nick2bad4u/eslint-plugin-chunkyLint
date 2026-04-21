#!/usr/bin/env node

/**
 * ESLint runtime compatibility smoke check.
 *
 * This script verifies the currently installed ESLint major version (when
 * requested) and runs a minimal end-to-end `ESLintChunker` execution so CI can
 * catch runtime breakages across supported ESLint majors.
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { ESLintChunker } from "../dist/chunky-lint.js";

const require = createRequire(import.meta.url);
const packageJsonPath = fileURLToPath(
    new URL("../package.json", import.meta.url)
);

/**
 * Parse script arguments.
 *
 * Supported options:
 *
 * - `--expect-eslint-major=9`
 * - `--expect-eslint-major 9`
 *
 * @param {readonly string[]} argumentList
 *
 * @returns {{ expectedEslintMajor: number | null }}
 */
const parseArguments = (argumentList) => {
    /** @type {number | null} */
    let expectedEslintMajor = null;

    for (let index = 0; index < argumentList.length; index += 1) {
        const argument = argumentList[index];

        if (typeof argument !== "string") {
            throw new TypeError(
                `Expected a string command-line argument at index ${index.toString()}.`
            );
        }

        if (argument === "--expect-eslint-major") {
            const value = argumentList[index + 1];

            if (typeof value !== "string") {
                throw new TypeError(
                    "Expected a numeric major version after --expect-eslint-major."
                );
            }

            expectedEslintMajor = Number.parseInt(value, 10);
            index += 1;
            continue;
        }

        if (argument.startsWith("--expect-eslint-major=")) {
            expectedEslintMajor = Number.parseInt(
                argument.slice("--expect-eslint-major=".length),
                10
            );
            continue;
        }

        throw new TypeError(`Unknown argument: ${argument}`);
    }

    if (
        expectedEslintMajor !== null &&
        !Number.isInteger(expectedEslintMajor)
    ) {
        throw new TypeError(
            "--expect-eslint-major must be an integer (for example: 9)."
        );
    }

    return {
        expectedEslintMajor,
    };
};

/**
 * Resolve installed ESLint runtime version.
 *
 * @returns {{ major: number; version: string }}
 */
const resolveInstalledEslintVersion = () => {
    /** @type {{ version?: unknown }} */
    const eslintPackageJson = require("eslint/package.json");

    if (typeof eslintPackageJson.version !== "string") {
        throw new TypeError("Unable to resolve installed eslint version.");
    }

    const [majorSegment] = eslintPackageJson.version.split(".");
    const major = Number.parseInt(majorSegment ?? "", 10);

    if (!Number.isInteger(major)) {
        throw new TypeError(
            `Unable to parse eslint major from version ${eslintPackageJson.version}.`
        );
    }

    return {
        major,
        version: eslintPackageJson.version,
    };
};

/**
 * Run a minimal chunker execution to validate runtime integration.
 *
 * @returns {Promise<void>}
 */
const runChunkerSmoke = async () => {
    const chunker = new ESLintChunker({
        chunkLogs: false,
        continueOnError: false,
        cwd: fileURLToPath(new URL("..", import.meta.url)),
        include: ["scripts/eslint9-compat-smoke.mjs"],
        quiet: true,
        size: 1,
        warnIgnored: false,
    });

    const stats = await chunker.run();

    if (stats.failedChunks > 0) {
        throw new Error(
            `Chunker smoke check reported ${stats.failedChunks.toString()} failed chunks.`
        );
    }
};

const main = async () => {
    const { expectedEslintMajor } = parseArguments(process.argv.slice(2));
    const { major, version } = resolveInstalledEslintVersion();

    if (expectedEslintMajor !== null && major !== expectedEslintMajor) {
        throw new RangeError(
            [
                "Installed ESLint major does not match expected value.",
                `Expected: ${expectedEslintMajor.toString()}.`,
                `Actual: ${major.toString()} (${version}).`,
            ].join(" ")
        );
    }

    await runChunkerSmoke();

    console.log(
        [
            "ESLint compatibility smoke check passed.",
            `eslint=${version}`,
            `package=${packageJsonPath}`,
        ].join(" ")
    );
};

try {
    await main();
} catch (error) {
    console.error("ESLint compatibility smoke check failed:", error);
    process.exitCode = 1;
}
