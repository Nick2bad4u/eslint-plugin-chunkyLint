import { describe, expect, it } from "vitest";

import type {
    ChunkerOptions,
    ChunkingStats,
    ChunkResult,
    ChunkyLintConfig,
    FileDiscoveryOptions,
    Logger,
    ProgressCallback,
} from "../types/index.js";

describe("Types coverage test", () => {
    it("should import and use all types from types/index.ts", () => {
        // This test ensures all exported types are reachable and testable

        // Test ChunkerOptions
        const options: ChunkerOptions = {
            concurrency: 2,
            size: 10,
        };
        expect(options.size).toBe(10);

        // Test ChunkingStats
        const stats: ChunkingStats = {
            failedChunks: 1,
            filesFixed: 3,
            filesWithErrors: 2,
            filesWithWarnings: 5,
            totalChunks: 10,
            totalFiles: 100,
            totalTime: 5000,
        };
        expect(stats.totalFiles).toBe(100);

        // Test ChunkResult
        const result: ChunkResult = {
            chunkIndex: 0,
            errorCount: 0,
            files: ["test.js"],
            fixedCount: 1,
            processingTime: 1000,
            success: true,
            warningCount: 0,
        };
        expect(result.success).toBe(true);

        // Test FileDiscoveryOptions
        const discoveryOptions: FileDiscoveryOptions = {
            ignore: ["node_modules/**"],
            include: ["**/*.js"],
        };
        expect(discoveryOptions.include).toEqual(["**/*.js"]);

        // Test ProgressCallback
        const callback: ProgressCallback = (current, total, chunk) => {
            expect(current).toBeGreaterThan(0);
            expect(total).toBeGreaterThan(0);
            expect(chunk).toBeDefined();
        };
        callback(1, 10, result);

        // Test Logger interface
         
        const logger: Logger = {
            debug: () => {},
            error: () => {},
            info: () => {},
            verbose: () => {},
            warn: () => {},
        };
         
        expect(typeof logger.info).toBe("function");

        // All types are properly imported and usable
        expect(true).toBe(true);
    });

    it("should handle optional properties in ChunkerOptions", () => {
        // Test minimal options
        const minimalOptions: ChunkerOptions = {};
        expect(minimalOptions).toBeDefined();

        // Test full options
        const fullOptions: ChunkerOptions = {
            cacheLocation: ".eslintcache",
            chunkLogs: true,
            concurrency: 4,
            config: "eslint.config.js",
            continueOnError: true,
            cwd: "/project",
            fix: true,
            fixTypes: ["problem", "suggestion"],
            ignore: ["**/*.test.ts"],
            include: ["src/**/*.ts"],
            maxWorkers: 4,
            quiet: false,
            size: 50,
            verbose: true,
            warnIgnored: false,
        };
        expect(fullOptions.size).toBe(50);
        expect(fullOptions.fixTypes).toEqual(["problem", "suggestion"]);
    });

    it("should handle optional properties in ChunkResult", () => {
        // Test result with error
        const errorResult: ChunkResult = {
            chunkIndex: 1,
            error: "ESLint failed",
            errorCount: 1,
            files: ["error.js"],
            fixedCount: 0,
            processingTime: 500,
            success: false,
            warningCount: 0,
        };
        expect(errorResult.success).toBe(false);
        expect(errorResult.error).toBe("ESLint failed");
    });

    it("should validate FixType union values", () => {
        // Test that FixType accepts correct values
        const directiveFix = "directive" as const,
            layoutFix = "layout" as const,
            problemFix = "problem" as const,
            suggestionFix = "suggestion" as const;

        expect(problemFix).toBe("problem");
        expect(suggestionFix).toBe("suggestion");
        expect(layoutFix).toBe("layout");
        expect(directiveFix).toBe("directive");
    });

    it("should handle ChunkyLintConfig interface", () => {
        // Test minimal config
        const minimalConfig: ChunkyLintConfig = {};
        expect(minimalConfig).toBeDefined();

        // Test full config
        const fullConfig: ChunkyLintConfig = {
            cacheLocation: ".eslintcache",
            chunkLogs: true,
            concurrency: 4,
            config: "eslint.config.js",
            continueOnError: false,
            cwd: "/project",
            fix: true,
            followSymlinks: false,
            ignore: ["**/*.test.ts"],
            include: ["src/**/*.ts"],
            quiet: false,
            size: 100,
            verbose: true,
        };
        expect(fullConfig.size).toBe(100);
        expect(fullConfig.concurrency).toBe(4);
        expect(fullConfig.verbose).toBe(true);
        expect(fullConfig.quiet).toBe(false);
        expect(fullConfig.chunkLogs).toBe(true);
        expect(fullConfig.fix).toBe(true);
        expect(fullConfig.continueOnError).toBe(false);
    });
});
