import type {
    ChunkResult,
    ChunkerOptions,
    ChunkingStats,
    FileDiscoveryOptions,
    Logger,
    ProgressCallback,
} from "../types/index.js";
import { describe, expect, it } from "vitest";

describe("Type definitions", () => {
    it("should define ChunkerOptions interface correctly", () => {
        const options: ChunkerOptions = {
            config: "./eslint.config.js",
            size: 100,
            cacheLocation: ".cache/.eslintcache",
            maxWorkers: 4,
            continueOnError: true,
            fix: true,
            fixTypes: ["directive", "problem"],
            warnIgnored: false,
            include: ["src/**/*.ts"],
            ignore: ["dist/**"],
            cwd: process.cwd(),
            verbose: true,
            concurrency: 2,
        };

        expect(options.config).toBe("./eslint.config.js");
        expect(options.size).toBe(100);
        expect(options.cacheLocation).toBe(".cache/.eslintcache");
        expect(options.maxWorkers).toBe(4);
        expect(options.continueOnError).toBe(true);
        expect(options.fix).toBe(true);
        expect(options.fixTypes).toEqual(["directive", "problem"]);
        expect(options.warnIgnored).toBe(false);
        expect(options.include).toEqual(["src/**/*.ts"]);
        expect(options.ignore).toEqual(["dist/**"]);
        expect(options.cwd).toBe(process.cwd());
        expect(options.verbose).toBe(true);
        expect(options.concurrency).toBe(2);
    });

    it("should define ChunkingStats interface correctly", () => {
        const stats: ChunkingStats = {
            totalFiles: 10,
            totalChunks: 3,
            totalTime: 1500,
            filesWithErrors: 2,
            filesWithWarnings: 1,
            filesFixed: 5,
            failedChunks: 0,
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
        const result: ChunkResult = {
            chunkIndex: 1,
            files: ["file1.ts", "file2.ts"],
            errorCount: 2,
            warningCount: 1,
            fixedCount: 3,
            processingTime: 500,
            success: true,
        };

        expect(result.chunkIndex).toBe(1);
        expect(result.files).toEqual(["file1.ts", "file2.ts"]);
        expect(result.errorCount).toBe(2);
        expect(result.warningCount).toBe(1);
        expect(result.fixedCount).toBe(3);
        expect(result.processingTime).toBe(500);
        expect(result.success).toBe(true);
    });

    it("should define FileDiscoveryOptions interface correctly", () => {
        const options: FileDiscoveryOptions = {
            config: "./eslint.config.js",
            include: ["src/**/*.ts"],
            ignore: ["dist/**"],
            cwd: process.cwd(),
            followSymlinks: true,
        };

        expect(options.config).toBe("./eslint.config.js");
        expect(options.include).toEqual(["src/**/*.ts"]);
        expect(options.ignore).toEqual(["dist/**"]);
        expect(options.cwd).toBe(process.cwd());
        expect(options.followSymlinks).toBe(true);
    });

    it("should define ProgressCallback type correctly", () => {
        const callback: ProgressCallback = (
            processed: number,
            total: number,
            currentChunk: ChunkResult | null
        ) => {
            console.log(`Progress: ${processed.toString()}/${total.toString()}`, currentChunk);
        };

        expect(typeof callback).toBe("function");
        // Test that the callback can be called with expected parameters
        const mockChunk: ChunkResult = {
            chunkIndex: 1,
            files: ["test.ts"],
            success: true,
            processingTime: 100,
            errorCount: 0,
            warningCount: 0,
            fixedCount: 0,
        };
        expect(() => { callback(1, 10, mockChunk); }).not.toThrow();
        expect(() => { callback(1, 10, null); }).not.toThrow();
    });

    it("should define Logger interface correctly", () => {
        const logger: Logger = {
            info: (...args: unknown[]) => { console.log(...args); },
            warn: (...args: unknown[]) => { console.warn(...args); },
            error: (...args: unknown[]) => { console.error(...args); },
            debug: (...args: unknown[]) => { console.debug(...args); },
            verbose: (...args: unknown[]) => { console.log(...args); },
        };

        expect(typeof logger.info).toBe("function");
        expect(typeof logger.warn).toBe("function");
        expect(typeof logger.error).toBe("function");
        expect(typeof logger.debug).toBe("function");
        expect(typeof logger.verbose).toBe("function");

        // Test that the logger methods can be called
        expect(() => { logger.info("test"); }).not.toThrow();
        expect(() => { logger.warn("test"); }).not.toThrow();
        expect(() => { logger.error("test"); }).not.toThrow();
        expect(() => { logger.debug("test"); }).not.toThrow();
        expect(() => { logger.verbose("test"); }).not.toThrow();
    });

    it("should allow partial ChunkerOptions", () => {
        const partialOptions: ChunkerOptions = {
            size: 50,
        };

        expect(partialOptions.size).toBe(50);
        expect(partialOptions.config).toBeUndefined();
    });

    it("should allow maxWorkers as string values", () => {
        const optionsAuto: ChunkerOptions = { maxWorkers: "auto" },
         optionsOff: ChunkerOptions = { maxWorkers: "off" };

        expect(optionsAuto.maxWorkers).toBe("auto");
        expect(optionsOff.maxWorkers).toBe("off");
    });

    it("should allow all fix types", () => {
        const options: ChunkerOptions = {
            fixTypes: ["directive", "problem", "suggestion", "layout"],
        };

        expect(options.fixTypes).toEqual([
            "directive",
            "problem",
            "suggestion",
            "layout",
        ]);
    });
});
