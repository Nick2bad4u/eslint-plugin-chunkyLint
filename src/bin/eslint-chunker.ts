import type { LiteralUnion } from "type-fest";

import chalk from "chalk";
import { Command } from "commander";
import { arrayIncludes, arrayJoin, stringSplit } from "ts-extras";

import type {
    ChunkerOptions,
    ChunkyLintConfig,
} from "../types/chunky-lint-types.js";

import { ESLintChunker } from "../lib/chunker.js";
import { loadConfig, mergeConfig } from "../lib/config-loader.js";

interface CliOptions {
    banner?: boolean;
    cacheLocation?: string;
    chunkLogs?: boolean;
    concurrency?: number;
    config?: string;
    configFile?: string;
    continueOnError?: boolean;
    cwd?: string;
    fix?: boolean;
    fixTypes?: FixType[];
    ignore?: string[];
    include?: string[];
    maxWorkers: MaxWorkersInput;
    quiet?: boolean;
    size?: number;
    verbose?: boolean;
    warnIgnored?: boolean;
}

type FixType = "directive" | "layout" | "problem" | "suggestion";
type MaxWorkersInput = LiteralUnion<"auto" | "off", string>;
type MaxWorkersOption = "auto" | "off" | number;

function isFixType(value: string): value is FixType {
    return (
        value === "directive" ||
        value === "layout" ||
        value === "problem" ||
        value === "suggestion"
    );
}

function handleUncaughtException(error: Readonly<Error>): void {
    process.stderr.write(
        `${chalk.red("Uncaught Exception:")} ${error.message}\n`
    );
}

function handleUnhandledRejection(reason: unknown): void {
    process.stderr.write(
        `${chalk.red("Unhandled Promise Rejection:")} ${String(reason)}\n`
    );
}

/**
 * Parse array option (comma-separated values).
 */
function parseArrayOption(value: string): string[] {
    return stringSplit(value, ",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}

/**
 * Parse fix types option.
 */
function parseFixTypes(value: string): FixType[] {
    const rawTypes = stringSplit(value, ",").map((type) => type.trim());
    const validTypes = [
        "directive",
        "problem",
        "suggestion",
        "layout",
    ] as const;

    const parsedTypes: FixType[] = [];

    for (const type of rawTypes) {
        if (!isFixType(type) || arrayIncludes(validTypes, type) === false) {
            throw new Error(
                `Invalid fix type: ${type}. Valid types: ${arrayJoin(validTypes, ", ")}`
            );
        }
        parsedTypes.push(type);
    }

    return parsedTypes;
}

/**
 * Parse integer option.
 */
function parseIntOption(value: string): number {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
        throw new Error(`Invalid number: ${value}`);
    }

    return parsed;
}

/**
 * Parse workers option.
 */
function parseWorkersOption(value: string): MaxWorkersInput {
    if (value === "auto" || value === "off") {
        return value;
    }

    parseIntOption(value);
    return value;
}

function toMaxWorkersOption(value: MaxWorkersInput): MaxWorkersOption {
    if (value === "auto") {
        return "auto";
    }

    if (value === "off") {
        return "off";
    }

    return parseIntOption(value);
}

function removeProcessHandlers(): void {
    process.off("unhandledRejection", handleUnhandledRejection);
    process.off("uncaughtException", handleUncaughtException);
    process.off("exit", removeProcessHandlers);
}

function writeErrorLine(line: string): void {
    process.stderr.write(`${line}\n`);
}

function writeLine(line: string): void {
    process.stdout.write(`${line}\n`);
}

process.on("unhandledRejection", handleUnhandledRejection);
process.on("uncaughtException", handleUncaughtException);
process.on("exit", removeProcessHandlers);

const program = new Command();

program
    .name("eslint-chunker")
    .description("Auto-chunking ESLint runner that updates cache incrementally")
    .version("1.0.0")
    .option("-c, --config <path>", "Path to ESLint config file")
    .option("-s, --size <number>", "Files per chunk", parseIntOption)
    .option("--cache-location <path>", "ESLint cache file location")
    .option(
        "--max-workers <n>",
        'ESLint max workers ("auto", "off", or number)',
        parseWorkersOption,
        "off"
    )
    .option("--continue-on-error", "Do not exit on first chunk failure")
    .option("--fix", "Apply ESLint fixes")
    .option(
        "--fix-types <types>",
        "Types of fixes to apply (comma-separated: directive,problem,suggestion,layout)",
        parseFixTypes
    )
    .option("--no-warn-ignored", "Do not warn about ignored files")
    .option(
        "--include <patterns>",
        "Include patterns (comma-separated)",
        parseArrayOption
    )
    .option(
        "--ignore <patterns>",
        "Additional ignore patterns (comma-separated)",
        parseArrayOption
    )
    .option("-q, --quiet", "Only print final completion summary")
    .option("--no-quiet", "Disable quiet mode (overrides config file)")
    .option("--chunk-logs", "Show per-chunk completion logs")
    .option("--no-chunk-logs", "Hide per-chunk completion logs")
    .option("--no-banner", "Hide CLI banner/preamble output")
    .option("--cwd <path>", "Working directory")
    .option("-v, --verbose", "Enable verbose output")
    .option("--no-verbose", "Disable verbose output (overrides config file)")
    .option(
        "--config-file <path>",
        "Path to chunkyLint config file (.chunkylint.ts, .chunkylint.json, etc.)"
    )
    .option(
        "--concurrency <n>",
        "Number of chunks to process concurrently",
        parseIntOption
    )
    .action(async (options: Readonly<CliOptions>) => {
        const normalizedOptions: Readonly<CliOptions> = options;

        let configWarning: null | string = null;
        let fileConfig: ChunkyLintConfig | null = null;

        try {
            fileConfig = await loadConfig(
                normalizedOptions.configFile,
                normalizedOptions.cwd ?? process.cwd()
            );
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            configWarning = `⚠️ Config file warning: ${message}`;
        }

        const cliConfig: Partial<ChunkyLintConfig> = {};

        if (normalizedOptions.cacheLocation !== undefined) {
            cliConfig.cacheLocation = normalizedOptions.cacheLocation;
        }

        if (normalizedOptions.chunkLogs !== undefined) {
            cliConfig.chunkLogs = normalizedOptions.chunkLogs;
        }

        if (normalizedOptions.concurrency !== undefined) {
            cliConfig.concurrency = normalizedOptions.concurrency;
        }

        if (normalizedOptions.config !== undefined) {
            cliConfig.config = normalizedOptions.config;
        }

        if (normalizedOptions.continueOnError !== undefined) {
            cliConfig.continueOnError = normalizedOptions.continueOnError;
        }

        if (normalizedOptions.cwd !== undefined) {
            cliConfig.cwd = normalizedOptions.cwd;
        }

        if (normalizedOptions.fix !== undefined) {
            cliConfig.fix = normalizedOptions.fix;
        }

        if (normalizedOptions.ignore !== undefined) {
            cliConfig.ignore = normalizedOptions.ignore;
        }

        if (normalizedOptions.include !== undefined) {
            cliConfig.include = normalizedOptions.include;
        }

        if (normalizedOptions.quiet !== undefined) {
            cliConfig.quiet = normalizedOptions.quiet;
        }

        if (normalizedOptions.size !== undefined) {
            cliConfig.size = normalizedOptions.size;
        }

        if (normalizedOptions.verbose !== undefined) {
            cliConfig.verbose = normalizedOptions.verbose;
        }

        const finalConfig =
            fileConfig === null
                ? cliConfig
                : mergeConfig(fileConfig, cliConfig);

        const maxWorkersOption: MaxWorkersOption = toMaxWorkersOption(
            normalizedOptions.maxWorkers
        );

        const chunkerOptions: ChunkerOptions = {
            cacheLocation: finalConfig.cacheLocation ?? ".eslintcache",
            concurrency: finalConfig.concurrency ?? 1,
            cwd: finalConfig.cwd ?? process.cwd(),
            maxWorkers: maxWorkersOption,
            size: finalConfig.size ?? 200,
        };

        if (finalConfig.chunkLogs !== undefined) {
            chunkerOptions.chunkLogs = finalConfig.chunkLogs;
        }

        if (finalConfig.config !== undefined) {
            chunkerOptions.config = finalConfig.config;
        }

        if (finalConfig.continueOnError !== undefined) {
            chunkerOptions.continueOnError = finalConfig.continueOnError;
        }

        if (finalConfig.fix !== undefined) {
            chunkerOptions.fix = finalConfig.fix;
        }

        if (normalizedOptions.fixTypes !== undefined) {
            chunkerOptions.fixTypes = normalizedOptions.fixTypes;
        }

        if (finalConfig.ignore !== undefined) {
            chunkerOptions.ignore = finalConfig.ignore;
        }

        if (finalConfig.include !== undefined) {
            chunkerOptions.include = finalConfig.include;
        }

        if (finalConfig.quiet !== undefined) {
            chunkerOptions.quiet = finalConfig.quiet;
        }

        if (finalConfig.verbose !== undefined) {
            chunkerOptions.verbose = finalConfig.verbose;
        }

        if (normalizedOptions.warnIgnored !== undefined) {
            chunkerOptions.warnIgnored = normalizedOptions.warnIgnored;
        }

        const chunker = new ESLintChunker(chunkerOptions);
        const isQuiet = finalConfig.quiet === true;
        const showBanner = normalizedOptions.banner !== false;

        if (isQuiet || !showBanner) {
            // no-op
        } else {
            writeLine(chalk.blue("🚀 ESLint Chunker"));
            writeLine("");

            if (fileConfig !== null && finalConfig.verbose === true) {
                const loadedFrom =
                    normalizedOptions.configFile ?? "auto-detected config file";
                writeLine(chalk.gray(`📋 Loaded config from ${loadedFrom}`));
            }
        }

        if (!isQuiet && configWarning !== null) {
            writeErrorLine(chalk.yellow(configWarning));
        }

        const stats = await chunker.run();

        if (isQuiet) {
            const avgTimePerFile =
                stats.totalFiles > 0
                    ? Math.round(stats.totalTime / stats.totalFiles)
                    : 0;
            const totalTime = Math.round(stats.totalTime);

            writeLine(
                `${chalk.blue("ℹ")} ${chalk.green("✅ ESLint chunker completed!")}`
            );
            writeLine(
                `${chalk.blue("ℹ")} 📊 Processed ${stats.totalFiles.toString()} files in ${stats.totalChunks.toString()} chunks`
            );
            writeLine(
                `${chalk.blue("ℹ")} ⏱️  Total time: ${totalTime.toString()}ms (~${avgTimePerFile.toString()}ms per file)`
            );
        }

        if (stats.failedChunks > 0) {
            throw new Error(`${stats.failedChunks.toString()} chunks failed`);
        }
    });

void program.parseAsync().catch((error: unknown) => {
    writeLine("");
    writeErrorLine(chalk.red("❌ ESLint chunker failed:"));
    writeErrorLine(error instanceof Error ? error.message : String(error));

    if (error instanceof Error && typeof error.stack === "string") {
        writeErrorLine(chalk.gray(error.stack));
    }

    process.exitCode = 1;
});
