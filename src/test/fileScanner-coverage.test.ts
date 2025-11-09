import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConsoleLogger } from "../lib/logger.js";

/* eslint-disable init-declarations */

// Mock fast-glob at the top level (the actual module used by FileScanner)
vi.mock("fast-glob", () => ({
    default: vi.fn(),
}));

describe("FileScanner Coverage Tests - Targeting Specific Uncovered Lines", () => {
    let mockLogger: ConsoleLogger;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();
        mockLogger = new ConsoleLogger(true); // Enable verbose/debug logging

        // Mock fast-glob to return test files
        const fg = await import("fast-glob");
        vi.mocked(fg.default).mockResolvedValue([
            "/test/file1.js",
            "/test/file2.js",
            "/test/file3.js",
        ]);
    });

    afterEach(() => {
        vi.doUnmock("eslint");
        vi.resetModules();
    });

    it("should trigger lines 147-152: debug logging when calculateConfigForFile fails", async () => {
        // Create a mock ESLint that throws an error during calculateConfigForFile
        const mockESLint = {
            calculateConfigForFile: vi
                .fn()
                .mockRejectedValue(new Error("Config calculation failed")),
            isPathIgnored: vi.fn().mockResolvedValue(false),
            lintFiles: vi.fn(),
            lintText: vi.fn(),
            findConfigFile: vi.fn(),
            loadFormatter: vi.fn(),
            getConfigForFile: vi.fn().mockResolvedValue({}),
            executeOnFiles: vi.fn(),
            outputFixes: vi.fn(),
            getFormatter: vi.fn(),
            getErrorResults: vi.fn(),
            getRulesMetaForResults: vi.fn(),
            hasFlag: vi.fn(),
            version: "8.0.0",
        };

        // Mock the ESLint constructor
        vi.doMock("eslint", () => ({
            ESLint: vi.fn().mockImplementation(() => mockESLint),
        }));

        // Import FileScanner after mocking
        const { FileScanner } = await import("../lib/fileScanner.js"),
            scanner = new FileScanner(mockLogger),
            // This should trigger the catch block in getESLintIgnorePatterns and log the debug message (lines 147-152)
            result = await scanner.scanFiles({
                config: "./eslint.config.js",
            });

        expect(Array.isArray(result)).toBe(true);
        expect(mockESLint.calculateConfigForFile).toHaveBeenCalled();

        vi.doUnmock("eslint");
    });

    it("should trigger lines 170-171: verbose logging when file is ignored by ESLint", async () => {
        // Create a mock ESLint that reports some files as ignored
        const mockESLint = {
            calculateConfigForFile: vi.fn().mockResolvedValue({}),
            isPathIgnored: vi
                .fn()
                .mockResolvedValueOnce(false) // First file not ignored
                .mockResolvedValueOnce(true) // Second file ignored - triggers line 170-171
                .mockResolvedValueOnce(false), // Third file not ignored
            lintFiles: vi.fn(),
            lintText: vi.fn(),
            findConfigFile: vi.fn(),
            loadFormatter: vi.fn(),
            getConfigForFile: vi.fn().mockResolvedValue({}),
            executeOnFiles: vi.fn(),
            outputFixes: vi.fn(),
            getFormatter: vi.fn(),
            getErrorResults: vi.fn(),
            getRulesMetaForResults: vi.fn(),
            hasFlag: vi.fn(),
            version: "8.0.0",
        };

        // Mock the ESLint constructor
        vi.doMock("eslint", () => ({
            ESLint: vi.fn().mockImplementation(() => mockESLint),
        }));

        // Import FileScanner after mocking
        const { FileScanner } = await import("../lib/fileScanner.js"),
            scanner = new FileScanner(mockLogger),
            // This should trigger the verbose logging when a file is ignored (lines 170-171)
            result = await scanner.scanFiles({
                config: "./eslint.config.js",
            });

        expect(Array.isArray(result)).toBe(true);
        expect(mockESLint.isPathIgnored).toHaveBeenCalledTimes(3);

        vi.doUnmock("eslint");
    });

    it("should trigger lines 174-179: debug logging when isPathIgnored fails", async () => {
        // Create a mock ESLint that throws an error during isPathIgnored
        const mockESLint = {
            calculateConfigForFile: vi.fn().mockResolvedValue({}),
            isPathIgnored: vi
                .fn()
                .mockResolvedValueOnce(false) // First file succeeds
                .mockRejectedValueOnce(new Error("Path check failed")) // Second file throws - triggers lines 174-179
                .mockResolvedValueOnce(false), // Third file succeeds
            lintFiles: vi.fn(),
            lintText: vi.fn(),
            findConfigFile: vi.fn(),
            loadFormatter: vi.fn(),
            getConfigForFile: vi.fn().mockResolvedValue({}),
            executeOnFiles: vi.fn(),
            outputFixes: vi.fn(),
            getFormatter: vi.fn(),
            getErrorResults: vi.fn(),
            getRulesMetaForResults: vi.fn(),
            hasFlag: vi.fn(),
            version: "8.0.0",
        };

        // Mock the ESLint constructor
        vi.doMock("eslint", () => ({
            ESLint: vi.fn().mockImplementation(() => mockESLint),
        }));

        // Import FileScanner after mocking
        const { FileScanner } = await import("../lib/fileScanner.js"),
            scanner = new FileScanner(mockLogger),
            // This should trigger the debug logging when isPathIgnored fails (lines 174-179)
            result = await scanner.scanFiles({
                config: "./eslint.config.js",
            });

        expect(Array.isArray(result)).toBe(true);
        expect(mockESLint.isPathIgnored).toHaveBeenCalledTimes(3);

        vi.doUnmock("eslint");
    });

    it("should trigger lines 138-143: processing ignore patterns when found", async () => {
        // Create a mock ESLint that returns ignore patterns in config
        const mockESLint = {
            calculateConfigForFile: vi.fn().mockResolvedValue({
                ignorePatterns: ["dist/**", "*.test.js"], // This will trigger lines 138-143
            }),
            isPathIgnored: vi.fn().mockResolvedValue(false),
            lintFiles: vi.fn(),
            lintText: vi.fn(),
            findConfigFile: vi.fn(),
            loadFormatter: vi.fn(),
            getConfigForFile: vi.fn().mockResolvedValue({}),
            executeOnFiles: vi.fn(),
            outputFixes: vi.fn(),
            getFormatter: vi.fn(),
            getErrorResults: vi.fn(),
            getRulesMetaForResults: vi.fn(),
            hasFlag: vi.fn(),
            version: "8.0.0",
        };

        // Mock the ESLint constructor
        vi.doMock("eslint", () => ({
            ESLint: vi.fn().mockImplementation(() => mockESLint),
        }));

        // Import FileScanner after mocking
        const { FileScanner } = await import("../lib/fileScanner.js"),
            scanner = new FileScanner(mockLogger),
            // This should trigger processing of ignore patterns (lines 138-143)
            result = await scanner.scanFiles({
                config: "./eslint.config.js",
            });

        expect(Array.isArray(result)).toBe(true);
        expect(mockESLint.calculateConfigForFile).toHaveBeenCalled();

        vi.doUnmock("eslint");
    });
});
