/* eslint-disable @typescript-eslint/restrict-template-expressions, id-length, no-await-in-loop, @typescript-eslint/no-non-null-assertion, class-methods-use-this, sort-imports */
import type {
    ChunkResult,
    ChunkerOptions,
    ChunkingStats,
    Logger,
    ProgressCallback,
} from "../types/index.js";
import type { ESLint as ESLintType } from "eslint";
import { FileScanner } from "./fileScanner.js";
import { loadESLintModule } from "./eslintLoader.js";
import { ConsoleLogger } from "./logger.js";
import chalk from "chalk";
import pLimit from "p-limit";
import { performance } from "perf_hooks";

type NormalizedChunkerOptions = Omit<
    Required<ChunkerOptions>,
    "config" | "include" | "ignore"
> & {
    config?: string;
    include?: string[];
    ignore?: string[];
};

/**
 * ESLint Chunker - Main orchestrator for chunked ESLint execution
 */
export class ESLintChunker {
    private options: NormalizedChunkerOptions;
    private logger: Logger;
    private fileScanner: FileScanner;

    constructor(options: ChunkerOptions = {}) {
        this.options = this.normalizeOptions(options);
        this.logger = new ConsoleLogger(
            this.options.verbose,
            this.options.quiet
        );
        this.fileScanner = new FileScanner(this.logger);
    }

    /**
     * Run ESLint in chunked mode
     */
    async run(progressCallback?: ProgressCallback): Promise<ChunkingStats> {
        const startTime = performance.now();
        this.logger.info("Starting ESLint chunker...");

        try {
            // Discover files to lint
            const fileDiscoveryOptions: {
                cwd: string;
                config?: string;
                include?: string[];
                ignore?: string[];
            } = {
                cwd: this.options.cwd,
            };

            if (this.options.config !== undefined) {
                fileDiscoveryOptions.config = this.options.config;
            }
            if (this.options.include !== undefined) {
                fileDiscoveryOptions.include = this.options.include;
            }
            if (this.options.ignore !== undefined) {
                fileDiscoveryOptions.ignore = this.options.ignore;
            }

            const files =
                await this.fileScanner.scanFiles(fileDiscoveryOptions);

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
                ),
                endTime = performance.now(),
                stats = this.createStats(
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
    private async processChunks(
        chunks: string[][],
        progressCallback?: ProgressCallback
    ): Promise<ChunkResult[]> {
        const results: ChunkResult[] = [],
            limit = pLimit(this.options.concurrency),
            // Process chunks with controlled concurrency
            chunkPromises = chunks.map((chunk, index) =>
                limit(() => this.processChunk(chunk, index))
            );

        for (let i = 0; i < chunkPromises.length; i++) {
            try {
                const result = await chunkPromises[i];
                results.push(result!);

                // Report progress
                if (progressCallback && result) {
                    progressCallback(i + 1, chunks.length, result);
                }

                // Log progress
                if (result && this.options.chunkLogs) {
                    this.logChunkProgress(result, i + 1, chunks.length);
                }
            } catch (error) {
                this.logger.error(`Failed to process chunk ${i + 1}:`, error);

                const failedResult: ChunkResult = {
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
    private async processChunk(
        files: string[],
        chunkIndex: number
    ): Promise<ChunkResult> {
        const startTime = performance.now();

        this.logger.verbose(
            `Processing chunk ${chunkIndex + 1} with ${files.length} files`
        );

        try {
            const { ESLint } = await loadESLintModule();

            // Create ESLint instance for this chunk
            const eslintOptions: ESLintType.Options = {
                cwd: this.options.cwd,
                cache: true,
                cacheLocation: this.options.cacheLocation,
                concurrency: this.options.maxWorkers,
                fix: this.options.fix,
                fixTypes: this.options.fixTypes,
                warnIgnored: this.options.warnIgnored,
            };

            // Only override config lookup when a config path is explicitly set
            if (this.options.config) {
                eslintOptions.overrideConfigFile = this.options.config;
            }

            const eslint = new ESLint(eslintOptions),
                // Lint files in this chunk
                results = await eslint.lintFiles(files);

            // Apply fixes if enabled
            if (this.options.fix) {
                await ESLint.outputFixes(results);
            }

            // Calculate statistics for this chunk
            const errorCount = results.reduce(
                    (sum, result) => sum + result.errorCount,
                    0
                ),
                warningCount = results.reduce(
                    (sum, result) => sum + result.warningCount,
                    0
                ),
                fixedCount = results.reduce(
                    (sum, result) => sum + (result.output ? 1 : 0),
                    0
                ),
                processingTime = performance.now() - startTime;

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
    private createStats(
        chunkResults: ChunkResult[],
        totalFiles: number,
        totalTime: number
    ): ChunkingStats {
        const filesWithErrors = chunkResults.reduce(
                (sum, chunk) =>
                    sum + (chunk.errorCount > 0 ? chunk.files.length : 0),
                0
            ),
            filesWithWarnings = chunkResults.reduce(
                (sum, chunk) =>
                    sum + (chunk.warningCount > 0 ? chunk.files.length : 0),
                0
            ),
            filesFixed = chunkResults.reduce(
                (sum, chunk) => sum + chunk.fixedCount,
                0
            ),
            failedChunks = chunkResults.filter(
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
    private logChunkProgress(
        result: ChunkResult,
        completed: number,
        total: number
    ): void {
        const progress = Math.round((completed / total) * 100),
            statusIcon = result.success ? "✅" : "❌";

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
    private logFinalStats(stats: ChunkingStats): void {
        const totalTime = Math.round(stats.totalTime),
            avgTimePerFile =
                stats.totalFiles > 0
                    ? Math.round(stats.totalTime / stats.totalFiles)
                    : 0;

        if (this.options.quiet) {
            return;
        }

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
    private normalizeOptions(
        options: ChunkerOptions
    ): NormalizedChunkerOptions {
        const normalized: NormalizedChunkerOptions = {
            size: Math.max(1, options.size ?? 200),
            cacheLocation: options.cacheLocation ?? ".eslintcache",
            maxWorkers: options.maxWorkers ?? "off",
            continueOnError: options.continueOnError ?? false,
            fix: options.fix ?? false,
            fixTypes: options.fixTypes ?? [
                "problem",
                "suggestion",
                "layout",
            ],
            warnIgnored: options.warnIgnored !== false,
            cwd: options.cwd ?? process.cwd(),
            verbose: options.verbose ?? false,
            quiet: options.quiet ?? false,
            chunkLogs: options.chunkLogs ?? true,
            concurrency: Math.max(1, options.concurrency ?? 1),
        };

        if (options.config !== undefined) {
            normalized.config = options.config;
        }
        if (options.include !== undefined) {
            normalized.include = options.include;
        }
        if (options.ignore !== undefined) {
            normalized.ignore = options.ignore;
        }

        return normalized;
    }
}
