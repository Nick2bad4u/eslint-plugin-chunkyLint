import type { Promisable, UnknownRecord } from "type-fest";

import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
    isDefined,
    isInteger,
    objectHasOwn,
    safeCastTo,
    stringSplit,
} from "ts-extras";

import type { ChunkyLintConfig } from "../types/chunky-lint-types.js";

/**
 * Possible config file names in order of preference.
 */
const CONFIG_FILE_NAMES = [
    ".chunkylint.js",
    ".chunkylint.json",
    ".chunkylint.mjs",
    ".chunkylint.ts",
    "chunkylint.config.js",
    "chunkylint.config.json",
    "chunkylint.config.mjs",
    "chunkylint.config.ts",
] as const;

const validateConfig = (config: unknown): ChunkyLintConfig => {
    if (config === null || typeof config !== "object") {
        throw new Error("Config must be an object");
    }

    const normalizedConfig = safeCastTo<ChunkyLintConfig>(config);

    if (
        isDefined(normalizedConfig.size) &&
        (!isInteger(normalizedConfig.size) || normalizedConfig.size <= 0)
    ) {
        throw new Error("size must be a positive integer");
    }

    if (
        isDefined(normalizedConfig.concurrency) &&
        (!isInteger(normalizedConfig.concurrency) ||
            normalizedConfig.concurrency <= 0)
    ) {
        throw new Error("concurrency must be a positive integer");
    }

    if (
        isDefined(normalizedConfig.include) &&
        !Array.isArray(normalizedConfig.include)
    ) {
        throw new Error("include must be an array of strings");
    }

    if (
        isDefined(normalizedConfig.ignore) &&
        !Array.isArray(normalizedConfig.ignore)
    ) {
        throw new Error("ignore must be an array of strings");
    }

    if (
        isDefined(normalizedConfig.verbose) &&
        typeof normalizedConfig.verbose !== "boolean"
    ) {
        throw new Error("verbose must be a boolean");
    }

    if (
        isDefined(normalizedConfig.quiet) &&
        typeof normalizedConfig.quiet !== "boolean"
    ) {
        throw new Error("quiet must be a boolean");
    }

    if (
        isDefined(normalizedConfig.chunkLogs) &&
        typeof normalizedConfig.chunkLogs !== "boolean"
    ) {
        throw new Error("chunkLogs must be a boolean");
    }

    return normalizedConfig;
};

const isConfigFactory = (
    candidate: unknown
): candidate is () => Promisable<unknown> => typeof candidate === "function";

const isUnknownRecord = (value: unknown): value is UnknownRecord =>
    value !== null && typeof value === "object";

const loadJsonConfig = async (filePath: string): Promise<ChunkyLintConfig> => {
    try {
        const fileUrl = pathToFileURL(filePath);
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- Config path is resolved from explicit user input or controlled discovery.
        const content = await fs.readFile(fileUrl);
        const config = JSON.parse(content.toString()) as unknown;
        return validateConfig(config);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse JSON config: ${message}`, {
            cause: error,
        });
    }
};

const findConfigFile = async (cwd: string): Promise<null | string> => {
    const candidates = CONFIG_FILE_NAMES.map((fileName) =>
        path.join(cwd, fileName)
    );

    const checks = await Promise.all(
        candidates.map(async (filePath) => {
            try {
                await fs.access(filePath);
                return filePath;
            } catch {
                return null;
            }
        })
    );

    const found = checks.find((value): value is string => value !== null);
    return found ?? null;
};

/**
 * Load JavaScript/TypeScript config file.
 *
 * @param filePath - Absolute path to the config file.
 *
 * @returns Parsed and validated chunky-lint config.
 *
 * @throws - When import or validation fails.
 */
export async function loadJsConfig(
    filePath: string
): Promise<ChunkyLintConfig> {
    try {
        const fileUrl = pathToFileURL(filePath).href;
        // eslint-disable-next-line no-unsanitized/method -- Dynamic import target is derived from a validated local filesystem path.
        const loadedModule: unknown = await import(fileUrl);
        const moduleRecord = isUnknownRecord(loadedModule)
            ? loadedModule
            : null;
        const hasDefaultExport =
            moduleRecord !== null && objectHasOwn(moduleRecord, "default");
        const exportedConfig = hasDefaultExport
            ? moduleRecord.default
            : loadedModule;

        if (isConfigFactory(exportedConfig)) {
            return validateConfig(await exportedConfig());
        }

        return validateConfig(exportedConfig);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to load JS/TS config: ${message}`, {
            cause: error,
        });
    }
}

const loadConfigFile = async (filePath: string): Promise<ChunkyLintConfig> => {
    const ext = stringSplit(filePath, ".").pop()?.toLowerCase();

    if (ext === "json") {
        return loadJsonConfig(filePath);
    }

    if (ext === "js" || ext === "mjs" || ext === "ts") {
        return loadJsConfig(filePath);
    }

    throw new Error(`Unsupported config file type: ${ext}`);
};

/**
 * Load chunky-lint configuration from an explicit path or by auto-discovery.
 *
 * @param configPath - Optional explicit config path.
 * @param cwd - Working directory used for path resolution and discovery.
 *
 * @returns Parsed config object or `null` when no config is found.
 *
 * @throws - When discovery, reading, parsing, or validation fails.
 */
export async function loadConfig(
    configPath?: string,
    cwd: string = process.cwd()
): Promise<ChunkyLintConfig | null> {
    try {
        const hasExplicitConfigPath =
            typeof configPath === "string" && configPath.length > 0;

        const targetPath = hasExplicitConfigPath
            ? path.resolve(cwd, configPath)
            : await findConfigFile(cwd);

        if (targetPath === null) {
            return null;
        }

        try {
            await fs.access(targetPath);
        } catch {
            if (hasExplicitConfigPath) {
                throw new Error(`Config file not found: ${targetPath}`);
            }
            return null;
        }

        return await loadConfigFile(targetPath);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to load config: ${message}`, { cause: error });
    }
}

/**
 * Merge file-based config with CLI options, where CLI values win.
 *
 * @param config - Base config loaded from file.
 * @param cliOptions - Partial overrides provided via CLI.
 *
 * @returns Merged chunky-lint configuration.
 */
export function mergeConfig(
    config: Readonly<ChunkyLintConfig>,
    cliOptions: Readonly<Partial<ChunkyLintConfig>>
): ChunkyLintConfig {
    const mergedConfig: ChunkyLintConfig = { ...config };

    if (isDefined(cliOptions.cacheLocation)) {
        mergedConfig.cacheLocation = cliOptions.cacheLocation;
    }

    if (isDefined(cliOptions.chunkLogs)) {
        mergedConfig.chunkLogs = cliOptions.chunkLogs;
    }

    if (isDefined(cliOptions.concurrency)) {
        mergedConfig.concurrency = cliOptions.concurrency;
    }

    if (isDefined(cliOptions.config)) {
        mergedConfig.config = cliOptions.config;
    }

    if (isDefined(cliOptions.continueOnError)) {
        mergedConfig.continueOnError = cliOptions.continueOnError;
    }

    if (isDefined(cliOptions.cwd)) {
        mergedConfig.cwd = cliOptions.cwd;
    }

    if (isDefined(cliOptions.fix)) {
        mergedConfig.fix = cliOptions.fix;
    }

    if (isDefined(cliOptions.followSymlinks)) {
        mergedConfig.followSymlinks = cliOptions.followSymlinks;
    }

    if (isDefined(cliOptions.ignore)) {
        mergedConfig.ignore = cliOptions.ignore;
    }

    if (isDefined(cliOptions.include)) {
        mergedConfig.include = cliOptions.include;
    }

    if (isDefined(cliOptions.quiet)) {
        mergedConfig.quiet = cliOptions.quiet;
    }

    if (isDefined(cliOptions.size)) {
        mergedConfig.size = cliOptions.size;
    }

    if (isDefined(cliOptions.verbose)) {
        mergedConfig.verbose = cliOptions.verbose;
    }

    return mergedConfig;
}
