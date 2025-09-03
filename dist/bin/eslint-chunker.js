#!/usr/bin/env node
/* eslint-disable */
import { loadConfig, mergeConfig } from "../lib/configLoader.js";
import { ESLintChunker } from "../lib/chunker.js";
import chalk from "chalk";
import { Command } from "commander";
const program = new Command();
program
    .name("eslint-chunker")
    .description("Auto-chunking ESLint runner that updates cache incrementally")
    .version("1.0.0")
    .option("-c, --config <path>", "Path to ESLint config file")
    .option("-s, --size <number>", "Files per chunk", parseIntOption)
    .option("--cache-location <path>", "ESLint cache file location")
    .option("--max-workers <n>", 'ESLint max workers ("auto", "off", or number)', parseWorkersOption, "off")
    .option("--continue-on-error", "Do not exit on first chunk failure")
    .option("--fix", "Apply ESLint fixes")
    .option("--fix-types <types>", "Types of fixes to apply (comma-separated: directive,problem,suggestion,layout)", parseFixTypes)
    .option("--no-warn-ignored", "Do not warn about ignored files")
    .option("--include <patterns>", "Include patterns (comma-separated)", parseArrayOption)
    .option("--ignore <patterns>", "Additional ignore patterns (comma-separated)", parseArrayOption)
    .option("--cwd <path>", "Working directory")
    .option("-v, --verbose", "Enable verbose output")
    .option("--config-file <path>", "Path to chunkyLint config file (.chunkylint.ts, .chunkylint.json, etc.)")
    .option("--concurrency <n>", "Number of chunks to process concurrently", parseIntOption);
program.action(async (options) => {
    try {
        console.log(chalk.blue("🚀 ESLint Chunker"));
        console.log();
        // Load config file if available
        let fileConfig = null;
        try {
            fileConfig = await loadConfig(options.configFile, options.cwd ?? process.cwd());
            if (fileConfig && options.verbose) {
                console.log(chalk.gray(`📋 Loaded config from ${options.configFile ?? "auto-detected config file"}`));
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(chalk.yellow(`⚠️ Config file warning: ${message}`));
        }
        // Convert CLI options to config format (only include explicitly provided values)
        const cliConfig = {};
        if (options.config !== undefined)
            cliConfig.config = options.config;
        if (options.size !== undefined)
            cliConfig.size = options.size;
        if (options.cacheLocation !== undefined)
            cliConfig.cacheLocation = options.cacheLocation;
        if (options.continueOnError !== undefined)
            cliConfig.continueOnError = options.continueOnError;
        if (options.fix !== undefined)
            cliConfig.fix = options.fix;
        if (options.include !== undefined)
            cliConfig.include = options.include;
        if (options.ignore !== undefined)
            cliConfig.ignore = options.ignore;
        if (options.cwd !== undefined)
            cliConfig.cwd = options.cwd;
        if (options.verbose !== undefined)
            cliConfig.verbose = options.verbose;
        if (options.concurrency !== undefined)
            cliConfig.concurrency = options.concurrency;
        // Merge file config with CLI options (CLI takes precedence)
        const finalConfig = fileConfig
            ? mergeConfig(fileConfig, cliConfig)
            : cliConfig, 
        // Convert to ChunkerOptions with proper defaults
        chunkerOptions = {
            config: finalConfig.config,
            size: finalConfig.size ?? 200,
            cacheLocation: finalConfig.cacheLocation ?? ".eslintcache",
            maxWorkers: options.maxWorkers ?? "off",
            continueOnError: finalConfig.continueOnError,
            fix: finalConfig.fix,
            fixTypes: options.fixTypes,
            warnIgnored: options.warnIgnored,
            include: finalConfig.include,
            ignore: finalConfig.ignore,
            cwd: finalConfig.cwd ?? process.cwd(),
            verbose: finalConfig.verbose,
            concurrency: finalConfig.concurrency ?? 1,
        }, 
        // Create and run chunker
        chunker = new ESLintChunker(chunkerOptions);
        let lastUpdate = Date.now();
        const stats = await chunker.run((processed, total, currentChunk) => {
            // Throttle progress updates to avoid spam
            const now = Date.now();
            if (now - lastUpdate > 1000 || processed === total) {
                showProgress(processed, total, currentChunk);
                lastUpdate = now;
            }
        });
        console.log();
        console.log(chalk.green("✅ All done!"));
        // Exit with error code if there were failures
        if (stats.failedChunks > 0) {
            process.exit(1);
        }
    }
    catch (error) {
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
 * Show progress indicator
 */
function showProgress(processed, total, currentChunk) {
    const percentage = Math.round((processed / total) * 100), progressBar = createProgressBar(processed, total, 30);
    let message = `${progressBar} ${percentage}% (${processed}/${total})`;
    if (currentChunk) {
        if (currentChunk.success) {
            const time = Math.round(currentChunk.processingTime);
            message += ` - ${currentChunk.files.length} files (${time}ms)`;
        }
        else {
            message += chalk.red(" - FAILED");
        }
    }
    // Clear previous line and print new progress
    process.stdout.write(`\r${message}`);
    if (processed === total) {
        process.stdout.write("\n");
    }
}
/**
 * Create a text-based progress bar
 */
function createProgressBar(current, total, width) {
    const filled = Math.round((current / total) * width), empty = width - filled;
    return chalk.green("█".repeat(filled)) + chalk.gray("░".repeat(empty));
}
/**
 * Parse integer option
 */
function parseIntOption(value) {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) {
        throw new Error(`Invalid number: ${value}`);
    }
    return parsed;
}
/**
 * Parse workers option
 */
function parseWorkersOption(value) {
    if (value === "auto" || value === "off") {
        return value;
    }
    return parseIntOption(value);
}
/**
 * Parse fix types option
 */
function parseFixTypes(value) {
    const validTypes = [
        "directive",
        "problem",
        "suggestion",
        "layout",
    ], types = value.split(",").map((type) => type.trim());
    for (const type of types) {
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid fix type: ${type}. Valid types: ${validTypes.join(", ")}`);
        }
    }
    return types;
}
/**
 * Parse array option (comma-separated values)
 */
function parseArrayOption(value) {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
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
//# sourceMappingURL=eslint-chunker.js.map