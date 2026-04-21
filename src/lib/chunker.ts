import type { ESLint as ESLintType } from "eslint";
import type { Except } from "type-fest";

import chalk from "chalk";
import { performance } from "node:perf_hooks";
import pLimit from "p-limit";
import { isEmpty } from "ts-extras";

import type {
    ChunkerOptions,
    ChunkingStats,
    ChunkResult,
    Logger,
    ProgressCallback,
} from "../types/chunky-lint-types.js";

import { loadESLintModule } from "./eslint-loader.js";
import { FileScanner } from "./file-scanner.js";
import { ConsoleLogger } from "./logger.js";

type NormalizedChunkerOptions = Except<
    Required<ChunkerOptions>,
    "config" | "ignore" | "include"
> & {
    config?: string;
    ignore?: string[];
    include?: string[];
};

/**
 * ESLint Chunker - main orchestrator for chunked ESLint execution.
 */
export class ESLintChunker {
    private readonly fileScanner: FileScanner;
    private readonly logger: Logger;
    private readonly options: NormalizedChunkerOptions;

    public constructor(options: Readonly<ChunkerOptions> = {}) {
        this.options = ESLintChunker.normalizeOptions(options);
        this.logger = new ConsoleLogger(
            this.options.verbose,
            this.options.quiet
        );
        this.fileScanner = new FileScanner(this.logger);
    }

    private static createStats(
        chunkResults: readonly Readonly<ChunkResult>[],
        totalFiles: number,
        totalTime: number
    ): ChunkingStats {
        const failedChunks = chunkResults.filter(
            (chunk) => !chunk.success
        ).length;
        const filesFixed = chunkResults.reduce(
            (sum, chunk) => sum + chunk.fixedCount,
            0
        );
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

        return {
            failedChunks,
            filesFixed,
            filesWithErrors,
            filesWithWarnings,
            totalChunks: chunkResults.length,
            totalFiles,
            totalTime,
        };
    }

    private static normalizeOptions(
        options: Readonly<ChunkerOptions>
    ): NormalizedChunkerOptions {
        const normalized: NormalizedChunkerOptions = {
            cacheLocation: options.cacheLocation ?? ".eslintcache",
            chunkLogs: options.chunkLogs ?? true,
            concurrency: Math.max(1, options.concurrency ?? 1),
            continueOnError: options.continueOnError ?? false,
            cwd: options.cwd ?? process.cwd(),
            fix: options.fix ?? false,
            fixTypes: options.fixTypes ?? [
                "problem",
                "suggestion",
                "layout",
            ],
            maxWorkers: options.maxWorkers ?? "off",
            quiet: options.quiet ?? false,
            size: Math.max(1, options.size ?? 200),
            verbose: options.verbose ?? false,
            warnIgnored: options.warnIgnored !== false,
        };

        if (typeof options.config === "string" && options.config.length > 0) {
            normalized.config = options.config;
        }

        if (Array.isArray(options.include)) {
            normalized.include = [...options.include];
        }

        if (Array.isArray(options.ignore)) {
            normalized.ignore = [...options.ignore];
        }

        return normalized;
    }

    /**
     * Run ESLint in chunked mode.
     */
    public async run(
        progressCallback?: ProgressCallback
    ): Promise<ChunkingStats> {
        const startTime = performance.now();
        this.logger.info("Starting ESLint chunker...");

        try {
            const fileDiscoveryOptions: {
                config?: string;
                cwd: string;
                ignore?: string[];
                include?: string[];
            } = { cwd: this.options.cwd };

            if (
                typeof this.options.config === "string" &&
                this.options.config.length > 0
            ) {
                fileDiscoveryOptions.config = this.options.config;
            }

            if (Array.isArray(this.options.include)) {
                fileDiscoveryOptions.include = this.options.include;
            }

            if (Array.isArray(this.options.ignore)) {
                fileDiscoveryOptions.ignore = this.options.ignore;
            }

            const files =
                await this.fileScanner.scanFiles(fileDiscoveryOptions);

            if (isEmpty(files)) {
                this.logger.warn("No files found to lint");
                return ESLintChunker.createStats(
                    [],
                    0,
                    performance.now() - startTime
                );
            }

            const chunks = this.fileScanner.chunkFiles(
                files,
                this.options.size
            );
            this.logger.info(
                `Processing ${files.length.toString()} files in ${chunks.length.toString()} chunks of ~${this.options.size.toString()} files each`
            );

            const chunkResults = await this.processChunks(
                chunks,
                progressCallback
            );
            const endTime = performance.now();
            const stats = ESLintChunker.createStats(
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

    private logChunkProgress(
        result: Readonly<ChunkResult>,
        completed: number,
        total: number
    ): void {
        const progress = Math.round((completed / total) * 100);
        const statusIcon = result.success ? "✅" : "❌";

        let message = `${statusIcon} Chunk ${completed.toString()}/${total.toString()} (${progress.toString()}%)`;

        if (result.success) {
            const time = Math.round(result.processingTime);
            message += ` - ${result.files.length.toString()} files, ${time.toString()}ms`;

            if (result.errorCount > 0) {
                message += chalk.red(
                    ` - ${result.errorCount.toString()} errors`
                );
            }

            if (result.warningCount > 0) {
                message += chalk.yellow(
                    ` - ${result.warningCount.toString()} warnings`
                );
            }

            if (result.fixedCount > 0) {
                message += chalk.green(
                    ` - ${result.fixedCount.toString()} fixed`
                );
            }
        } else {
            message += chalk.red(
                ` - FAILED: ${result.error ?? "Unknown failure"}`
            );
        }

        this.logger.info(message);
    }

    private logFinalStats(stats: Readonly<ChunkingStats>): void {
        if (this.options.quiet) {
            return;
        }

        const avgTimePerFile =
            stats.totalFiles > 0
                ? Math.round(stats.totalTime / stats.totalFiles)
                : 0;
        const totalTime = Math.round(stats.totalTime);

        this.logger.info("");
        this.logger.info(chalk.green("✅ ESLint chunker completed!"));
        this.logger.info(
            `📊 Processed ${stats.totalFiles.toString()} files in ${stats.totalChunks.toString()} chunks`
        );
        this.logger.info(
            `⏱️  Total time: ${totalTime.toString()}ms (~${avgTimePerFile.toString()}ms per file)`
        );

        if (stats.filesWithErrors > 0) {
            this.logger.info(
                chalk.red(
                    `❌ Files with errors: ${stats.filesWithErrors.toString()}`
                )
            );
        }

        if (stats.filesWithWarnings > 0) {
            this.logger.info(
                chalk.yellow(
                    `⚠️  Files with warnings: ${stats.filesWithWarnings.toString()}`
                )
            );
        }

        if (stats.filesFixed > 0) {
            this.logger.info(
                chalk.green(`🔧 Files fixed: ${stats.filesFixed.toString()}`)
            );
        }

        if (stats.failedChunks > 0) {
            this.logger.info(
                chalk.red(`💥 Failed chunks: ${stats.failedChunks.toString()}`)
            );
        }
    }

    private async processChunk(
        files: readonly string[],
        chunkIndex: number
    ): Promise<ChunkResult> {
        const startTime = performance.now();

        this.logger.verbose(
            `Processing chunk ${(chunkIndex + 1).toString()} with ${files.length.toString()} files`
        );

        try {
            const { ESLint } = await loadESLintModule();

            const eslintOptions: ESLintType.Options = {
                cache: true,
                cacheLocation: this.options.cacheLocation,
                concurrency: this.options.maxWorkers,
                cwd: this.options.cwd,
                fix: this.options.fix,
                fixTypes: this.options.fixTypes,
                warnIgnored: this.options.warnIgnored,
            };

            if (
                typeof this.options.config === "string" &&
                this.options.config.length > 0
            ) {
                eslintOptions.overrideConfigFile = this.options.config;
            }

            const eslint = new ESLint(eslintOptions);
            const results = await eslint.lintFiles([...files]);

            if (this.options.fix) {
                await ESLint.outputFixes(results);
            }

            const errorCount = results.reduce(
                (sum: number, result: Readonly<ESLintType.LintResult>) =>
                    sum + result.errorCount,
                0
            );
            const fixedCount = results.reduce(
                (sum: number, result: Readonly<ESLintType.LintResult>) =>
                    sum + (typeof result.output === "string" ? 1 : 0),
                0
            );
            const warningCount = results.reduce(
                (sum: number, result: Readonly<ESLintType.LintResult>) =>
                    sum + result.warningCount,
                0
            );
            const processingTime = performance.now() - startTime;

            return {
                chunkIndex,
                errorCount,
                files: [...files],
                fixedCount,
                processingTime,
                success: true,
                warningCount,
            };
        } catch (error) {
            const processingTime = performance.now() - startTime;
            return {
                chunkIndex,
                error: error instanceof Error ? error.message : String(error),
                errorCount: 0,
                files: [...files],
                fixedCount: 0,
                processingTime,
                success: false,
                warningCount: 0,
            };
        }
    }

    private async processChunks(
        chunks: readonly (readonly string[])[],
        progressCallback?: ProgressCallback
    ): Promise<ChunkResult[]> {
        const limit = pLimit(this.options.concurrency);
        const chunkPromises = chunks.map((chunk, index) =>
            limit(() => this.processChunk(chunk, index))
        );

        const resolvedResults = await Promise.all(chunkPromises);
        const results: ChunkResult[] = [];
        for (const result of resolvedResults) {
            results.push(result);

            const completed = results.length;

            if (this.options.chunkLogs && !this.options.quiet) {
                this.logChunkProgress(result, completed, chunks.length);
            }

            if (typeof progressCallback === "function") {
                progressCallback(completed, chunks.length, result);
            }

            if (!result.success && !this.options.continueOnError) {
                throw new Error(result.error ?? "Chunk processing failed");
            }
        }

        return results;
    }
}
