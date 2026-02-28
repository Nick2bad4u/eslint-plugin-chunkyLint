import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* eslint-disable prefer-arrow-callback -- Vitest constructor mocks require function/class implementations */

// Mock chalk to prevent console output issues
vi.mock("chalk", () => ({
    default: {
        blue: vi.fn((text: string) => text),
        green: vi.fn((text: string) => text),
        red: vi.fn((text: string) => text),
        gray: vi.fn((text: string) => text),
    },
}));

// Mock commander before importing CLI
const mockProgram = {
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    option: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis(),
    parse: vi.fn().mockReturnThis(),
};

vi.mock("commander", () => ({
    Command: vi.fn().mockImplementation(function MockCommand() {
        return mockProgram;
    }),
}));

// Mock ESLintChunker
const mockChunker = {
    run: vi.fn().mockResolvedValue({
        totalFiles: 10,
        totalChunks: 2,
        totalTime: 1000,
        filesWithErrors: 1,
        filesWithWarnings: 2,
        filesFixed: 0,
        failedChunks: 0,
    }),
};

vi.mock("../lib/chunker.js", () => ({
    ESLintChunker: vi.fn().mockImplementation(function MockESLintChunker() {
        return mockChunker;
    }),
}));

describe("CLI binary", () => {
    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Reset the mock functions to return this for chaining
        mockProgram.name.mockReturnThis();
        mockProgram.description.mockReturnThis();
        mockProgram.version.mockReturnThis();
        mockProgram.option.mockReturnThis();
        mockProgram.action.mockReturnThis();
        mockProgram.parse.mockReturnThis();
    });

    afterEach(() => {
        // Clean up any module imports
        vi.resetModules();
    });

    it("should set up CLI program correctly", async () => {
        // Import and execute the CLI module
        await import("../bin/eslint-chunker.js");

        expect(mockProgram.name).toHaveBeenCalledWith("eslint-chunker");
        expect(mockProgram.description).toHaveBeenCalled();
        expect(mockProgram.version).toHaveBeenCalled();
        expect(mockProgram.option).toHaveBeenCalledTimes(20); // All CLI options including quiet/verbose, chunk-log toggles, banner toggle, and --config-file
        expect(mockProgram.action).toHaveBeenCalled();
        expect(mockProgram.parse).toHaveBeenCalled();
    });

    it("should handle CLI option parsing", async () => {
        await import("../bin/eslint-chunker.js");

        // Verify all expected options are defined
        /* eslint-disable @typescript-eslint/no-unsafe-return */
        const optionCalls = mockProgram.option.mock.calls,
            options = optionCalls.map((call) => call[0]);
        /* eslint-enable @typescript-eslint/no-unsafe-return */

        expect(options).toContain("-c, --config <path>");
        expect(options).toContain("-s, --size <number>");
        expect(options).toContain("--cache-location <path>");
        expect(options).toContain("--max-workers <n>");
        expect(options).toContain("--continue-on-error");
        expect(options).toContain("--fix");
        expect(options).toContain("--fix-types <types>");
        expect(options).toContain("--no-warn-ignored");
        expect(options).toContain("--include <patterns>");
        expect(options).toContain("--ignore <patterns>");
        expect(options).toContain("--cwd <path>");
        expect(options).toContain("-q, --quiet");
        expect(options).toContain("--no-quiet");
        expect(options).toContain("--chunk-logs");
        expect(options).toContain("--no-chunk-logs");
        expect(options).toContain("--no-banner");
        expect(options).toContain("-v, --verbose");
        expect(options).toContain("--no-verbose");
        expect(options).toContain("--concurrency <n>");
        expect(optionCalls).toHaveLength(20); // Updated to match actual count including quiet/verbose, chunk-log toggles, banner toggle, and --config-file
    });

    it("should process fix types correctly", async () => {
        await import("../bin/eslint-chunker.js");

        // Test the parseFixTypes function indirectly by checking if it's used
        // The actual function is internal but we can verify the option setup
        expect(mockProgram.option).toHaveBeenCalledWith(
            "--fix-types <types>",
            expect.stringContaining("Types of fixes to apply"),
            expect.any(Function)
        );
    });
});
