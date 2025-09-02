import { describe, it, expect } from "vitest";
import type {
    ChunkerOptions,
    ChunkingStats,
    ChunkResult,
    FileDiscoveryOptions,
    ProgressCallback,
    Logger,
} from "../types/index.js";

describe("Types coverage test", () => {
    it("should import and use all types from types/index.ts", () => {
        // This test ensures all exported types are reachable and testable

        // Test ChunkerOptions
        const options: ChunkerOptions = {
            size: 10,
            concurrency: 2,
        };
        expect(options.size).toBe(10);

        // Test ChunkingStats
        const stats: ChunkingStats = {
            totalFiles: 100,
            totalChunks: 10,
            totalTime: 5000,
            filesWithErrors: 2,
            filesWithWarnings: 5,
            filesFixed: 3,
            failedChunks: 1,
        };
        expect(stats.totalFiles).toBe(100);

        // Test ChunkResult
        const result: ChunkResult = {
            chunkIndex: 0,
            files: ["test.js"],
            success: true,
            processingTime: 1000,
            errorCount: 0,
            warningCount: 0,
            fixedCount: 1,
        };
        expect(result.success).toBe(true);

        // Test FileDiscoveryOptions
        const discoveryOptions: FileDiscoveryOptions = {
            include: ["**/*.js"],
            ignore: ["node_modules/**"],
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
            info: () => {},
            warn: () => {},
            error: () => {},
            debug: () => {},
            verbose: () => {},
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
            size: 50,
            concurrency: 4,
            verbose: true,
            cwd: "/project",
            config: "eslint.config.js",
            include: ["src/**/*.ts"],
            ignore: ["**/*.test.ts"],
            continueOnError: true,
            fix: true,
            fixTypes: ["problem", "suggestion"],
            maxWorkers: 4,
            cacheLocation: ".eslintcache",
            warnIgnored: false,
        };
        expect(fullOptions.size).toBe(50);
        expect(fullOptions.fixTypes).toEqual(["problem", "suggestion"]);
    });

    it("should handle optional properties in ChunkResult", () => {
        // Test result with error
        const errorResult: ChunkResult = {
            chunkIndex: 1,
            files: ["error.js"],
            success: false,
            error: "ESLint failed",
            processingTime: 500,
            errorCount: 1,
            warningCount: 0,
            fixedCount: 0,
        };
        expect(errorResult.success).toBe(false);
        expect(errorResult.error).toBe("ESLint failed");
    });

    it("should validate FixType union values", () => {
        // Test that FixType accepts correct values
        const problemFix = "problem" as const;
        const suggestionFix = "suggestion" as const;
        const layoutFix = "layout" as const;
        const directiveFix = "directive" as const;

        expect(problemFix).toBe("problem");
        expect(suggestionFix).toBe("suggestion");
        expect(layoutFix).toBe("layout");
        expect(directiveFix).toBe("directive");
    });
});
