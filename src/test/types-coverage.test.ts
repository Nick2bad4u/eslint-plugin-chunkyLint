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

describe("types coverage test", () => {
    it("validates ChunkerOptions shape", () => {
        expect.hasAssertions();

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

        expect(options).toMatchObject({
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
        });
    });

    it("validates ChunkingStats and ChunkResult shapes", () => {
        expect.hasAssertions();

        const stats: ChunkingStats = {
            failedChunks: 1,
            filesFixed: 3,
            filesWithErrors: 2,
            filesWithWarnings: 5,
            totalChunks: 10,
            totalFiles: 100,
            totalTime: 5000,
        };

        expect(stats).toMatchObject({
            failedChunks: 1,
            filesFixed: 3,
            filesWithErrors: 2,
            filesWithWarnings: 5,
            totalChunks: 10,
            totalFiles: 100,
            totalTime: 5000,
        });

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

        expect(result).toMatchObject({
            chunkIndex: 0,
            error: "",
            errorCount: 0,
            files: ["test.js"],
            fixedCount: 1,
            processingTime: 1000,
            success: true,
            warningCount: 0,
        });
    });

    it("validates FileDiscoveryOptions and Logger contracts", () => {
        expect.hasAssertions();

        const discoveryOptions: FileDiscoveryOptions = {
            config: "eslint.config.mjs",
            cwd: process.cwd(),
            followSymlinks: false,
            ignore: ["node_modules/**"],
            include: ["**/*.js"],
        };

        expect(discoveryOptions).toMatchObject({
            config: "eslint.config.mjs",
            cwd: process.cwd(),
            followSymlinks: false,
            ignore: ["node_modules/**"],
            include: ["**/*.js"],
        });

        const logger: Logger = {
            debug: () => {},
            error: () => {},
            info: () => {},
            verbose: () => {},
            warn: () => {},
        };

        expect(logger.debug).toBeTypeOf("function");
        expect(logger.error).toBeTypeOf("function");
        expect(logger.info).toBeTypeOf("function");
        expect(logger.verbose).toBeTypeOf("function");
        expect(logger.warn).toBeTypeOf("function");
    });

    it("validates ProgressCallback and ChunkyLintConfig contracts", () => {
        expect.hasAssertions();

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

        expect(config).toMatchObject({
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
        });
    });
});
