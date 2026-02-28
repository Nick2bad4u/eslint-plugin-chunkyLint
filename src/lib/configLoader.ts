/* eslint-disable func-style, init-declarations, no-use-before-define, no-await-in-loop, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unnecessary-condition, sort-imports */
import type { ChunkyLintConfig } from "../types/index.js";
import { join, resolve } from "path";
import { promises as fs } from "fs";
import { pathToFileURL } from "url";

/**
 * Possible config file names in order of preference
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

/**
 * Load configuration from a config file
 *
 * @param configPath - Path to the config file (optional, will search if not
 *   provided)
 * @param cwd - Working directory to search for config files
 *
 * @returns Configuration object or null if no config found
 */
export async function loadConfig(
    configPath?: string,
    cwd: string = process.cwd()
): Promise<ChunkyLintConfig | null> {
    try {
        let targetPath: string;

        if (configPath) {
            // Use explicit config path
            targetPath = resolve(cwd, configPath);
        } else {
            // Search for config files
            const foundPath = await findConfigFile(cwd);
            if (!foundPath) {
                return null;
            }
            targetPath = foundPath;
        }

        // Check if file exists
        try {
            await fs.access(targetPath);
        } catch {
            if (configPath) {
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
 * Find a config file in the given directory
 *
 * @param cwd - Directory to search
 *
 * @returns Path to config file or null if not found
 */
async function findConfigFile(cwd: string): Promise<string | null> {
    for (const fileName of CONFIG_FILE_NAMES) {
        const filePath = join(cwd, fileName);
        try {
            await fs.access(filePath);
            return filePath;
        } catch {
            // File doesn't exist, continue searching
        }
    }
    return null;
}

/**
 * Load and parse a config file
 *
 * @param filePath - Path to the config file
 *
 * @returns Parsed configuration
 */
async function loadConfigFile(filePath: string): Promise<ChunkyLintConfig> {
    const ext = filePath.split(".").pop()?.toLowerCase();

    switch (ext) {
        case "json":
            return await loadJsonConfig(filePath);
        case "js":
        case "mjs":
        case "ts":
            return await loadJsConfig(filePath);
        default:
            throw new Error(`Unsupported config file type: ${ext}`);
    }
}

/**
 * Load JSON config file
 *
 * @param filePath - Path to JSON config file
 *
 * @returns Parsed configuration
 */
async function loadJsonConfig(filePath: string): Promise<ChunkyLintConfig> {
    try {
        const content = await fs.readFile(filePath, "utf-8"),
            config = JSON.parse(content) as ChunkyLintConfig;
        return validateConfig(config);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse JSON config: ${message}`, {
            cause: error,
        });
    }
}

/**
 * Load JavaScript/TypeScript config file
 *
 * @param filePath - Path to JS/TS config file
 *
 * @returns Parsed configuration
 */
export async function loadJsConfig(
    filePath: string
): Promise<ChunkyLintConfig> {
    try {
        // Convert file path to file URL for dynamic import
        const fileUrl = pathToFileURL(filePath).href,
            // Dynamic import the config file
            module = await import(fileUrl),
            // Get the default export or the config object
            config = module.default ?? module;

        if (typeof config === "function") {
            // Config is a function, call it
            return validateConfig(await config());
        }
        // Config is an object
        return validateConfig(config);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to load JS/TS config: ${message}`, {
            cause: error,
        });
    }
}

/**
 * Validate and normalize configuration
 *
 * @param config - Raw configuration object
 *
 * @returns Validated configuration
 */
function validateConfig(config: unknown): ChunkyLintConfig {
    if (!config || typeof config !== "object") {
        throw new Error("Config must be an object");
    }

    const normalizedConfig = config as ChunkyLintConfig;

    // Validate size
    if (normalizedConfig.size !== undefined) {
        if (
            !Number.isInteger(normalizedConfig.size) ||
            normalizedConfig.size < 1
        ) {
            throw new Error("size must be a positive integer");
        }
    }

    // Validate concurrency
    if (normalizedConfig.concurrency !== undefined) {
        if (
            !Number.isInteger(normalizedConfig.concurrency) ||
            normalizedConfig.concurrency < 1
        ) {
            throw new Error("concurrency must be a positive integer");
        }
    }

    // Validate arrays
    if (normalizedConfig.include && !Array.isArray(normalizedConfig.include)) {
        throw new Error("include must be an array of strings");
    }

    if (normalizedConfig.ignore && !Array.isArray(normalizedConfig.ignore)) {
        throw new Error("ignore must be an array of strings");
    }

    if (
        normalizedConfig.verbose !== undefined &&
        typeof normalizedConfig.verbose !== "boolean"
    ) {
        throw new Error("verbose must be a boolean");
    }

    if (
        normalizedConfig.quiet !== undefined &&
        typeof normalizedConfig.quiet !== "boolean"
    ) {
        throw new Error("quiet must be a boolean");
    }

    if (
        normalizedConfig.chunkLogs !== undefined &&
        typeof normalizedConfig.chunkLogs !== "boolean"
    ) {
        throw new Error("chunkLogs must be a boolean");
    }

    return normalizedConfig;
}

/**
 * Merge configuration with CLI options CLI options take precedence over config
 * file options
 *
 * @param config - Configuration from file
 * @param cliOptions - Options from CLI
 *
 * @returns Merged configuration
 */
export function mergeConfig(
    config: ChunkyLintConfig,
    cliOptions: Partial<ChunkyLintConfig>
): ChunkyLintConfig {
    return {
        ...config,
        ...Object.fromEntries(
            Object.entries(cliOptions).filter(
                ([, value]) => value !== undefined
            )
        ),
    };
}
