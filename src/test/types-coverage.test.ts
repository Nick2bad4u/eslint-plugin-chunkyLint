import { describe, expect, it } from "vitest";

import type {
    ChunkerOptions,
    ChunkingStats,
    ChunkResult,
    ChunkyLintConfig,
    FileDiscoveryOptions,
    Logger,
    ProgressCallback,
} from "../types/chunky-lint-types.js";

describe("Types coverage test", () => {
    it("uses all exported types in executable paths", () => {
        const options: ChunkerOptions = {
            cacheLocation: ".eslintcache",
            chunkLogs: true,
            concurrency: 2,
            config: "eslint.config.mjs",
            continueOnError: false,
            cwd: process.cwd(),
            fix: true,
            fixTypes: ["problem", "suggestion"],
            ignore: ["dist/**"],
            include: ["src/**/*.ts"],
            maxWorkers: 2,
            quiet: false,
            size: 10,
            verbose: true,
            warnIgnored: true,
        };

        expect(options.cacheLocation).toBe(".eslintcache");
        expect(options.chunkLogs).toBe(true);
        expect(options.concurrency).toBe(2);
        expect(options.config).toBe("eslint.config.mjs");
        expect(options.continueOnError).toBe(false);
        expect(options.cwd).toBe(process.cwd());
        expect(options.fix).toBe(true);
        expect(options.fixTypes).toEqual(["problem", "suggestion"]);
        expect(options.ignore).toEqual(["dist/**"]);
        expect(options.include).toEqual(["src/**/*.ts"]);
        expect(options.maxWorkers).toBe(2);
        expect(options.quiet).toBe(false);
        expect(options.size).toBe(10);
        expect(options.verbose).toBe(true);
        expect(options.warnIgnored).toBe(true);

        const stats: ChunkingStats = {
            failedChunks: 1,
            filesFixed: 3,
            filesWithErrors: 2,
            filesWithWarnings: 5,
            totalChunks: 10,
            totalFiles: 100,
            totalTime: 5000,
        };

        expect(stats.failedChunks).toBe(1);
        expect(stats.filesFixed).toBe(3);
        expect(stats.filesWithErrors).toBe(2);
        expect(stats.filesWithWarnings).toBe(5);
        expect(stats.totalChunks).toBe(10);
        expect(stats.totalFiles).toBe(100);
        expect(stats.totalTime).toBe(5000);

        const result: ChunkResult = {
            chunkIndex: 0,
            error: "",
            errorCount: 0,
            files: ["test.js"],
            fixedCount: 1,
            processingTime: 1000,
            success: true,
            warningCount: 0,
        };

        expect(result.chunkIndex).toBe(0);
        expect(result.error).toBe("");
        expect(result.errorCount).toBe(0);
        expect(result.files).toEqual(["test.js"]);
        expect(result.fixedCount).toBe(1);
        expect(result.processingTime).toBe(1000);
        expect(result.success).toBe(true);
        expect(result.warningCount).toBe(0);

        const discoveryOptions: FileDiscoveryOptions = {
            config: "eslint.config.mjs",
            cwd: process.cwd(),
            followSymlinks: false,
            ignore: ["node_modules/**"],
            include: ["**/*.js"],
        };

        expect(discoveryOptions.config).toBe("eslint.config.mjs");
        expect(discoveryOptions.cwd).toBe(process.cwd());
        expect(discoveryOptions.followSymlinks).toBe(false);
        expect(discoveryOptions.ignore).toEqual(["node_modules/**"]);
        expect(discoveryOptions.include).toEqual(["**/*.js"]);

        const logger: Logger = {
            debug: () => {},
            error: () => {},
            info: () => {},
            verbose: () => {},
            warn: () => {},
        };

        expect(typeof logger.debug).toBe("function");
        expect(typeof logger.error).toBe("function");
        expect(typeof logger.info).toBe("function");
        expect(typeof logger.verbose).toBe("function");
        expect(typeof logger.warn).toBe("function");

        const progressHandler: ProgressCallback = (
            current,
            total,
            chunk
        ): void => {
            expect(current).toBeGreaterThan(0);
            expect(total).toBeGreaterThan(0);
            expect(chunk).not.toBeNull();
        };

        progressHandler(1, 10, result);

        const config: ChunkyLintConfig = {
            cacheLocation: ".eslintcache",
            chunkLogs: true,
            concurrency: 2,
            config: "eslint.config.mjs",
            continueOnError: true,
            cwd: process.cwd(),
            fix: true,
            followSymlinks: false,
            ignore: ["dist/**"],
            include: ["src/**/*.ts"],
            quiet: false,
            size: 25,
            verbose: true,
        };

        expect(config.cacheLocation).toBe(".eslintcache");
        expect(config.chunkLogs).toBe(true);
        expect(config.concurrency).toBe(2);
        expect(config.config).toBe("eslint.config.mjs");
        expect(config.continueOnError).toBe(true);
        expect(config.cwd).toBe(process.cwd());
        expect(config.fix).toBe(true);
        expect(config.followSymlinks).toBe(false);
        expect(config.ignore).toEqual(["dist/**"]);
        expect(config.include).toEqual(["src/**/*.ts"]);
        expect(config.quiet).toBe(false);
        expect(config.size).toBe(25);
        expect(config.verbose).toBe(true);
    });
});
