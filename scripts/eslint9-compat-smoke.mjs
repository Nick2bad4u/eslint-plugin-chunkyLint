#!/usr/bin/env node

/**
 * ESLint runtime compatibility smoke check.
 *
 * This script verifies the currently installed ESLint major version (when
 * requested) and runs a minimal end-to-end `ESLintChunker` execution so CI can
 * catch runtime breakages across supported ESLint majors.
 */

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const localRequire = createRequire(import.meta.url);
const distEntryUrl = new URL("../dist/chunky-lint.js", import.meta.url);
const compatConfigPath = fileURLToPath(
    new URL("./eslint9-compat.fixture.config.mjs", import.meta.url)
);

/**
 * Parse script arguments.
 *
 * Supported options:
 *
 * - `--consumer-root=/path/to/consumer`
 * - `--expect-eslint-major=9`
 * - `--expect-eslint-major 9`
 *
 * @param {readonly string[]} argumentList
 *
 * @returns {{
 *     consumerRoot: string | null;
 *     expectedEslintMajor: number | null;
 * }}
 *
 * @throws {TypeError} When an argument is unknown or has an invalid value.
 */
const parseArguments = (argumentList) => {
    /** @type {number | null} */
    let expectedEslintMajor = null;
    /** @type {string | null} */
    let consumerRoot = null;

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

        if (argument.startsWith("--consumer-root=")) {
            const value = argument.slice("--consumer-root=".length).trim();

            if (value === "") {
                throw new TypeError(
                    "Expected a nonblank path after --consumer-root=."
                );
            }

            consumerRoot = path.resolve(value);
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
        consumerRoot,
        expectedEslintMajor,
    };
};

/**
 * Resolve installed ESLint runtime version.
 *
 * @param {ReturnType<typeof createRequire>} runtimeRequire
 *
 * @returns {{ major: number; version: string }}
 *
 * @throws {TypeError} When the installed ESLint version cannot be parsed.
 */
const resolveInstalledEslintVersion = (runtimeRequire) => {
    /** @type {Record<string, unknown>} */
    const eslintPackageJson = runtimeRequire("eslint/package.json");
    const versionValue = eslintPackageJson["version"];

    if (typeof versionValue !== "string") {
        throw new TypeError("Unable to resolve installed eslint version.");
    }

    const [majorSegment] = versionValue.split(".");
    const major = Number.parseInt(majorSegment ?? "", 10);

    if (!Number.isInteger(major)) {
        throw new TypeError(
            `Unable to parse eslint major from version ${versionValue}.`
        );
    }

    return {
        major,
        version: versionValue,
    };
};

/**
 * Resolve the package entrypoint that must execute in the smoke test.
 *
 * @param {string | null} consumerRoot
 * @param {ReturnType<typeof createRequire>} runtimeRequire
 *
 * @returns {URL}
 */
const resolveRuntimeEntryUrl = (consumerRoot, runtimeRequire) =>
    consumerRoot === null
        ? distEntryUrl
        : pathToFileURL(runtimeRequire.resolve("eslint-plugin-chunkylint"));

/**
 * Resolve the working directory and source file for a local or consumer test.
 *
 * @param {string | null} consumerRoot
 *
 * @returns {{ cwd: string; include: string[] }}
 */
const resolveSmokeTarget = (consumerRoot) => {
    if (consumerRoot === null) {
        return {
            cwd: fileURLToPath(new URL("..", import.meta.url)),
            include: ["scripts/eslint9-compat-smoke.mjs"],
        };
    }

    return {
        cwd: consumerRoot,
        include: ["smoke.js"],
    };
};

/**
 * Run a minimal chunker execution to validate runtime integration.
 *
 * @param {string | null} consumerRoot
 * @param {ReturnType<typeof createRequire>} runtimeRequire
 *
 * @returns {Promise<string>} The runtime entrypoint used for the smoke test.
 */
const runChunkerSmoke = async (consumerRoot, runtimeRequire) => {
    const runtimeEntryUrl = resolveRuntimeEntryUrl(
        consumerRoot,
        runtimeRequire
    );
    const smokeTarget = resolveSmokeTarget(consumerRoot);
    const runtimeModule =
        // eslint-disable-next-line no-unsanitized/method -- Controlled file:// URL resolved from static relative path.
        await import(runtimeEntryUrl.href);
    const ESLintChunker = runtimeModule.ESLintChunker ?? runtimeModule.default;

    if (typeof ESLintChunker !== "function") {
        throw new TypeError(
            "The resolved eslint-plugin-chunkylint entrypoint does not export an ESLintChunker constructor."
        );
    }

    const chunker = new ESLintChunker({
        chunkLogs: false,
        config: compatConfigPath,
        continueOnError: false,
        cwd: smokeTarget.cwd,
        include: smokeTarget.include,
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

    return fileURLToPath(runtimeEntryUrl);
};

const main = async () => {
    const { consumerRoot, expectedEslintMajor } = parseArguments(
        process.argv.slice(2)
    );
    const runtimeRequire = consumerRoot
        ? createRequire(path.join(consumerRoot, "package.json"))
        : localRequire;
    const { major, version } = resolveInstalledEslintVersion(runtimeRequire);

    if (expectedEslintMajor !== null && major !== expectedEslintMajor) {
        throw new RangeError(
            [
                "Installed ESLint major does not match expected value.",
                `Expected: ${expectedEslintMajor.toString()}.`,
                `Actual: ${major.toString()} (${version}).`,
            ].join(" ")
        );
    }

    const runtimeEntryPath = await runChunkerSmoke(
        consumerRoot,
        runtimeRequire
    );

    console.log(
        [
            "ESLint compatibility smoke check passed.",
            `eslint=${version}`,
            `entry=${runtimeEntryPath}`,
        ].join(" ")
    );
};

try {
    await main();
} catch (error) {
    console.error("ESLint compatibility smoke check failed:", error);
    process.exitCode = 1;
}
