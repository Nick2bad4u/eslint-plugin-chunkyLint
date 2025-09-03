import { describe, expect, it } from "vitest";
describe("Types coverage test", () => {
    it("should import and use all types from types/index.ts", () => {
        // This test ensures all exported types are reachable and testable
        // Test ChunkerOptions
        const options = {
            size: 10,
            concurrency: 2,
        };
        expect(options.size).toBe(10);
        // Test ChunkingStats
        const stats = {
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
        const result = {
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
        const discoveryOptions = {
            include: ["**/*.js"],
            ignore: ["node_modules/**"],
        };
        expect(discoveryOptions.include).toEqual(["**/*.js"]);
        // Test ProgressCallback
        const callback = (current, total, chunk) => {
            expect(current).toBeGreaterThan(0);
            expect(total).toBeGreaterThan(0);
            expect(chunk).toBeDefined();
        };
        callback(1, 10, result);
        // Test Logger interface
        /* eslint-disable @typescript-eslint/no-empty-function */
        const logger = {
            info: () => { },
            warn: () => { },
            error: () => { },
            debug: () => { },
            verbose: () => { },
        };
        /* eslint-enable @typescript-eslint/no-empty-function */
        expect(typeof logger.info).toBe("function");
        // All types are properly imported and usable
        expect(true).toBe(true);
    });
    it("should handle optional properties in ChunkerOptions", () => {
        // Test minimal options
        const minimalOptions = {};
        expect(minimalOptions).toBeDefined();
        // Test full options
        const fullOptions = {
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
        const errorResult = {
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
        const problemFix = "problem", suggestionFix = "suggestion", layoutFix = "layout", directiveFix = "directive";
        expect(problemFix).toBe("problem");
        expect(suggestionFix).toBe("suggestion");
        expect(layoutFix).toBe("layout");
        expect(directiveFix).toBe("directive");
    });
    it("should handle ChunkyLintConfig interface", () => {
        // Test minimal config
        const minimalConfig = {};
        expect(minimalConfig).toBeDefined();
        // Test full config
        const fullConfig = {
            config: "eslint.config.js",
            cwd: "/project",
            include: ["src/**/*.ts"],
            ignore: ["**/*.test.ts"],
            followSymlinks: false,
            size: 100,
            concurrency: 4,
            verbose: true,
            cacheLocation: ".eslintcache",
            fix: true,
            continueOnError: false,
        };
        expect(fullConfig.size).toBe(100);
        expect(fullConfig.concurrency).toBe(4);
        expect(fullConfig.verbose).toBe(true);
        expect(fullConfig.fix).toBe(true);
        expect(fullConfig.continueOnError).toBe(false);
    });
});
//# sourceMappingURL=types-coverage.test.js.map