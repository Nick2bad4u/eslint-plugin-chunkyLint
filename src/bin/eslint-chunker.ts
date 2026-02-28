#!/usr/bin/env node

/* eslint-disable */

import { loadConfig, mergeConfig } from "../lib/configLoader.js";
import { ESLintChunker } from "../lib/chunker.js";
import chalk from "chalk";
import { Command } from "commander";
import type { ChunkerOptions, ChunkyLintConfig } from "../types/index.js";

interface CliOptions {
    config?: string;
    configFile?: string;
    size?: number;
    cacheLocation?: string;
    maxWorkers: number | "auto" | "off";
    continueOnError?: boolean;
    fix?: boolean;
    fixTypes?: ("directive" | "problem" | "suggestion" | "layout")[];
    warnIgnored?: boolean;
    include?: string[];
    ignore?: string[];
    cwd?: string;
    verbose?: boolean;
    quiet?: boolean;
    chunkLogs?: boolean;
    banner?: boolean;
    concurrency?: number;
}

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
    );

program.action(async (options: CliOptions) => {
    try {
        // Load config file if available
        let fileConfig: ChunkyLintConfig | null = null,
            configWarning: string | null = null;

        try {
            fileConfig = await loadConfig(
                options.configFile,
                options.cwd ?? process.cwd()
            );
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            configWarning = `⚠️ Config file warning: ${message}`;
        }

        // Convert CLI options to config format (only include explicitly provided values)
        const cliConfig: Partial<ChunkyLintConfig> = {};

        if (options.config !== undefined) cliConfig.config = options.config;
        if (options.size !== undefined) cliConfig.size = options.size;
        if (options.cacheLocation !== undefined)
            cliConfig.cacheLocation = options.cacheLocation;
        if (options.continueOnError !== undefined)
            cliConfig.continueOnError = options.continueOnError;
        if (options.fix !== undefined) cliConfig.fix = options.fix;
        if (options.include !== undefined) cliConfig.include = options.include;
        if (options.ignore !== undefined) cliConfig.ignore = options.ignore;
        if (options.cwd !== undefined) cliConfig.cwd = options.cwd;
        if (options.verbose !== undefined) cliConfig.verbose = options.verbose;
        if (options.quiet !== undefined) cliConfig.quiet = options.quiet;
        if (options.chunkLogs !== undefined)
            cliConfig.chunkLogs = options.chunkLogs;
        if (options.concurrency !== undefined)
            cliConfig.concurrency = options.concurrency;

        // Merge file config with CLI options (CLI takes precedence)
        const finalConfig = fileConfig
            ? mergeConfig(fileConfig, cliConfig)
            : cliConfig;

        const isQuiet = finalConfig.quiet ?? false,
            // Convert to ChunkerOptions with proper defaults
            chunkerOptions: ChunkerOptions = {
                size: finalConfig.size ?? 200,
                cacheLocation: finalConfig.cacheLocation ?? ".eslintcache",
                maxWorkers: options.maxWorkers ?? "off",
                cwd: finalConfig.cwd ?? process.cwd(),
                concurrency: finalConfig.concurrency ?? 1,
            };

        if (finalConfig.config !== undefined) {
            chunkerOptions.config = finalConfig.config;
        }
        if (finalConfig.continueOnError !== undefined) {
            chunkerOptions.continueOnError = finalConfig.continueOnError;
        }
        if (finalConfig.fix !== undefined) {
            chunkerOptions.fix = finalConfig.fix;
        }
        if (options.fixTypes !== undefined) {
            chunkerOptions.fixTypes = options.fixTypes;
        }
        if (options.warnIgnored !== undefined) {
            chunkerOptions.warnIgnored = options.warnIgnored;
        }
        if (finalConfig.include !== undefined) {
            chunkerOptions.include = finalConfig.include;
        }
        if (finalConfig.ignore !== undefined) {
            chunkerOptions.ignore = finalConfig.ignore;
        }
        if (finalConfig.verbose !== undefined) {
            chunkerOptions.verbose = finalConfig.verbose;
        }
        if (finalConfig.quiet !== undefined) {
            chunkerOptions.quiet = finalConfig.quiet;
        }
        if (finalConfig.chunkLogs !== undefined) {
            chunkerOptions.chunkLogs = finalConfig.chunkLogs;
        }

        const chunker = new ESLintChunker(chunkerOptions);

        if (!isQuiet) {
            if (options.banner !== false) {
                console.log(chalk.blue("🚀 ESLint Chunker"));
                console.log();

                if (fileConfig && finalConfig.verbose) {
                    console.log(
                        chalk.gray(
                            `📋 Loaded config from ${options.configFile ?? "auto-detected config file"}`
                        )
                    );
                }
            }

            if (configWarning) {
                console.warn(chalk.yellow(configWarning));
            }
        }

        const stats = isQuiet
            ? await runWithStdoutSuppressed(async () => chunker.run())
            : await chunker.run();

        if (isQuiet) {
            const totalTime = Math.round(stats.totalTime),
                avgTimePerFile =
                    stats.totalFiles > 0
                        ? Math.round(stats.totalTime / stats.totalFiles)
                        : 0;

            console.log(
                chalk.blue("ℹ"),
                chalk.green("✅ ESLint chunker completed!")
            );
            console.log(
                chalk.blue("ℹ"),
                `📊 Processed ${stats.totalFiles} files in ${stats.totalChunks} chunks`
            );
            console.log(
                chalk.blue("ℹ"),
                `⏱️  Total time: ${totalTime}ms (~${avgTimePerFile}ms per file)`
            );
        }

        // Exit with error code if there were failures
        if (stats.failedChunks > 0) {
            process.exit(1);
        }
    } catch (error) {
        console.error();
        console.error(chalk.red("❌ ESLint chunker failed:"));
        console.error(error instanceof Error ? error.message : String(error));

        if (options.verbose && error instanceof Error && error.stack) {
            console.error(chalk.gray(error.stack));
        }

        process.exit(1);
    }
});

/**
 * Parse integer option
 */
function parseIntOption(value: string): number {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) {
        throw new Error(`Invalid number: ${value}`);
    }
    return parsed;
}

/**
 * Parse workers option
 */
function parseWorkersOption(value: string): number | "auto" | "off" {
    if (value === "auto" || value === "off") {
        return value;
    }
    return parseIntOption(value);
}

/**
 * Parse fix types option
 */
function parseFixTypes(
    value: string
): ("directive" | "problem" | "suggestion" | "layout")[] {
    const validTypes = [
            "directive",
            "problem",
            "suggestion",
            "layout",
        ] as const,
        types = value.split(",").map((type) => type.trim());

    for (const type of types) {
        if (
            !validTypes.includes(
                type as "directive" | "problem" | "suggestion" | "layout"
            )
        ) {
            throw new Error(
                `Invalid fix type: ${type}. Valid types: ${validTypes.join(", ")}`
            );
        }
    }

    return types as ("directive" | "problem" | "suggestion" | "layout")[];
}

/**
 * Parse array option (comma-separated values)
 */
function parseArrayOption(value: string): string[] {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

/**
 * Run an async operation while suppressing stdout output.
 */
async function runWithStdoutSuppressed<T>(
    operation: () => Promise<T>
): Promise<T> {
    const originalWrite = process.stdout.write;

    process.stdout.write = (() =>
        true) as unknown as typeof process.stdout.write;

    try {
        return await operation();
    } finally {
        process.stdout.write = originalWrite;
    }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, _promise) => {
    console.error(chalk.red("Unhandled Promise Rejection:"), reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error(chalk.red("Uncaught Exception:"), error);
    process.exit(1);
});

program.parse();
