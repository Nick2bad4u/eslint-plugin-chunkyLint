import type { UnknownArray } from "type-fest";

import { describe, expect, it } from "vitest";

import type {
    ChunkerOptions,
    ChunkingStats,
    ChunkResult,
    FileDiscoveryOptions,
    Logger,
    ProgressCallback,
} from "../types/chunky-lint-types.js";

describe("type definitions", () => {
    it("should define ChunkerOptions interface correctly", () => {
        expect.hasAssertions();

        const options: ChunkerOptions = {
            cacheLocation: ".cache/.eslintcache",
            chunkLogs: true,
            concurrency: 2,
            config: "./eslint.config.js",
            continueOnError: true,
            cwd: process.cwd(),
            fix: true,
            fixTypes: ["directive", "problem"],
            ignore: ["dist/**"],
            include: ["src/**/*.ts"],
            maxWorkers: 4,
            quiet: false,
            size: 100,
            verbose: true,
            warnIgnored: false,
        };

        expect(options.config).toBe("./eslint.config.js");
        expect(options.size).toBe(100);
        expect(options.cacheLocation).toBe(".cache/.eslintcache");
        expect(options.maxWorkers).toBe(4);
        expect(options.continueOnError).toBeTruthy();
        expect(options.fix).toBeTruthy();
        expect(options.fixTypes).toStrictEqual(["directive", "problem"]);
        expect(options.warnIgnored).toBeFalsy();
        expect(options.include).toStrictEqual(["src/**/*.ts"]);
        expect(options.ignore).toStrictEqual(["dist/**"]);
        expect(options.cwd).toBe(process.cwd());
        expect(options.verbose).toBeTruthy();
        expect(options.quiet).toBeFalsy();
        expect(options.chunkLogs).toBeTruthy();
        expect(options.concurrency).toBe(2);
    });

    it("should define ChunkingStats interface correctly", () => {
        expect.hasAssertions();

        const stats: ChunkingStats = {
            failedChunks: 0,
            filesFixed: 5,
            filesWithErrors: 2,
            filesWithWarnings: 1,
            totalChunks: 3,
            totalFiles: 10,
            totalTime: 1500,
        };

        expect(stats.totalFiles).toBe(10);
        expect(stats.totalChunks).toBe(3);
        expect(stats.totalTime).toBe(1500);
        expect(stats.filesWithErrors).toBe(2);
        expect(stats.filesWithWarnings).toBe(1);
        expect(stats.filesFixed).toBe(5);
        expect(stats.failedChunks).toBe(0);
    });

    it("should define ChunkResult interface correctly", () => {
        expect.hasAssertions();

        const result: ChunkResult = {
            chunkIndex: 1,
            errorCount: 2,
            files: ["file1.ts", "file2.ts"],
            fixedCount: 3,
            processingTime: 500,
            success: true,
            warningCount: 1,
        };

        expect(result.chunkIndex).toBe(1);
        expect(result.files).toStrictEqual(["file1.ts", "file2.ts"]);
        expect(result.errorCount).toBe(2);
        expect(result.warningCount).toBe(1);
        expect(result.fixedCount).toBe(3);
        expect(result.processingTime).toBe(500);
        expect(result.success).toBeTruthy();
    });

    it("should define FileDiscoveryOptions interface correctly", () => {
        expect.hasAssertions();

        const options: FileDiscoveryOptions = {
            config: "./eslint.config.js",
            cwd: process.cwd(),
            followSymlinks: true,
            ignore: ["dist/**"],
            include: ["src/**/*.ts"],
        };

        expect(options.config).toBe("./eslint.config.js");
        expect(options.include).toStrictEqual(["src/**/*.ts"]);
        expect(options.ignore).toStrictEqual(["dist/**"]);
        expect(options.cwd).toBe(process.cwd());
        expect(options.followSymlinks).toBeTruthy();
    });

    it("should define ProgressCallback type correctly", () => {
        expect.hasAssertions();

        const progressHandler: ProgressCallback = (
            processed: number,
            total: number,
            currentChunk: null | Readonly<ChunkResult>
        ) => {
            expect(processed).toBeGreaterThan(0);
            expect(total).toBeGreaterThan(0);
            expect(currentChunk === null || currentChunk.success).toBeDefined();
        };

        expect(progressHandler).toBeTypeOf("function");

        // Test that the callback can be called with expected parameters
        const mockChunk: ChunkResult = {
            chunkIndex: 1,
            errorCount: 0,
            files: ["test.ts"],
            fixedCount: 0,
            processingTime: 100,
            success: true,
            warningCount: 0,
        };

        expect(() => {
            progressHandler(1, 10, mockChunk);
        }).not.toThrow();
        expect(() => {
            progressHandler(1, 10, null);
        }).not.toThrow();
    });

    it("should define Logger interface correctly", () => {
        expect.hasAssertions();

        const logger: Logger = {
            debug: (...args: Readonly<UnknownArray>) => {
                expect(args).toBeDefined();
            },
            error: (...args: Readonly<UnknownArray>) => {
                expect(args).toBeDefined();
            },
            info: (...args: Readonly<UnknownArray>) => {
                expect(args).toBeDefined();
            },
            verbose: (...args: Readonly<UnknownArray>) => {
                expect(args).toBeDefined();
            },
            warn: (...args: Readonly<UnknownArray>) => {
                expect(args).toBeDefined();
            },
        };

        expect(logger.info).toBeTypeOf("function");
        expect(logger.warn).toBeTypeOf("function");
        expect(logger.error).toBeTypeOf("function");
        expect(logger.debug).toBeTypeOf("function");
        expect(logger.verbose).toBeTypeOf("function");

        // Test that the logger methods can be called
        expect(() => {
            logger.info("test");
        }).not.toThrow();
        expect(() => {
            logger.warn("test");
        }).not.toThrow();
        expect(() => {
            logger.error("test");
        }).not.toThrow();
        expect(() => {
            logger.debug("test");
        }).not.toThrow();
        expect(() => {
            logger.verbose("test");
        }).not.toThrow();
    });

    it("should allow partial ChunkerOptions", () => {
        expect.hasAssertions();

        const partialOptions: ChunkerOptions = {
            size: 50,
        };

        expect(partialOptions.size).toBe(50);
        expect(partialOptions.config).toBeUndefined();
    });

    it("should allow maxWorkers as string values", () => {
        expect.hasAssertions();

        const optionsAuto: ChunkerOptions = { maxWorkers: "auto" },
            optionsOff: ChunkerOptions = { maxWorkers: "off" };

        expect(optionsAuto.maxWorkers).toBe("auto");
        expect(optionsOff.maxWorkers).toBe("off");
    });

    it("should allow all fix types", () => {
        expect.hasAssertions();

        const options: ChunkerOptions = {
            fixTypes: [
                "directive",
                "problem",
                "suggestion",
                "layout",
            ],
        };

        expect(options.fixTypes).toStrictEqual([
            "directive",
            "problem",
            "suggestion",
            "layout",
        ]);
    });
});
