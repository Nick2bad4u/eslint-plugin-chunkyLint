import { promises as fs } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { isDefined, isInteger, safeCastTo, stringSplit } from "ts-extras";

import type { ChunkyLintConfig } from "../types/chunky-lint-types.js";

/**
 * Possible config file names in order of preference.
 */
const CONFIG_FILE_NAMES = [
    ".chunkylint.ts",
    ".chunkylint.js",
    ".chunkylint.mjs",
    ".chunkylint.json",
    "chunkylint.config.ts",
    "chunkylint.config.js",
    "chunkylint.config.mjs",
    "chunkylint.config.json",
] as const;

const validateConfig = (config: unknown): ChunkyLintConfig => {
    if (config === null || typeof config !== "object") {
        throw new Error("Config must be an object");
    }

    const normalizedConfig = safeCastTo<ChunkyLintConfig>(config);

    if (
        isDefined(normalizedConfig.size) === true &&
        (isInteger(normalizedConfig.size) === false ||
            normalizedConfig.size <= 0)
    ) {
        throw new Error("size must be a positive integer");
    }

    if (
        isDefined(normalizedConfig.concurrency) === true &&
        (isInteger(normalizedConfig.concurrency) === false ||
            normalizedConfig.concurrency <= 0)
    ) {
        throw new Error("concurrency must be a positive integer");
    }

    if (
        isDefined(normalizedConfig.include) === true &&
        !Array.isArray(normalizedConfig.include)
    ) {
        throw new Error("include must be an array of strings");
    }

    if (
        isDefined(normalizedConfig.ignore) === true &&
        !Array.isArray(normalizedConfig.ignore)
    ) {
        throw new Error("ignore must be an array of strings");
    }

    if (
        isDefined(normalizedConfig.verbose) === true &&
        typeof normalizedConfig.verbose !== "boolean"
    ) {
        throw new Error("verbose must be a boolean");
    }

    if (
        isDefined(normalizedConfig.quiet) === true &&
        typeof normalizedConfig.quiet !== "boolean"
    ) {
        throw new Error("quiet must be a boolean");
    }

    if (
        isDefined(normalizedConfig.chunkLogs) === true &&
        typeof normalizedConfig.chunkLogs !== "boolean"
    ) {
        throw new Error("chunkLogs must be a boolean");
    }

    return normalizedConfig;
};

const loadJsonConfig = async (filePath: string): Promise<ChunkyLintConfig> => {
    try {
        const content = await fs.readFile(filePath, "utf8");
        const config = JSON.parse(content) as unknown;
        return validateConfig(config);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse JSON config: ${message}`, {
            cause: error,
        });
    }
};

const findConfigFile = async (cwd: string): Promise<null | string> => {
    const candidates = CONFIG_FILE_NAMES.map((fileName) => join(cwd, fileName));

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
 */
export async function loadJsConfig(
    filePath: string
): Promise<ChunkyLintConfig> {
    try {
        const fileUrl = pathToFileURL(filePath).href;
        // eslint-disable-next-line no-unsanitized/method -- Dynamic import target is derived from a validated local filesystem path.
        const module = await import(fileUrl);
        const exportedConfig = module.default ?? module;

        if (typeof exportedConfig === "function") {
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
 */
export async function loadConfig(
    configPath?: string,
    cwd: string = process.cwd()
): Promise<ChunkyLintConfig | null> {
    try {
        const hasExplicitConfigPath =
            typeof configPath === "string" && configPath.length > 0;

        const targetPath = hasExplicitConfigPath
            ? resolve(cwd, configPath)
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

    if (cliOptions.cacheLocation !== undefined) {
        mergedConfig.cacheLocation = cliOptions.cacheLocation;
    }

    if (cliOptions.chunkLogs !== undefined) {
        mergedConfig.chunkLogs = cliOptions.chunkLogs;
    }

    if (cliOptions.concurrency !== undefined) {
        mergedConfig.concurrency = cliOptions.concurrency;
    }

    if (cliOptions.config !== undefined) {
        mergedConfig.config = cliOptions.config;
    }

    if (cliOptions.continueOnError !== undefined) {
        mergedConfig.continueOnError = cliOptions.continueOnError;
    }

    if (cliOptions.cwd !== undefined) {
        mergedConfig.cwd = cliOptions.cwd;
    }

    if (cliOptions.fix !== undefined) {
        mergedConfig.fix = cliOptions.fix;
    }

    if (cliOptions.followSymlinks !== undefined) {
        mergedConfig.followSymlinks = cliOptions.followSymlinks;
    }

    if (cliOptions.ignore !== undefined) {
        mergedConfig.ignore = cliOptions.ignore;
    }

    if (cliOptions.include !== undefined) {
        mergedConfig.include = cliOptions.include;
    }

    if (cliOptions.quiet !== undefined) {
        mergedConfig.quiet = cliOptions.quiet;
    }

    if (cliOptions.size !== undefined) {
        mergedConfig.size = cliOptions.size;
    }

    if (cliOptions.verbose !== undefined) {
        mergedConfig.verbose = cliOptions.verbose;
    }

    return mergedConfig;
}
