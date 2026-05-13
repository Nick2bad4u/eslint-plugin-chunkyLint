/* eslint-disable vitest/prefer-import-in-mock, vitest/prefer-mock-return-shorthand -- String-specifier and constructor mock implementations are required for strict Vitest+TS compatibility in this test file. */
import type { UnknownArray, UnknownRecord } from "type-fest";

import { arrayFirst } from "ts-extras";
import { describe, expect, it, vi } from "vitest";

type Colorizer = (text: string) => string;
type UnknownFn = (...args: Readonly<UnknownArray>) => unknown;

// Mock yoctocolors to prevent console output issues
vi.mock("yoctocolors", () => ({
    default: {
        blue: vi.fn<Colorizer>((text: string) => text),
        gray: vi.fn<Colorizer>((text: string) => text),
        green: vi.fn<Colorizer>((text: string) => text),
        red: vi.fn<Colorizer>((text: string) => text),
    },
}));

// Mock commander before importing CLI
const mockProgram = {
    action: vi.fn<UnknownFn>().mockReturnThis(),
    description: vi.fn<UnknownFn>().mockReturnThis(),
    name: vi.fn<UnknownFn>().mockReturnThis(),
    option: vi.fn<UnknownFn>().mockReturnThis(),
    parse: vi.fn<UnknownFn>().mockReturnThis(),
    parseAsync: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    version: vi.fn<UnknownFn>().mockReturnThis(),
};

vi.mock("commander", () => ({
    Command: vi
        .fn<() => UnknownRecord>()
        .mockImplementation(function MockCommand() {
            return mockProgram;
        }),
}));

// Mock ESLintChunker
const mockChunker = {
    run: vi
        .fn<
            () => Promise<{
                failedChunks: number;
                filesFixed: number;
                filesWithErrors: number;
                filesWithWarnings: number;
                totalChunks: number;
                totalFiles: number;
                totalTime: number;
            }>
        >()
        .mockResolvedValue({
            failedChunks: 0,
            filesFixed: 0,
            filesWithErrors: 1,
            filesWithWarnings: 2,
            totalChunks: 2,
            totalFiles: 10,
            totalTime: 1000,
        }),
};

vi.mock("../lib/chunker.js", () => ({
    ESLintChunker: vi
        .fn<() => UnknownRecord>()
        .mockImplementation(function MockESLintChunker() {
            return mockChunker;
        }),
}));

const resetCliTestState = (): void => {
    vi.clearAllMocks();
    vi.resetModules();
    mockProgram.name.mockReturnThis();
    mockProgram.description.mockReturnThis();
    mockProgram.version.mockReturnThis();
    mockProgram.option.mockReturnThis();
    mockProgram.action.mockReturnThis();
    mockProgram.parse.mockReturnThis();
    mockProgram.parseAsync.mockResolvedValue(undefined);
};

describe("cli binary", () => {
    it("should set up CLI program correctly", async () => {
        expect.hasAssertions();

        resetCliTestState();

        // Import and execute the CLI module
        await import("../bin/eslint-chunker.js");

        expect(mockProgram.name).toHaveBeenCalledWith("eslint-chunker");
        expect(mockProgram.description).toHaveBeenCalledWith(
            expect.any(String)
        );
        expect(mockProgram.version).toHaveBeenCalledWith(expect.any(String));
        expect(mockProgram.option).toHaveBeenCalledTimes(20); // All CLI options including quiet/verbose, chunk-log toggles, banner toggle, and --config-file
        expect(mockProgram.action).toHaveBeenCalledWith(expect.any(Function));
        expect(mockProgram.parseAsync).toHaveBeenCalledWith();
    });

    it("should handle CLI option parsing", async () => {
        expect.hasAssertions();

        resetCliTestState();

        await import("../bin/eslint-chunker.js");

        // Verify all expected options are defined

        const optionCalls: readonly Readonly<UnknownArray>[] =
                mockProgram.option.mock.calls,
            options = optionCalls
                .map((call): unknown => arrayFirst(call))
                .filter((value): value is string => typeof value === "string");

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
        expect.hasAssertions();

        resetCliTestState();

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

/* eslint-enable vitest/prefer-import-in-mock, vitest/prefer-mock-return-shorthand -- Re-enable standard lint rules after compatibility-focused mocks. */
