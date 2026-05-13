/* eslint-disable vitest/prefer-import-in-mock, vitest/prefer-mock-return-shorthand -- String-specifier and constructor mock implementations are required for strict Vitest+TS compatibility in this test file. */
import type { UnknownArray } from "type-fest";

import { describe, expect, it, vi } from "vitest";

import { ConsoleLogger } from "../lib/logger.js";

// Mock tinyglobby at the top level (the actual module used by FileScanner)
vi.mock("tinyglobby", () => ({
    glob: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
}));

describe("fileScanner Coverage Tests - Targeting Specific Uncovered Lines", () => {
    const createPreparedLogger = async (): Promise<ConsoleLogger> => {
        vi.clearAllMocks();
        vi.resetModules();
        const logger = new ConsoleLogger(true); // Enable verbose/debug logging

        // Mock tinyglobby to return test files
        const { glob } = await import("tinyglobby");
        vi.mocked(glob).mockResolvedValue([
            "/test/file1.js",
            "/test/file2.js",
            "/test/file3.js",
        ]);
        return logger;
    };

    const cleanupDynamicEslintMock = (): void => {
        vi.doUnmock("eslint");
        vi.resetModules();
    };

    it("should trigger lines 147-152: debug logging when calculateConfigForFile fails", async () => {
        expect.hasAssertions();

        const mockLogger = await createPreparedLogger();

        // Create a mock ESLint that throws an error during calculateConfigForFile
        const mockESLint = {
            calculateConfigForFile: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockRejectedValue(new Error("Config calculation failed")),
            executeOnFiles:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            findConfigFile:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            getConfigForFile: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockResolvedValue({}),
            getErrorResults:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            getFormatter: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            getRulesMetaForResults:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            hasFlag: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            isPathIgnored: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockResolvedValue(false),
            lintFiles: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            lintText: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            loadFormatter:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            outputFixes: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            version: "8.0.0",
        };

        // Mock the ESLint constructor
        vi.doMock("eslint", () => ({
            ESLint: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockImplementation(function MockESLint() {
                    return mockESLint;
                }),
        }));

        // Import FileScanner after mocking
        const { FileScanner } = await import("../lib/file-scanner.js");
        const scanner = new FileScanner(mockLogger);
        // This should trigger the catch block in getESLintIgnorePatterns and log the debug message (lines 147-152)
        const result = await scanner.scanFiles({
            config: "./eslint.config.js",
        });

        expect(Array.isArray(result)).toBeTruthy();
        expect(mockESLint.calculateConfigForFile).toHaveBeenCalledWith(
            expect.stringContaining("package.json")
        );

        cleanupDynamicEslintMock();
    });

    it("should trigger lines 170-171: verbose logging when file is ignored by ESLint", async () => {
        expect.hasAssertions();

        const mockLogger = await createPreparedLogger();

        // Create a mock ESLint that reports some files as ignored
        const mockESLint = {
            calculateConfigForFile: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockResolvedValue({}),
            executeOnFiles:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            findConfigFile:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            getConfigForFile: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockResolvedValue({}),
            getErrorResults:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
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
            loadFormatter:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            outputFixes: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            version: "8.0.0",
        };

        // Mock the ESLint constructor
        vi.doMock("eslint", () => ({
            ESLint: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockImplementation(function MockESLint() {
                    return mockESLint;
                }),
        }));

        // Import FileScanner after mocking
        const { FileScanner } = await import("../lib/file-scanner.js");
        const scanner = new FileScanner(mockLogger);
        // This should trigger the verbose logging when a file is ignored (lines 170-171)
        const result = await scanner.scanFiles({
            config: "./eslint.config.js",
        });

        expect(Array.isArray(result)).toBeTruthy();
        expect(mockESLint.isPathIgnored).toHaveBeenCalledTimes(3);

        cleanupDynamicEslintMock();
    });

    it("should trigger lines 174-179: debug logging when isPathIgnored fails", async () => {
        expect.hasAssertions();

        const mockLogger = await createPreparedLogger();

        // Create a mock ESLint that throws an error during isPathIgnored
        const mockESLint = {
            calculateConfigForFile: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockResolvedValue({}),
            executeOnFiles:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            findConfigFile:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            getConfigForFile: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockResolvedValue({}),
            getErrorResults:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
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
            loadFormatter:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            outputFixes: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            version: "8.0.0",
        };

        // Mock the ESLint constructor
        vi.doMock("eslint", () => ({
            ESLint: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockImplementation(function MockESLint() {
                    return mockESLint;
                }),
        }));

        // Import FileScanner after mocking
        const { FileScanner } = await import("../lib/file-scanner.js");
        const scanner = new FileScanner(mockLogger);
        // This should trigger the debug logging when isPathIgnored fails (lines 174-179)
        const result = await scanner.scanFiles({
            config: "./eslint.config.js",
        });

        expect(Array.isArray(result)).toBeTruthy();
        expect(mockESLint.isPathIgnored).toHaveBeenCalledTimes(3);

        cleanupDynamicEslintMock();
    });

    it("should trigger lines 138-143: processing ignore patterns when found", async () => {
        expect.hasAssertions();

        const mockLogger = await createPreparedLogger();

        // Create a mock ESLint that returns ignore patterns in config
        const mockESLint = {
            calculateConfigForFile: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockResolvedValue({
                    ignorePatterns: ["dist/**", "*.test.js"], // This will trigger lines 138-143
                }),
            executeOnFiles:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            findConfigFile:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            getConfigForFile: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockResolvedValue({}),
            getErrorResults:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            getFormatter: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            getRulesMetaForResults:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            hasFlag: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            isPathIgnored: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockResolvedValue(false),
            lintFiles: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            lintText: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            loadFormatter:
                vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            outputFixes: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
            version: "8.0.0",
        };

        // Mock the ESLint constructor
        vi.doMock("eslint", () => ({
            ESLint: vi
                .fn<(...args: Readonly<UnknownArray>) => unknown>()
                .mockImplementation(function MockESLint() {
                    return mockESLint;
                }),
        }));

        // Import FileScanner after mocking
        const { FileScanner } = await import("../lib/file-scanner.js");
        const scanner = new FileScanner(mockLogger);
        // This should trigger processing of ignore patterns (lines 138-143)
        const result = await scanner.scanFiles({
            config: "./eslint.config.js",
        });

        expect(Array.isArray(result)).toBeTruthy();
        expect(mockESLint.calculateConfigForFile).toHaveBeenCalledWith(
            expect.stringContaining("package.json")
        );

        cleanupDynamicEslintMock();
    });
});

/* eslint-enable vitest/prefer-import-in-mock, vitest/prefer-mock-return-shorthand -- Re-enable standard lint rules after compatibility-focused mocks. */
