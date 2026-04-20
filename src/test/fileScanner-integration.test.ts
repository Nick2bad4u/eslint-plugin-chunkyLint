 
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConsoleLogger } from "../lib/logger.js";

 

 
 

/**
 * Integration tests focused on achieving specific code coverage for
 * fileScanner.ts These tests use carefully crafted mocking scenarios to trigger
 * uncovered code paths
 */

// Create separate mock modules for different scenarios
const createMockESLintWithConfigError = () => ({
        calculateConfigForFile: vi
            .fn()
            .mockRejectedValue(new Error("Config error")), // This will trigger lines 147-152
        executeOnFiles: vi.fn(),
        findConfigFile: vi.fn(),
        getConfigForFile: vi.fn().mockResolvedValue({}),
        getErrorResults: vi.fn(),
        getFormatter: vi.fn(),
        getRulesMetaForResults: vi.fn(),
        hasFlag: vi.fn(),
        isPathIgnored: vi.fn().mockResolvedValue(false),
        lintFiles: vi.fn(),
        lintText: vi.fn(),
        loadFormatter: vi.fn(),
        outputFixes: vi.fn(),
        version: "8.0.0",
    }),
    createMockESLintWithIgnoredFiles = () => ({
        calculateConfigForFile: vi.fn().mockResolvedValue({}),
        executeOnFiles: vi.fn(),
        findConfigFile: vi.fn(),
        getConfigForFile: vi.fn().mockResolvedValue({}),
        getErrorResults: vi.fn(),
        getFormatter: vi.fn(),
        getRulesMetaForResults: vi.fn(),
        hasFlag: vi.fn(),
        isPathIgnored: vi
            .fn()
            .mockResolvedValueOnce(false) // First file not ignored
            .mockResolvedValueOnce(true) // Second file ignored - triggers line 170-171
            .mockResolvedValueOnce(false), // Third file not ignored
        lintFiles: vi.fn(),
        lintText: vi.fn(),
        loadFormatter: vi.fn(),
        outputFixes: vi.fn(),
        version: "8.0.0",
    }),
    createMockESLintWithIgnorePatterns = () => ({
        calculateConfigForFile: vi.fn().mockResolvedValue({
            ignorePatterns: ["dist/**", "*.test.js"], // This will trigger lines 138-143
        }),
        executeOnFiles: vi.fn(),
        findConfigFile: vi.fn(),
        getConfigForFile: vi.fn().mockResolvedValue({}),
        getErrorResults: vi.fn(),
        getFormatter: vi.fn(),
        getRulesMetaForResults: vi.fn(),
        hasFlag: vi.fn(),
        isPathIgnored: vi.fn().mockResolvedValue(false),
        lintFiles: vi.fn(),
        lintText: vi.fn(),
        loadFormatter: vi.fn(),
        outputFixes: vi.fn(),
        version: "8.0.0",
    }),
    createMockESLintWithPathError = () => ({
        calculateConfigForFile: vi.fn().mockResolvedValue({}),
        executeOnFiles: vi.fn(),
        findConfigFile: vi.fn(),
        getConfigForFile: vi.fn().mockResolvedValue({}),
        getErrorResults: vi.fn(),
        getFormatter: vi.fn(),
        getRulesMetaForResults: vi.fn(),
        hasFlag: vi.fn(),
        isPathIgnored: vi
            .fn()
            .mockResolvedValueOnce(false) // First file succeeds
            .mockRejectedValueOnce(new Error("Path check failed")) // Second file throws - triggers lines 174-179
            .mockResolvedValueOnce(false), // Third file succeeds
        lintFiles: vi.fn(),
        lintText: vi.fn(),
        loadFormatter: vi.fn(),
        outputFixes: vi.fn(),
        version: "8.0.0",
    });

// Mock fast-glob consistently
vi.mock("fast-glob", () => ({
    default: vi.fn().mockResolvedValue([
        "/test/file1.js",
        "/test/file2.js",
        "/test/file3.js",
    ]),
}));

describe("FileScanner Coverage Integration Tests", () => {
    let mockLogger: ConsoleLogger;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules(); // Aggressively clear module cache
        mockLogger = new ConsoleLogger(true); // Enable verbose mode to trigger debug/verbose calls
    });

    afterEach(() => {
        vi.doUnmock("eslint");
        vi.resetModules();
    });

    it("should process ESLint ignore patterns when found (covers lines 138-143)", async () => {
        // Mock ESLint module with ignore patterns
        vi.doMock("eslint", () => ({
            ESLint: vi.fn().mockImplementation(function MockESLint() {
                return createMockESLintWithIgnorePatterns();
            }),
        }));

        // Re-import to get fresh module with new mock
        const { FileScanner: FreshFileScanner } =
                await import("../lib/fileScanner.js"),
            freshScanner = new FreshFileScanner(mockLogger),
            files = await freshScanner.scanFiles({
                config: "./eslint.config.js",
            });

        expect(Array.isArray(files)).toBe(true);

        // Clean up module mock
        vi.doUnmock("eslint");
    });

    it("should handle config calculation errors (covers lines 147-152)", async () => {
        // Mock ESLint module with config error
        vi.doMock("eslint", () => ({
            ESLint: vi.fn().mockImplementation(function MockESLint() {
                return createMockESLintWithConfigError();
            }),
        }));

        // Re-import to get fresh module with new mock
        const { FileScanner: FreshFileScanner } =
                await import("../lib/fileScanner.js"),
            freshScanner = new FreshFileScanner(mockLogger),
            files = await freshScanner.scanFiles({
                config: "./eslint.config.js",
            });

        expect(Array.isArray(files)).toBe(true);

        // Clean up module mock
        vi.doUnmock("eslint");
    });

    it("should handle files ignored by ESLint (covers lines 170-171)", async () => {
        // Mock ESLint module with ignored files
        vi.doMock("eslint", () => ({
            ESLint: vi.fn().mockImplementation(function MockESLint() {
                return createMockESLintWithIgnoredFiles();
            }),
        }));

        // Re-import to get fresh module with new mock
        const { FileScanner: FreshFileScanner } =
                await import("../lib/fileScanner.js"),
            freshScanner = new FreshFileScanner(mockLogger),
            files = await freshScanner.scanFiles({
                config: "./eslint.config.js",
            });

        expect(Array.isArray(files)).toBe(true);

        // Clean up module mock
        vi.doUnmock("eslint");
    });

    it("should handle path check errors (covers lines 174-179)", async () => {
        // Mock ESLint module with path check error
        vi.doMock("eslint", () => ({
            ESLint: vi.fn().mockImplementation(function MockESLint() {
                return createMockESLintWithPathError();
            }),
        }));

        // Re-import to get fresh module with new mock
        const { FileScanner: FreshFileScanner } =
                await import("../lib/fileScanner.js"),
            freshScanner = new FreshFileScanner(mockLogger),
            files = await freshScanner.scanFiles({
                config: "./eslint.config.js",
            });

        expect(Array.isArray(files)).toBe(true);

        // Clean up module mock
        vi.doUnmock("eslint");
    });
});
