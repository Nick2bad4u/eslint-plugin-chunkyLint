import type { ESLint as ESLintClass } from "eslint";

import { arrayAt, arrayFirst, isFinite, safeCastTo } from "ts-extras";
import {
    beforeEach,
    describe,
    expect,
    it,
    type MockInstance,
    vi,
} from "vitest";

import type {
    ChunkerOptions,
    ChunkResult,
} from "../types/chunky-lint-types.js";

import { ESLintChunker } from "../lib/chunker.js";

// Minimal interface describing only the members we touch on mocked ESLint instances
// Inline shapes used directly in mocks; no exported aggregate interface needed.

// We purposefully do NOT implement the full ESLint surface; keep mocks as structured objects
// We will cast mock objects to ESLintClass using unknown to satisfy TypeScript without relying on 'any'.

// Helper type to spy on private method in tests without using 'any'
type ESLintChunkerWithPrivate = ESLintChunker & {
    processChunk: (
        files: readonly string[],
        chunkIndex: number
    ) => Promise<ChunkResult>;
};

type MockESLintInstance = {
    calculateConfigForFile: ReturnType<typeof vi.fn>;
    getConfigForFile?: ReturnType<typeof vi.fn>;
    isPathIgnored: ReturnType<typeof vi.fn>;
    lintFiles: ReturnType<typeof vi.fn>;
    version?: string;
};

type ProcessChunkMethod = (
    files: readonly string[],
    chunkIndex: number
) => Promise<ChunkResult>;

function createDefaultLintResults(): {
    errorCount: number;
    filePath: string;
    fixableErrorCount: number;
    fixableWarningCount: number;
    messages: unknown[];
    output: string | undefined;
    warningCount: number;
}[] {
    return [
        {
            errorCount: 0,
            filePath: "/test/file1.js",
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            messages: [],
            output: undefined,
            warningCount: 0,
        },
    ];
}

function createMockESLintInstance(
    overrides: Partial<MockESLintInstance> = {}
): ESLintClass {
    return {
        calculateConfigForFile: vi.fn().mockResolvedValue({}),
        isPathIgnored: vi.fn().mockResolvedValue(false),
        lintFiles: vi.fn().mockResolvedValue(createDefaultLintResults()),
        ...overrides,
    } as unknown as ESLintClass;
}

// Mock ESLint module
vi.mock("eslint", () => ({
    ESLint: Object.assign(
        vi.fn().mockImplementation(function MockESLint() {
            return createMockESLintInstance();
        }),
        {
            outputFixes: vi.fn<() => Promise<void>>().mockResolvedValue(),
        }
    ),
}));

// Mock fast-glob
vi.mock("fast-glob", () => ({
    default: vi.fn().mockResolvedValue(["/test/file1.js", "/test/file2.js"]),
}));

// Mock p-limit
vi.mock("p-limit", () => ({
    default: vi
        .fn()
        .mockImplementation(
            (concurrency: number) =>
                (fn: () => Promise<unknown>): Promise<unknown> => {
                    isFinite(concurrency);
                    return fn();
                }
        ),
}));

describe("ESLintChunker", () => {
    let mockOptions: ChunkerOptions = {
        continueOnError: false,
        cwd: "/test",
        size: 2,
        verbose: false,
    };
    let defaultChunker: ESLintChunker = new ESLintChunker(mockOptions);

    beforeEach(async () => {
        const [{ ESLint }, { default: fg }] = await Promise.all([
            import("eslint"),
            import("fast-glob"),
        ]);

        mockOptions = {
            continueOnError: false,
            cwd: "/test",
            size: 2,
            verbose: false,
        };

        vi.mocked(ESLint).mockImplementation(function MockESLint() {
            return createMockESLintInstance();
        });
        vi.mocked(ESLint).outputFixes = vi
            .fn<() => Promise<void>>()
            .mockResolvedValue();
        vi.mocked(fg).mockResolvedValue(["/test/file1.js", "/test/file2.js"]);

        defaultChunker = new ESLintChunker(mockOptions);
    });

    describe("constructor", () => {
        it("should create chunker with default options", () => {
            const freshChunker = new ESLintChunker();
            expect(freshChunker).toBeInstanceOf(ESLintChunker);
        });

        it("should create chunker with custom options", () => {
            const customChunker = new ESLintChunker({
                cacheLocation: ".custom-cache",
                size: 100,
                verbose: true,
            });
            expect(customChunker).toBeInstanceOf(ESLintChunker);
        });
    });

    describe("run", () => {
        it("should process files and return statistics", async () => {
            const stats = await defaultChunker.run();

            expect(stats).toMatchObject({
                failedChunks: expect.any(Number),
                filesFixed: expect.any(Number),
                filesWithErrors: expect.any(Number),
                filesWithWarnings: expect.any(Number),
                totalChunks: expect.any(Number),
                totalFiles: expect.any(Number),
                totalTime: expect.any(Number),
            });
        });

        it("should call progress callback if provided", async () => {
            const progressCallback = vi.fn();

            await defaultChunker.run(progressCallback);

            expect(progressCallback).toHaveBeenCalled();
        });

        it("should not set overrideConfigFile by default", async () => {
            const { ESLint } = await import("eslint");

            await defaultChunker.run();

            const lastCallOptions = safeCastTo<
                undefined | { overrideConfigFile?: unknown }
            >(arrayFirst(arrayAt(vi.mocked(ESLint).mock.calls, -1) ?? []));

            expect(lastCallOptions?.overrideConfigFile).toBeUndefined();
        });

        it("should set overrideConfigFile when config is explicitly provided", async () => {
            const configPath = "./eslint.config.js",
                chunkerWithConfig = new ESLintChunker({ config: configPath }),
                { ESLint } = await import("eslint");

            await chunkerWithConfig.run();

            const lastCallOptions = safeCastTo<
                undefined | { overrideConfigFile?: unknown }
            >(arrayFirst(arrayAt(vi.mocked(ESLint).mock.calls, -1) ?? []));

            expect(lastCallOptions?.overrideConfigFile).toBe(configPath);
        });

        it("should handle empty file list", async () => {
            // Mock empty file list
            const { default: fg } = await import("fast-glob");
            vi.mocked(fg).mockResolvedValueOnce([]);

            const stats = await defaultChunker.run();

            expect(stats.totalFiles).toBe(0);
            expect(stats.totalChunks).toBe(0);
        });

        it("should handle ESLint errors with counts", async () => {
            // Mock ESLint to return results with errors
            const mockLintFiles = vi.fn().mockResolvedValue([
                    {
                        errorCount: 1,
                        filePath: "/test/file1.js",
                        fixableErrorCount: 0,
                        fixableWarningCount: 0,
                        messages: [
                            {
                                message: "Error message",
                                ruleId: "test-rule",
                                severity: 2,
                            },
                        ],
                        output: undefined,
                        source: "test source",
                        warningCount: 0,
                    },
                ]),
                { ESLint } = await import("eslint");

            vi.mocked(ESLint).mockImplementation(function MockESLint() {
                return {
                    calculateConfigForFile: vi.fn().mockResolvedValue({}),
                    getConfigForFile: vi.fn().mockResolvedValue({}),
                    isPathIgnored: vi.fn().mockResolvedValue(false),
                    lintFiles: mockLintFiles,
                    version: "8.0.0",
                } as unknown as ESLintClass;
            });

            const stats = await defaultChunker.run();
            expect(stats.filesWithErrors).toBeGreaterThan(0);
        });

        it("should handle ESLint warnings with counts", async () => {
            // Mock ESLint to return results with warnings
            const mockLintFiles = vi.fn().mockResolvedValue([
                    {
                        errorCount: 0,
                        filePath: "/test/file1.js",
                        fixableErrorCount: 0,
                        fixableWarningCount: 0,
                        messages: [
                            {
                                message: "Warning message",
                                ruleId: "test-rule",
                                severity: 1,
                            },
                        ],
                        output: undefined,
                        source: "test source",
                        warningCount: 1,
                    },
                ]),
                { ESLint } = await import("eslint");

            vi.mocked(ESLint).mockImplementation(function MockESLint() {
                return {
                    calculateConfigForFile: vi.fn().mockResolvedValue({}),
                    getConfigForFile: vi.fn().mockResolvedValue({}),
                    isPathIgnored: vi.fn().mockResolvedValue(false),
                    lintFiles: mockLintFiles,
                    version: "8.0.0",
                } as unknown as ESLintClass;
            });

            const stats = await defaultChunker.run();
            expect(stats.filesWithWarnings).toBeGreaterThan(0);
        });

        it("should handle fixed files count", async () => {
            // Mock ESLint to return results with fixes
            const mockLintFiles = vi.fn().mockResolvedValue([
                    {
                        errorCount: 0,
                        filePath: "/test/file1.js",
                        fixableErrorCount: 0,
                        fixableWarningCount: 0,
                        messages: [],
                        output: "fixed content",
                        source: "test source",
                        warningCount: 0,
                    },
                ]),
                { ESLint } = await import("eslint");

            vi.mocked(ESLint).mockImplementation(function MockESLint() {
                return {
                    calculateConfigForFile: vi.fn().mockResolvedValue({}),
                    getConfigForFile: vi.fn().mockResolvedValue({}),
                    isPathIgnored: vi.fn().mockResolvedValue(false),
                    lintFiles: mockLintFiles,
                    version: "8.0.0",
                } as unknown as ESLintClass;
            });

            const chunker = new ESLintChunker({ fix: true }),
                stats = await chunker.run();
            // The test should pass if we process files with output (indicating fixes were applied)
            expect(stats.totalFiles).toBeGreaterThan(0);
        });

        it("should handle chunk failures and continue when continueOnError is true", async () => {
            // Mock ESLint to throw an error
            const mockLintFiles = vi
                    .fn()
                    .mockRejectedValue(new Error("ESLint failed")),
                { ESLint } = await import("eslint");

            vi.mocked(ESLint).mockImplementation(function MockESLint() {
                return {
                    calculateConfigForFile: vi.fn().mockResolvedValue({}),
                    getConfigForFile: vi.fn().mockResolvedValue({}),
                    isPathIgnored: vi.fn().mockResolvedValue(false),
                    lintFiles: mockLintFiles,
                    version: "8.0.0",
                } as unknown as ESLintClass;
            });

            const chunker = new ESLintChunker({ continueOnError: true }),
                stats = await chunker.run();
            expect(stats.failedChunks).toBeGreaterThan(0);
        });

        it("should handle errors in the main run method", async () => {
            // Mock file scanner to throw an error during file discovery
            const { default: fg } = await import("fast-glob");
            vi.mocked(fg).mockRejectedValueOnce(new Error("File system error"));

            const chunker = new ESLintChunker();

            await expect(chunker.run()).rejects.toThrow();
        });

        it("should throw error when continueOnError is false and chunk fails", async () => {
            // Mock file scanner to return some files
            const { default: fg } = await import("fast-glob");
            vi.mocked(fg).mockResolvedValue([
                "test1.ts",
                "test2.ts",
                "test3.ts",
            ]);

            const chunker = new ESLintChunker({ continueOnError: false });

            // Directly override the processChunk method to throw
            const processChunkSpy = safeCastTo<
                MockInstance<ESLintChunkerWithPrivate["processChunk"]>
            >(vi.spyOn(chunker as ESLintChunkerWithPrivate, "processChunk"));

            processChunkSpy.mockRejectedValue(
                new Error("ESLint critical failure")
            );

            await expect(chunker.run()).rejects.toThrow(
                "ESLint critical failure"
            );

            processChunkSpy.mockRestore();
        });

        it("should apply fixes when fix option is enabled", async () => {
            // This test verifies the fix functionality exists and doesn't crash
            const chunker = new ESLintChunker({ fix: true, size: 200 }),
                stats = await chunker.run();

            // Just check that we don't crash with fix option
            expect(stats).toBeDefined();
            expect(typeof stats.filesFixed).toBe("number");
        });

        it("should call ESLint.outputFixes when applying fixes", async () => {
            // Mock file scanner to return some files
            const { default: fg } = await import("fast-glob");
            vi.mocked(fg).mockResolvedValue(["test1.ts"]);

            // Create a proper mock for ESLint.outputFixes
            const mockOutputFixes = vi
                    .fn<() => Promise<void>>()
                    .mockResolvedValue(),
                { ESLint } = await import("eslint");
            vi.mocked(ESLint).outputFixes = mockOutputFixes;

            // Mock ESLint instance to return results with fixes
            const mockESLintInstance = {
                calculateConfigForFile: vi.fn().mockResolvedValue({}),
                isPathIgnored: vi.fn().mockResolvedValue(false),
                lintFiles: vi.fn().mockResolvedValue([
                    {
                        errorCount: 0,
                        filePath: "/test1.ts",
                        fixableErrorCount: 1,
                        fixableWarningCount: 0,
                        messages: [],
                        output: "const x = 1;", // This indicates a fix was applied
                        source: "const x = 1",
                        warningCount: 0,
                    },
                ]),
            };

            vi.mocked(ESLint).mockImplementation(function MockESLint() {
                return mockESLintInstance as unknown as ESLintClass;
            });

            const chunker = new ESLintChunker({ fix: true, size: 200 }),
                stats = await chunker.run();

            // Verify that outputFixes was called
            expect(mockOutputFixes).toHaveBeenCalledWith([
                expect.objectContaining({
                    filePath: "/test1.ts",
                    output: "const x = 1;",
                }),
            ]);
            expect(stats.filesFixed).toBe(1);
        });

        it("should display warning counts in progress messages", async () => {
            const stdoutSpy = vi
                    .spyOn(process.stdout, "write")
                    .mockImplementation(() => true),
                // Mock file scanner to return some files
                { default: fg } = await import("fast-glob");
            vi.mocked(fg).mockResolvedValue(["test1.ts"]);

            // Mock ESLint to return warnings
            const { ESLint } = await import("eslint");
            vi.mocked(ESLint).mockImplementation(function MockESLint() {
                return {
                    calculateConfigForFile: vi.fn().mockResolvedValue({}),
                    isPathIgnored: vi.fn().mockResolvedValue(false),
                    lintFiles: vi.fn().mockResolvedValue([
                        {
                            errorCount: 0,
                            filePath: "/test1.ts",
                            fixableErrorCount: 0,
                            fixableWarningCount: 0,
                            messages: [
                                {
                                    message: "Unexpected console statement.",
                                    ruleId: "no-console",
                                    severity: 1,
                                },
                            ],
                            warningCount: 1,
                        },
                    ]),
                } as unknown as ESLintClass;
            });

            const chunker = new ESLintChunker({ size: 1 });
            await chunker.run();

            const warningCall = stdoutSpy.mock.calls.find(
                ([message]) =>
                    typeof message === "string" &&
                    message.includes("1 warnings")
            );
            expect(warningCall).toBeDefined();

            stdoutSpy.mockRestore();
        });

        it("should display fixed counts in completion summary", async () => {
            const stdoutSpy = vi
                    .spyOn(process.stdout, "write")
                    .mockImplementation(() => true),
                // Mock file scanner to return some files
                { default: fg } = await import("fast-glob");
            vi.mocked(fg).mockResolvedValue(["test1.ts"]);

            // Mock ESLint to return fixed files
            const { ESLint } = await import("eslint");
            vi.mocked(ESLint).mockImplementation(function MockESLint() {
                return {
                    calculateConfigForFile: vi.fn().mockResolvedValue({}),
                    isPathIgnored: vi.fn().mockResolvedValue(false),
                    lintFiles: vi.fn().mockResolvedValue([
                        {
                            errorCount: 0,
                            filePath: "/test1.ts",
                            fixableErrorCount: 0,
                            fixableWarningCount: 0,
                            messages: [],
                            output: "const x = 1;", // This indicates a fix was applied
                            warningCount: 0,
                        },
                    ]),
                } as unknown as ESLintClass;
            });

            const chunker = new ESLintChunker();
            await chunker.run();

            const fixedCall = stdoutSpy.mock.calls.find(
                ([message]) =>
                    typeof message === "string" &&
                    message.includes("🔧 Files fixed: 1")
            );
            expect(fixedCall).toBeDefined();

            stdoutSpy.mockRestore();
        });

        it("should display failed chunks in completion summary", async () => {
            const stdoutSpy = vi
                    .spyOn(process.stdout, "write")
                    .mockImplementation(() => true),
                // Mock file scanner to return some files
                { default: fg } = await import("fast-glob");
            vi.mocked(fg).mockResolvedValue(["test1.ts", "test2.ts"]);

            // Mock ESLint to throw an error
            const { ESLint } = await import("eslint");
            vi.mocked(ESLint).mockImplementation(function MockESLint() {
                return {
                    calculateConfigForFile: vi.fn().mockResolvedValue({}),
                    isPathIgnored: vi.fn().mockResolvedValue(false),
                    lintFiles: vi
                        .fn()
                        .mockRejectedValue(new Error("ESLint failed")),
                } as unknown as ESLintClass;
            });

            const chunker = new ESLintChunker({ continueOnError: true });
            await chunker.run();

            const failedCall = stdoutSpy.mock.calls.find(
                ([message]) =>
                    typeof message === "string" &&
                    message.includes("💥 Failed chunks:")
            );
            expect(failedCall).toBeDefined();

            stdoutSpy.mockRestore();
        });

        it("should handle chunk array fallback when chunks[i] is undefined", async () => {
            const chunker = new ESLintChunker({ continueOnError: true }),
                originalProcessChunk = safeCastTo<ProcessChunkMethod>(
                    Reflect.get(chunker, "processChunk")
                );
            const failedChunkResult: ChunkResult = {
                chunkIndex: 0,
                error: "Chunk processing failed",
                errorCount: 0,
                files: ["test1.ts"],
                fixedCount: 0,
                processingTime: 1,
                success: false,
                warningCount: 0,
            };

            Reflect.set(chunker, "processChunk", () =>
                Promise.resolve(failedChunkResult)
            );

            const stats = await chunker.run();

            expect(stats.failedChunks).toBeGreaterThan(0);
            Reflect.set(chunker, "processChunk", originalProcessChunk);
        });

        it("should handle non-Error objects in processChunk error handling", async () => {
            const chunker = new ESLintChunker({ continueOnError: true }),
                originalProcessChunk = safeCastTo<ProcessChunkMethod>(
                    Reflect.get(chunker, "processChunk")
                );
            const failedChunkResult: ChunkResult = {
                chunkIndex: 0,
                error: "String error, not Error object",
                errorCount: 0,
                files: ["test1.ts"],
                fixedCount: 0,
                processingTime: 1,
                success: false,
                warningCount: 0,
            };

            Reflect.set(chunker, "processChunk", () =>
                Promise.resolve(failedChunkResult)
            );

            const stats = await chunker.run();

            expect(stats.failedChunks).toBeGreaterThan(0);
            Reflect.set(chunker, "processChunk", originalProcessChunk);
        });

        it("should suppress per-chunk logs when chunkLogs is false", async () => {
            const chunker = new ESLintChunker({ chunkLogs: false, size: 1 }),
                stdoutSpy = vi
                    .spyOn(process.stdout, "write")
                    .mockImplementation(() => true),
                { default: fg } = await import("fast-glob");

            vi.mocked(fg).mockResolvedValue(["test1.ts"]);

            await chunker.run();

            const hasChunkLog = stdoutSpy.mock.calls.some(
                ([message]) =>
                    typeof message === "string" && message.includes("Chunk ")
            );

            expect(hasChunkLog).toBe(false);
            stdoutSpy.mockRestore();
        });
    });
});
