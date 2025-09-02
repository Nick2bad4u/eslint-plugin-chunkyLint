#!/usr/bin/env node
#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { ESLintChunker } from '../lib/chunker.js';
const program = new Command();
program
    .name('eslint-chunker')
    .description('Auto-chunking ESLint runner that updates cache incrementally')
    .version('1.0.0')
    .option('-c, --config <path>', 'Path to ESLint config file')
    .option('-s, --size <number>', 'Files per chunk', parseIntOption, 200)
    .option('--cache-location <path>', 'ESLint cache file location', '.eslintcache')
    .option('--max-workers <n>', 'ESLint max workers ("auto", "off", or number)', parseWorkersOption, 'off')
    .option('--continue-on-error', 'Do not exit on first chunk failure')
    .option('--fix', 'Apply ESLint fixes')
    .option('--fix-types <types>', 'Types of fixes to apply (comma-separated: directive,problem,suggestion,layout)', parseFixTypes)
    .option('--no-warn-ignored', 'Do not warn about ignored files')
    .option('--include <patterns>', 'Include patterns (comma-separated)', parseArrayOption)
    .option('--ignore <patterns>', 'Additional ignore patterns (comma-separated)', parseArrayOption)
    .option('--cwd <path>', 'Working directory', process.cwd())
    .option('-v, --verbose', 'Enable verbose output')
    .option('--concurrency <n>', 'Number of chunks to process concurrently', parseIntOption, 1);
program.action(async (options) => {
    try {
        console.log(chalk.blue('🚀 ESLint Chunker'));
        console.log();
        // Convert CLI options to ChunkerOptions
        const chunkerOptions = {
            config: options.config,
            size: options.size,
            cacheLocation: options.cacheLocation,
            maxWorkers: options.maxWorkers,
            continueOnError: options.continueOnError,
            fix: options.fix,
            fixTypes: options.fixTypes,
            warnIgnored: options.warnIgnored,
            include: options.include,
            ignore: options.ignore,
            cwd: options.cwd,
            verbose: options.verbose,
            concurrency: options.concurrency,
        };
        // Create and run chunker
        const chunker = new ESLintChunker(chunkerOptions);
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
        console.log(chalk.green('✅ All done!'));
        // Exit with error code if there were failures
        if (stats.failedChunks > 0) {
            process.exit(1);
        }
    }
    catch (error) {
        console.error();
        console.error(chalk.red('❌ ESLint chunker failed:'));
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
    const percentage = Math.round((processed / total) * 100);
    const progressBar = createProgressBar(processed, total, 30);
    let message = `${progressBar} ${percentage}% (${processed}/${total})`;
    if (currentChunk) {
        if (currentChunk.success) {
            const time = Math.round(currentChunk.processingTime);
            message += ` - ${currentChunk.files.length} files (${time}ms)`;
        }
        else {
            message += chalk.red(' - FAILED');
        }
    }
    // Clear previous line and print new progress
    process.stdout.write('\r' + message);
    if (processed === total) {
        process.stdout.write('\n');
    }
}
/**
 * Create a text-based progress bar
 */
function createProgressBar(current, total, width) {
    const filled = Math.round((current / total) * width);
    const empty = width - filled;
    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
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
    if (value === 'auto' || value === 'off') {
        return value;
    }
    return parseIntOption(value);
}
/**
 * Parse fix types option
 */
function parseFixTypes(value) {
    const validTypes = ['directive', 'problem', 'suggestion', 'layout'];
    const types = value.split(',').map(type => type.trim());
    for (const type of types) {
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid fix type: ${type}. Valid types: ${validTypes.join(', ')}`);
        }
    }
    return types;
}
/**
 * Parse array option (comma-separated values)
 */
function parseArrayOption(value) {
    return value.split(',').map(item => item.trim()).filter(Boolean);
}
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('Unhandled Promise Rejection:'), reason);
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error(chalk.red('Uncaught Exception:'), error);
    process.exit(1);
});
program.parse();
//# sourceMappingURL=eslint-chunker.js.map
