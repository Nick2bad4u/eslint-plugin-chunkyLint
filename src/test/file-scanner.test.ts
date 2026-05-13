/* eslint-disable vitest/prefer-import-in-mock, vitest/prefer-mock-return-shorthand -- String-specifier and constructor mock implementations are required for strict Vitest+TS compatibility in this test file. */
import type { GlobOptions } from "tinyglobby";
import type { Except, UnknownArray } from "type-fest";

import { describe, expect, it, vi } from "vitest";

import { FileScanner } from "../lib/file-scanner.js";
import { ConsoleLogger } from "../lib/logger.js";

// Mock tinyglobby and eslint at the module level
vi.mock("tinyglobby", () => ({
    glob: vi
        .fn<
            (
                patterns: readonly string[] | string,
                options?: Readonly<Except<GlobOptions, "patterns">>
            ) => Promise<string[]>
        >()
        .mockResolvedValue([
            "/test/file1.js",
            "/test/file2.js",
            "/test/file3.js",
        ]),
}));

vi.mock("eslint", () => ({
    ESLint: vi
        .fn<(...args: Readonly<UnknownArray>) => unknown>()
        .mockImplementation(function MockESLint() {
            return {
                calculateConfigForFile:
                    vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
                executeOnFiles:
                    vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
                getConfigForFile: vi
                    .fn<(...args: Readonly<UnknownArray>) => unknown>()
                    .mockResolvedValue({}),
                getErrorResults:
                    vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
                getFormatter:
                    vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
                getRulesMetaForResults:
                    vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
                hasFlag: vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
                isPathIgnored: vi
                    .fn<(...args: Readonly<UnknownArray>) => unknown>()
                    .mockResolvedValue(false),
                lintFiles:
                    vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
                outputFixes:
                    vi.fn<(...args: Readonly<UnknownArray>) => unknown>(),
                version: "8.0.0",
            };
        }),
}));

describe(FileScanner, () => {
    let mockLogger: ConsoleLogger = new ConsoleLogger(false);
    let fileScanner: FileScanner = new FileScanner(mockLogger);

    const resetScanner = (): void => {
        mockLogger = new ConsoleLogger(false);
        fileScanner = new FileScanner(mockLogger);
    };

    describe("chunkFiles", () => {
        it("should split files into chunks of specified size", () => {
            expect.hasAssertions();

            resetScanner();

            const files = [
                "file1.js",
                "file2.js",
                "file3.js",
                "file4.js",
                "file5.js",
            ];
            const chunks = fileScanner.chunkFiles(files, 2);

            expect(chunks).toStrictEqual([
                ["file1.js", "file2.js"],
                ["file3.js", "file4.js"],
                ["file5.js"],
            ]);
        });

        it("should handle exact division", () => {
            expect.hasAssertions();

            resetScanner();

            const files = [
                "file1.js",
                "file2.js",
                "file3.js",
                "file4.js",
            ];
            const chunks = fileScanner.chunkFiles(files, 2);

            expect(chunks).toStrictEqual([
                ["file1.js", "file2.js"],
                ["file3.js", "file4.js"],
            ]);
        });

        it("should handle single file per chunk", () => {
            expect.hasAssertions();

            resetScanner();

            const files = [
                "file1.js",
                "file2.js",
                "file3.js",
            ];
            const chunks = fileScanner.chunkFiles(files, 1);

            expect(chunks).toStrictEqual([
                ["file1.js"],
                ["file2.js"],
                ["file3.js"],
            ]);
        });

        it("should handle chunk size larger than file count", () => {
            expect.hasAssertions();

            resetScanner();

            const files = ["file1.js", "file2.js"];
            const chunks = fileScanner.chunkFiles(files, 10);

            expect(chunks).toStrictEqual([["file1.js", "file2.js"]]);
        });

        it("should handle empty file list", () => {
            expect.hasAssertions();

            resetScanner();

            const files: string[] = [];
            const chunks = fileScanner.chunkFiles(files, 5);

            expect(chunks).toStrictEqual([]);
        });

        it("should throw error for invalid chunk size", () => {
            expect.hasAssertions();

            resetScanner();

            const files = ["file1.js"];

            expect(() => fileScanner.chunkFiles(files, 0)).toThrow(
                "Chunk size must be greater than 0"
            );
            expect(() => fileScanner.chunkFiles(files, -1)).toThrow(
                "Chunk size must be greater than 0"
            );
        });
    });

    describe("scanFiles", () => {
        it("should handle missing patterns gracefully", async () => {
            expect.hasAssertions();

            resetScanner();

            const files = await fileScanner.scanFiles({});

            expect(Array.isArray(files)).toBeTruthy();
        });

        it("should handle custom working directory", async () => {
            expect.hasAssertions();

            resetScanner();

            const customCwd = "/custom/path",
                files = await fileScanner.scanFiles({
                    cwd: customCwd,
                });

            expect(Array.isArray(files)).toBeTruthy();
        });

        it("should follow symlinks when specified", async () => {
            expect.hasAssertions();

            resetScanner();

            const files = await fileScanner.scanFiles({
                followSymlinks: true,
            });

            expect(Array.isArray(files)).toBeTruthy();
        });

        it("should not follow symlinks when disabled", async () => {
            expect.hasAssertions();

            resetScanner();

            const files = await fileScanner.scanFiles({
                followSymlinks: false,
            });

            expect(Array.isArray(files)).toBeTruthy();
        });

        it("should handle basic file scanning", async () => {
            expect.hasAssertions();

            resetScanner();

            const files = await fileScanner.scanFiles();

            expect(Array.isArray(files)).toBeTruthy();
        });

        it("should handle custom include patterns", async () => {
            expect.hasAssertions();

            resetScanner();

            const files = await fileScanner.scanFiles({
                include: ["**/*.ts", "**/*.js"],
            });

            expect(Array.isArray(files)).toBeTruthy();
        });

        it("should handle custom ignore patterns", async () => {
            expect.hasAssertions();

            resetScanner();

            const files = await fileScanner.scanFiles({
                ignore: ["dist/**", "node_modules/**"],
            });

            expect(Array.isArray(files)).toBeTruthy();
        });

        it("should handle config file path", async () => {
            expect.hasAssertions();

            resetScanner();

            const files = await fileScanner.scanFiles({
                config: "./eslint.config.js",
            });

            expect(Array.isArray(files)).toBeTruthy();
        });

        it("should handle file discovery errors by throwing", async () => {
            expect.hasAssertions();

            resetScanner();

            // Create a new mock that rejects
            const // Replace the original mock temporarily
                { glob } = await import("tinyglobby"),
                mockFg = vi
                    .fn<typeof glob>()
                    .mockRejectedValue(new Error("File system error")),
                originalMock = vi.mocked(glob);
            vi.mocked(glob).mockImplementation(mockFg);

            await expect(fileScanner.scanFiles()).rejects.toThrow(
                "File discovery failed: File system error"
            );

            // Restore original mock
            vi.mocked(glob).mockImplementation(originalMock);
        });

        it("should handle non-Error objects in file discovery errors", async () => {
            expect.hasAssertions();

            resetScanner();

            // Test the error instanceof Error ternary on line 112
            const // Replace the original mock temporarily
                { glob } = await import("tinyglobby"),
                mockFg = vi
                    .fn<typeof glob>()
                    .mockRejectedValue("String error, not Error object"),
                originalMock = vi.mocked(glob);
            vi.mocked(glob).mockImplementation(mockFg);

            await expect(fileScanner.scanFiles()).rejects.toThrow(
                "File discovery failed: String error, not Error object"
            );

            // Restore original mock
            vi.mocked(glob).mockImplementation(originalMock);
        });
    });
});

/* eslint-enable vitest/prefer-import-in-mock, vitest/prefer-mock-return-shorthand -- Re-enable standard lint rules after compatibility-focused mocks. */
