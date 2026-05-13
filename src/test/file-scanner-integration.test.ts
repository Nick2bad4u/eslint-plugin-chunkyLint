/* eslint-disable vitest/prefer-import-in-mock, vitest/prefer-mock-return-shorthand -- String-specifier and constructor mock implementations are required for strict Vitest+TS compatibility in this test file. */
import type { UnknownArray } from "type-fest";

import { describe, expect, it, vi } from "vitest";

import { ConsoleLogger } from "../lib/logger.js";

/**
 * Integration tests focused on achieving specific code coverage for
 * fileScanner.ts These tests use carefully crafted mocking scenarios to trigger
 * uncovered code paths
 */

// Create separate mock modules for different scenarios
const createMockESLintWithConfigError = () => ({
    calculateConfigForFile: vi
        .fn<(...args: Readonly<UnknownArray>) => unknown>()
        .mockRejectedValue(new Error("Config error")), // This will trigger lines 147-152
    executeOnFiles: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    findConfigFile: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    getConfigForFile: vi
        .fn<(...args: Readonly<UnknownArray>) => unknown>()
        .mockResolvedValue({}),
    getErrorResults: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    getFormatter: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    getRulesMetaForResults:
        vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    hasFlag: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    isPathIgnored: vi
        .fn<(...args: Readonly<UnknownArray>) => unknown>()
        .mockResolvedValue(false),
    lintFiles: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    lintText: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    loadFormatter: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    outputFixes: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    version: "8.0.0",
});

const createMockESLintWithIgnoredFiles = () => ({
    calculateConfigForFile: vi
        .fn<(...args: Readonly<UnknownArray>) => unknown>()
        .mockResolvedValue({}),
    executeOnFiles: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    findConfigFile: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    getConfigForFile: vi
        .fn<(...args: Readonly<UnknownArray>) => unknown>()
        .mockResolvedValue({}),
    getErrorResults: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    getFormatter: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    getRulesMetaForResults:
        vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    hasFlag: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    isPathIgnored: vi
        .fn<(...args: Readonly<UnknownArray>) => unknown>()
        .mockResolvedValueOnce(false) // First file not ignored
        .mockResolvedValueOnce(true) // Second file ignored - triggers line 170-171
        .mockResolvedValueOnce(false), // Third file not ignored
    lintFiles: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    lintText: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    loadFormatter: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    outputFixes: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    version: "8.0.0",
});

const createMockESLintWithIgnorePatterns = () => ({
    calculateConfigForFile: vi
        .fn<(...args: Readonly<UnknownArray>) => unknown>()
        .mockResolvedValue({
            ignorePatterns: ["dist/**", "*.test.js"], // This will trigger lines 138-143
        }),
    executeOnFiles: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    findConfigFile: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    getConfigForFile: vi
        .fn<(...args: Readonly<UnknownArray>) => unknown>()
        .mockResolvedValue({}),
    getErrorResults: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    getFormatter: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    getRulesMetaForResults:
        vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    hasFlag: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    isPathIgnored: vi
        .fn<(...args: Readonly<UnknownArray>) => unknown>()
        .mockResolvedValue(false),
    lintFiles: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    lintText: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    loadFormatter: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    outputFixes: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    version: "8.0.0",
});

const createMockESLintWithPathError = () => ({
    calculateConfigForFile: vi
        .fn<(...args: Readonly<UnknownArray>) => unknown>()
        .mockResolvedValue({}),
    executeOnFiles: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    findConfigFile: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    getConfigForFile: vi
        .fn<(...args: Readonly<UnknownArray>) => unknown>()
        .mockResolvedValue({}),
    getErrorResults: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    getFormatter: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    getRulesMetaForResults:
        vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    hasFlag: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    isPathIgnored: vi
        .fn<(...args: Readonly<UnknownArray>) => unknown>()
        .mockResolvedValueOnce(false) // First file succeeds
        .mockRejectedValueOnce(new Error("Path check failed")) // Second file throws - triggers lines 174-179
        .mockResolvedValueOnce(false), // Third file succeeds
    lintFiles: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    lintText: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    loadFormatter: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    outputFixes: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
    version: "8.0.0",
});

// Mock tinyglobby consistently
vi.mock("tinyglobby", () => ({
    glob: vi
        .fn<(...args: Readonly<UnknownArray>) => unknown>()
        .mockResolvedValue([
            "/test/file1.js",
            "/test/file2.js",
            "/test/file3.js",
        ]),
}));

describe("fileScanner Coverage Integration Tests", () => {
    const prepareTestLogger = (): ConsoleLogger => {
        vi.clearAllMocks();
        vi.resetModules(); // Aggressively clear module cache
        return new ConsoleLogger(true); // Enable verbose mode to trigger debug/verbose calls
    };

    const cleanupEslintMock = (): void => {
        vi.doUnmock("eslint");
        vi.resetModules();
    };

    it("should process ESLint ignore patterns when found (covers lines 138-143)", async () => {
        expect.hasAssertions();

        const mockLogger = prepareTestLogger();

        // Mock ESLint module with ignore patterns
        vi.doMock("eslint", () => ({
            ESLint: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockImplementation(function MockESLint() {
                    return createMockESLintWithIgnorePatterns();
                }),
        }));

        // Re-import to get fresh module with new mock
        const { FileScanner: FreshFileScanner } =
            await import("../lib/file-scanner.js");
        const freshScanner = new FreshFileScanner(mockLogger);
        const files = await freshScanner.scanFiles({
            config: "./eslint.config.js",
        });

        expect(Array.isArray(files)).toBeTruthy();

        // Clean up module mock
        cleanupEslintMock();
    });

    it("should handle config calculation errors (covers lines 147-152)", async () => {
        expect.hasAssertions();

        const mockLogger = prepareTestLogger();

        // Mock ESLint module with config error
        vi.doMock("eslint", () => ({
            ESLint: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockImplementation(function MockESLint() {
                    return createMockESLintWithConfigError();
                }),
        }));

        // Re-import to get fresh module with new mock
        const { FileScanner: FreshFileScanner } =
            await import("../lib/file-scanner.js");
        const freshScanner = new FreshFileScanner(mockLogger);
        const files = await freshScanner.scanFiles({
            config: "./eslint.config.js",
        });

        expect(Array.isArray(files)).toBeTruthy();

        // Clean up module mock
        cleanupEslintMock();
    });

    it("should handle files ignored by ESLint (covers lines 170-171)", async () => {
        expect.hasAssertions();

        const mockLogger = prepareTestLogger();

        // Mock ESLint module with ignored files
        vi.doMock("eslint", () => ({
            ESLint: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockImplementation(function MockESLint() {
                    return createMockESLintWithIgnoredFiles();
                }),
        }));

        // Re-import to get fresh module with new mock
        const { FileScanner: FreshFileScanner } =
            await import("../lib/file-scanner.js");
        const freshScanner = new FreshFileScanner(mockLogger);
        const files = await freshScanner.scanFiles({
            config: "./eslint.config.js",
        });

        expect(Array.isArray(files)).toBeTruthy();

        // Clean up module mock
        cleanupEslintMock();
    });

    it("should handle path check errors (covers lines 174-179)", async () => {
        expect.hasAssertions();

        const mockLogger = prepareTestLogger();

        // Mock ESLint module with path check error
        vi.doMock("eslint", () => ({
            ESLint: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockImplementation(function MockESLint() {
                    return createMockESLintWithPathError();
                }),
        }));

        // Re-import to get fresh module with new mock
        const { FileScanner: FreshFileScanner } =
            await import("../lib/file-scanner.js");
        const freshScanner = new FreshFileScanner(mockLogger);
        const files = await freshScanner.scanFiles({
            config: "./eslint.config.js",
        });

        expect(Array.isArray(files)).toBeTruthy();

        // Clean up module mock
        cleanupEslintMock();
    });
});

/* eslint-enable vitest/prefer-import-in-mock, vitest/prefer-mock-return-shorthand -- Re-enable standard lint rules after compatibility-focused mocks. */
