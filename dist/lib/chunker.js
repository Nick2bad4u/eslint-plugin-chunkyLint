import { ESLint } from "eslint";
import pLimit from "p-limit";
import chalk from "chalk";
import { performance } from "perf_hooks";
import { FileScanner } from "./fileScanner.js";
import { ConsoleLogger } from "./logger.js";
/**
 * ESLint Chunker - Main orchestrator for chunked ESLint execution
 */
export class ESLintChunker {
    options;
    logger;
    fileScanner;
    constructor(options = {}) {
        this.options = this.normalizeOptions(options);
        this.logger = new ConsoleLogger(this.options.verbose);
        this.fileScanner = new FileScanner(this.logger);
    }
    /**
     * Run ESLint in chunked mode
     */
    async run(progressCallback) {
        const startTime = performance.now();
        this.logger.info("Starting ESLint chunker...");
        try {
            // Discover files to lint
            const files = await this.fileScanner.scanFiles({
                config: this.options.config,
                cwd: this.options.cwd,
                include: this.options.include,
                ignore: this.options.ignore,
            });
            if (files.length === 0) {
                this.logger.warn("No files found to lint");
                return this.createStats([], 0, performance.now() - startTime);
            }
            // Split files into chunks
            const chunks = this.fileScanner.chunkFiles(
                files,
                this.options.size
            );
            this.logger.info(
                `Processing ${files.length} files in ${chunks.length} chunks of ~${this.options.size} files each`
            );
            // Process chunks
            const chunkResults = await this.processChunks(
                chunks,
                progressCallback
            );
            const endTime = performance.now();
            const stats = this.createStats(
                chunkResults,
                files.length,
                endTime - startTime
            );
            this.logFinalStats(stats);
            return stats;
        } catch (error) {
            this.logger.error("ESLint chunker failed:", error);
            throw error;
        }
    }
    /**
     * Process all chunks
     */
    async processChunks(chunks, progressCallback) {
        const results = [];
        const limit = pLimit(this.options.concurrency);
        // Process chunks with controlled concurrency
        const chunkPromises = chunks.map((chunk, index) =>
            limit(() => this.processChunk(chunk, index))
        );
        for (let i = 0; i < chunkPromises.length; i++) {
            try {
                const result = await chunkPromises[i];
                results.push(result);
                // Report progress
                if (progressCallback && result) {
                    progressCallback(i + 1, chunks.length, result);
                }
                // Log progress
                if (result) {
                    this.logChunkProgress(result, i + 1, chunks.length);
                }
            } catch (error) {
                this.logger.error(`Failed to process chunk ${i + 1}:`, error);
                const failedResult = {
                    chunkIndex: i,
                    files: chunks[i] ?? [],
                    success: false,
                    error:
                        error instanceof Error ? error.message : String(error),
                    processingTime: 0,
                    errorCount: 0,
                    warningCount: 0,
                    fixedCount: 0,
                };
                results.push(failedResult);
                if (!this.options.continueOnError) {
                    throw error;
                }
            }
        }
        return results;
    }
    /**
     * Process a single chunk
     */
    async processChunk(files, chunkIndex) {
        const startTime = performance.now();
        this.logger.verbose(
            `Processing chunk ${chunkIndex + 1} with ${files.length} files`
        );
        try {
            // Create ESLint instance for this chunk
            const eslint = new ESLint({
                cwd: this.options.cwd,
                overrideConfigFile: this.options.config || true,
                cache: true,
                cacheLocation: this.options.cacheLocation,
                concurrency: this.options.maxWorkers,
                fix: this.options.fix,
                fixTypes: this.options.fixTypes,
                warnIgnored: this.options.warnIgnored,
            });
            // Lint files in this chunk
            const results = await eslint.lintFiles(files);
            // Apply fixes if enabled
            if (this.options.fix) {
                await ESLint.outputFixes(results);
            }
            // Calculate statistics for this chunk
            const errorCount = results.reduce(
                (sum, result) => sum + result.errorCount,
                0
            );
            const warningCount = results.reduce(
                (sum, result) => sum + result.warningCount,
                0
            );
            const fixedCount = results.reduce(
                (sum, result) => sum + (result.output ? 1 : 0),
                0
            );
            const processingTime = performance.now() - startTime;
            return {
                chunkIndex,
                files,
                success: true,
                processingTime,
                errorCount,
                warningCount,
                fixedCount,
            };
        } catch (error) {
            const processingTime = performance.now() - startTime;
            return {
                chunkIndex,
                files,
                success: false,
                error: error instanceof Error ? error.message : String(error),
                processingTime,
                errorCount: 0,
                warningCount: 0,
                fixedCount: 0,
            };
        }
    }
    /**
     * Create statistics summary
     */
    createStats(chunkResults, totalFiles, totalTime) {
        const filesWithErrors = chunkResults.reduce(
            (sum, chunk) =>
                sum + (chunk.errorCount > 0 ? chunk.files.length : 0),
            0
        );
        const filesWithWarnings = chunkResults.reduce(
            (sum, chunk) =>
                sum + (chunk.warningCount > 0 ? chunk.files.length : 0),
            0
        );
        const filesFixed = chunkResults.reduce(
            (sum, chunk) => sum + chunk.fixedCount,
            0
        );
        const failedChunks = chunkResults.filter(
            (chunk) => !chunk.success
        ).length;
        return {
            totalFiles,
            totalChunks: chunkResults.length,
            totalTime,
            filesWithErrors,
            filesWithWarnings,
            filesFixed,
            failedChunks,
        };
    }
    /**
     * Log progress for a completed chunk
     */
    logChunkProgress(result, completed, total) {
        const progress = Math.round((completed / total) * 100);
        const statusIcon = result.success ? "✅" : "❌";
        let message = `${statusIcon} Chunk ${completed}/${total} (${progress}%)`;
        if (result.success) {
            const time = Math.round(result.processingTime);
            message += ` - ${result.files.length} files, ${time}ms`;
            if (result.errorCount > 0) {
                message += chalk.red(` - ${result.errorCount} errors`);
            }
            if (result.warningCount > 0) {
                message += chalk.yellow(` - ${result.warningCount} warnings`);
            }
            if (result.fixedCount > 0) {
                message += chalk.green(` - ${result.fixedCount} fixed`);
            }
        } else {
            message += chalk.red(` - FAILED: ${result.error}`);
        }
        this.logger.info(message);
    }
    /**
     * Log final statistics
     */
    logFinalStats(stats) {
        const totalTime = Math.round(stats.totalTime);
        const avgTimePerFile = Math.round(stats.totalTime / stats.totalFiles);
        this.logger.info("");
        this.logger.info(chalk.green("✅ ESLint chunker completed!"));
        this.logger.info(
            `📊 Processed ${stats.totalFiles} files in ${stats.totalChunks} chunks`
        );
        this.logger.info(
            `⏱️  Total time: ${totalTime}ms (~${avgTimePerFile}ms per file)`
        );
        if (stats.filesWithErrors > 0) {
            this.logger.info(
                chalk.red(`❌ Files with errors: ${stats.filesWithErrors}`)
            );
        }
        if (stats.filesWithWarnings > 0) {
            this.logger.info(
                chalk.yellow(
                    `⚠️  Files with warnings: ${stats.filesWithWarnings}`
                )
            );
        }
        if (stats.filesFixed > 0) {
            this.logger.info(
                chalk.green(`🔧 Files fixed: ${stats.filesFixed}`)
            );
        }
        if (stats.failedChunks > 0) {
            this.logger.info(
                chalk.red(`💥 Failed chunks: ${stats.failedChunks}`)
            );
        }
    }
    /**
     * Normalize and validate options
     */
    normalizeOptions(options) {
        return {
            config: options.config ?? "",
            size: Math.max(1, options.size ?? 200),
            cacheLocation: options.cacheLocation ?? ".eslintcache",
            maxWorkers: options.maxWorkers ?? "off",
            continueOnError: options.continueOnError ?? false,
            fix: options.fix ?? false,
            fixTypes: options.fixTypes ?? ["problem", "suggestion", "layout"],
            warnIgnored: options.warnIgnored !== false,
            include: options.include ?? [],
            ignore: options.ignore ?? [],
            cwd: options.cwd ?? process.cwd(),
            verbose: options.verbose ?? false,
            concurrency: Math.max(1, options.concurrency ?? 1),
        };
    }
}
//# sourceMappingURL=chunker.js.map
