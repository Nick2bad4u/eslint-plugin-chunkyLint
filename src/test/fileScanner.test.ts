import { describe, it, expect, beforeEach, vi } from "vitest";
import { FileScanner } from "../lib/fileScanner.js";
import { ConsoleLogger } from "../lib/logger.js";

// Mock fast-glob and eslint at the module level
vi.mock("fast-glob", () => ({
    default: vi
        .fn()
        .mockResolvedValue([
            "/test/file1.js",
            "/test/file2.js",
            "/test/file3.js",
        ]),
}));

vi.mock("eslint", () => ({
    ESLint: vi.fn().mockImplementation(() => ({
        getConfigForFile: vi.fn().mockResolvedValue({}),
        isPathIgnored: vi.fn().mockResolvedValue(false),
        lintFiles: vi.fn(),
        calculateConfigForFile: vi.fn(),
        executeOnFiles: vi.fn(),
        outputFixes: vi.fn(),
        getFormatter: vi.fn(),
        getErrorResults: vi.fn(),
        getRulesMetaForResults: vi.fn(),
        hasFlag: vi.fn(),
        version: "8.0.0",
    })),
}));

describe("FileScanner", () => {
    let fileScanner: FileScanner;
    let mockLogger: ConsoleLogger;

    beforeEach(() => {
        mockLogger = new ConsoleLogger(false);
        fileScanner = new FileScanner(mockLogger);
    });

    describe("chunkFiles", () => {
        it("should split files into chunks of specified size", () => {
            const files = [
                "file1.js",
                "file2.js",
                "file3.js",
                "file4.js",
                "file5.js",
            ];
            const chunks = fileScanner.chunkFiles(files, 2);

            expect(chunks).toEqual([
                ["file1.js", "file2.js"],
                ["file3.js", "file4.js"],
                ["file5.js"],
            ]);
        });

        it("should handle exact division", () => {
            const files = ["file1.js", "file2.js", "file3.js", "file4.js"];
            const chunks = fileScanner.chunkFiles(files, 2);

            expect(chunks).toEqual([
                ["file1.js", "file2.js"],
                ["file3.js", "file4.js"],
            ]);
        });

        it("should handle single file per chunk", () => {
            const files = ["file1.js", "file2.js", "file3.js"];
            const chunks = fileScanner.chunkFiles(files, 1);

            expect(chunks).toEqual([["file1.js"], ["file2.js"], ["file3.js"]]);
        });

        it("should handle chunk size larger than file count", () => {
            const files = ["file1.js", "file2.js"];
            const chunks = fileScanner.chunkFiles(files, 10);

            expect(chunks).toEqual([["file1.js", "file2.js"]]);
        });

        it("should handle empty file list", () => {
            const files: string[] = [];
            const chunks = fileScanner.chunkFiles(files, 5);

            expect(chunks).toEqual([]);
        });

        it("should throw error for invalid chunk size", () => {
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
        beforeEach(() => {
            // Reset the file scanner for each test
            fileScanner = new FileScanner(mockLogger);
        });

        it("should handle missing patterns gracefully", async () => {
            const files = await fileScanner.scanFiles({
                include: undefined,
                ignore: undefined,
            });
            expect(Array.isArray(files)).toBe(true);
        });

        it("should handle custom working directory", async () => {
            const customCwd = "/custom/path";
            const files = await fileScanner.scanFiles({
                cwd: customCwd,
            });
            expect(Array.isArray(files)).toBe(true);
        });

        it("should follow symlinks when specified", async () => {
            const files = await fileScanner.scanFiles({
                followSymlinks: true,
            });
            expect(Array.isArray(files)).toBe(true);
        });

        it("should not follow symlinks when disabled", async () => {
            const files = await fileScanner.scanFiles({
                followSymlinks: false,
            });
            expect(Array.isArray(files)).toBe(true);
        });

        it("should handle basic file scanning", async () => {
            const files = await fileScanner.scanFiles();
            expect(Array.isArray(files)).toBe(true);
        });

        it("should handle custom include patterns", async () => {
            const files = await fileScanner.scanFiles({
                include: ["**/*.ts", "**/*.js"],
            });
            expect(Array.isArray(files)).toBe(true);
        });

        it("should handle custom ignore patterns", async () => {
            const files = await fileScanner.scanFiles({
                ignore: ["dist/**", "node_modules/**"],
            });
            expect(Array.isArray(files)).toBe(true);
        });

        it("should handle config file path", async () => {
            const files = await fileScanner.scanFiles({
                config: "./eslint.config.js",
            });
            expect(Array.isArray(files)).toBe(true);
        });

        it("should handle file discovery errors by throwing", async () => {
            // Create a new mock that rejects
            const mockFg = vi
                .fn()
                .mockRejectedValue(new Error("File system error"));

            // Replace the original mock temporarily
            const { default: fg } = await import("fast-glob");
            const originalMock = vi.mocked(fg);
            vi.mocked(fg).mockImplementation(mockFg);

            await expect(fileScanner.scanFiles()).rejects.toThrow(
                "File discovery failed: File system error"
            );

            // Restore original mock
            vi.mocked(fg).mockImplementation(originalMock);
        });
    });
});
