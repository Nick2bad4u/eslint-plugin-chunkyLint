import type { Promisable } from "type-fest";

import { promises as fs } from "node:fs";
import { join, resolve } from "node:path";
import { arrayJoin, safeCastTo } from "ts-extras";
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type { ChunkyLintConfig } from "../types/chunky-lint-types.js";

import { loadConfig, mergeConfig } from "../lib/config-loader.js";

type NodeFsModule = typeof import("node:fs");

type GlobalWithImport = typeof globalThis & {
    import?: (url: string) => Promisable<unknown>;
};
const globalWithImport = safeCastTo<GlobalWithImport>(globalThis);

// Mock the fs module – expose real write/mkdir helpers for temp file tests
vi.mock("node:fs", async () => {
    const actualFs = await vi.importActual<NodeFsModule>("node:fs");
    return {
        promises: {
            access: vi.fn(), // Spied in tests
            mkdir: actualFs.promises.mkdir,
            readdir: actualFs.promises.readdir,
            readFile: vi.fn(), // Spied in tests
            rmdir: actualFs.promises.rmdir,
            stat: actualFs.promises.stat,
            unlink: actualFs.promises.unlink,
            writeFile: actualFs.promises.writeFile,
        },
    };
});

// Mock path functions
vi.mock("node:path", () => ({
    join: vi.fn(),
    resolve: vi.fn(),
}));

// Store original import
const originalImport = globalWithImport.import;

describe("ConfigLoader", () => {
    const mockFs = vi.mocked(fs),
        mockJoin = vi.mocked(join),
        mockResolve = vi.mocked(resolve);

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default path behavior
        mockJoin.mockImplementation((...parts) => arrayJoin(parts, "/"));
        mockResolve.mockImplementation((...parts) => arrayJoin(parts, "/"));

        // Reset global import
        if (typeof originalImport === "function") {
            globalWithImport.import = originalImport;
        } else {
            delete globalWithImport.import;
        }
    });

    afterEach(() => {
        if (typeof originalImport === "function") {
            globalWithImport.import = originalImport;
        } else {
            delete globalWithImport.import;
        }
    });

    describe("mergeConfig", () => {
        const baseConfig: ChunkyLintConfig = {
            cacheLocation: ".cache",
            concurrency: 1,
            continueOnError: false,
            fix: false,
            include: ["src/**/*.js"],
            size: 5,
            verbose: false,
        };

        it("should merge configs with CLI taking precedence", () => {
            const cliConfig: Partial<ChunkyLintConfig> = {
                    include: ["src/**/*.ts"],
                    size: 10,
                    verbose: true,
                },
                result = mergeConfig(baseConfig, cliConfig);

            expect(result).toEqual({
                cacheLocation: ".cache", // From base
                concurrency: 1, // From base
                continueOnError: false, // From base
                fix: false, // From base
                include: ["src/**/*.ts"], // From CLI
                size: 10, // From CLI
                verbose: true, // From CLI
            });
        });

        it("should handle empty CLI config", () => {
            const result = mergeConfig(baseConfig, {});
            expect(result).toEqual(baseConfig);
        });

        it("should preserve base values for omitted CLI fields", () => {
            const cliConfig: Partial<ChunkyLintConfig> = {
                    include: ["src/**/*.ts"],
                    size: 10,
                },
                result = mergeConfig(baseConfig, cliConfig);

            expect(result).toEqual({
                cacheLocation: ".cache",
                concurrency: 1,
                continueOnError: false,
                fix: false,
                include: ["src/**/*.ts"],
                size: 10,
                verbose: false, // From base, not overridden
            });
        });

        it("should handle all config properties", () => {
            const cliConfig: Partial<ChunkyLintConfig> = {
                    cacheLocation: "/project/cache",
                    concurrency: 4,
                    config: "/custom/eslint.config.js",
                    continueOnError: true,
                    cwd: "/project/workspace",
                    fix: true,
                    ignore: ["**/dist/**"],
                    include: ["**/*.tsx"],
                    size: 15,
                    verbose: true,
                },
                result = mergeConfig(baseConfig, cliConfig);

            expect(result).toEqual({
                cacheLocation: "/project/cache",
                concurrency: 4,
                config: "/custom/eslint.config.js",
                continueOnError: true,
                cwd: "/project/workspace",
                fix: true,
                ignore: ["**/dist/**"],
                include: ["**/*.tsx"],
                size: 15,
                verbose: true,
            });
        });

        it("should preserve base config when CLI config has no values", () => {
            const result = mergeConfig(baseConfig, {});
            expect(result).toStrictEqual(baseConfig);
        });

        it("should handle partial overrides correctly", () => {
            const cliConfig: Partial<ChunkyLintConfig> = {
                    fix: true,
                    size: 20,
                },
                result = mergeConfig(baseConfig, cliConfig);

            expect(result).toEqual({
                cacheLocation: ".cache", // From base
                concurrency: 1, // From base
                continueOnError: false, // From base
                fix: true, // Overridden
                include: ["src/**/*.js"], // From base
                size: 20, // Overridden
                verbose: false, // From base
            });
        });

        it("should handle null and false values correctly", () => {
            const cliConfig: Partial<ChunkyLintConfig> = {
                    fix: false,
                    include: [],
                    verbose: false,
                },
                result = mergeConfig(baseConfig, cliConfig);

            expect(result).toEqual({
                cacheLocation: ".cache",
                concurrency: 1,
                continueOnError: false,
                fix: false,
                include: [],
                size: 5,
                verbose: false,
            });
        });

        it("should preserve properties not in CLI config", () => {
            const baseWithMore: ChunkyLintConfig = {
                    ...baseConfig,
                    cwd: "/base/path",
                    ignore: ["**/*.test.js"],
                },
                cliConfig: Partial<ChunkyLintConfig> = {
                    size: 8,
                },
                result = mergeConfig(baseWithMore, cliConfig);

            expect(result).toEqual({
                cacheLocation: ".cache",
                concurrency: 1,
                continueOnError: false,
                cwd: "/base/path", // Preserved
                fix: false,
                ignore: ["**/*.test.js"], // Preserved
                include: ["src/**/*.js"],
                size: 8, // Overridden
                verbose: false,
            });
        });
    });

    describe("loadConfig", () => {
        describe("JSON config files", () => {
            it("should load valid JSON config with explicit path", async () => {
                const configContent = JSON.stringify({
                        concurrency: 2,
                        size: 10,
                        verbose: true,
                    }),
                    configPath = ".chunkylint.json";

                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();
                mockFs.readFile.mockResolvedValue(configContent);

                const result = await loadConfig(configPath, "/project");

                expect(result).toEqual({
                    concurrency: 2,
                    size: 10,
                    verbose: true,
                });
                expect(mockResolve).toHaveBeenCalledWith(
                    "/project",
                    ".chunkylint.json"
                );
            });

            it("should return null when no config found during auto-discovery", async () => {
                mockFs.access.mockRejectedValue(new Error("ENOENT"));

                const result = await loadConfig(undefined, "/project");

                expect(result).toBeNull();
            });

            it("should throw error for invalid JSON", async () => {
                const configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();
                mockFs.readFile.mockResolvedValue("{ invalid json }");

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow("Failed to parse JSON config");
            });

            it("should find config file during auto-discovery", async () => {
                const configContent = JSON.stringify({ size: 8 });

                mockFs.access
                    .mockRejectedValueOnce(new Error("ENOENT")) // .chunkylint.ts not found
                    .mockRejectedValueOnce(new Error("ENOENT")) // .chunkylint.js not found
                    .mockRejectedValueOnce(new Error("ENOENT")) // .chunkylint.mjs not found
                    .mockResolvedValueOnce(); // .chunkylint.json found
                mockFs.readFile.mockResolvedValue(configContent);

                const result = await loadConfig(undefined, "/project");

                expect(result).toEqual({ size: 8 });
            });
        });

        describe("JavaScript/TypeScript config files", () => {
            const realCwd = process.cwd();
            const tmpRoot = `${realCwd}/temp-config-tests`;

            const writeTemp = async (
                fileName: string,
                contents: string
            ): Promise<string> => {
                await fs.mkdir(tmpRoot, { recursive: true });
                const full = resolve(tmpRoot, fileName);
                await fs.writeFile(full, contents, "utf8");
                return full;
            };

            // Simple recursive directory remover compatible with older Node (no fs.rm)
            const removeDir = async (dir: string): Promise<void> => {
                try {
                    const entries = await fs
                        .readdir(dir)
                        .catch(() => safeCastTo<string[]>([]));
                    await Promise.all(
                        entries.map(async (entry) => {
                            const full = resolve(dir, entry);
                            try {
                                const st = await fs.stat(full);
                                await (st.isDirectory()
                                    ? removeDir(full)
                                    : fs.unlink(full).catch(() => {}));
                            } catch {
                                // Ignore
                            }
                        })
                    );
                    await fs.rmdir(dir).catch(() => {});
                } catch {
                    // Ignore
                }
            };

            beforeAll(async () => {
                await removeDir(tmpRoot);
                await fs.mkdir(tmpRoot, { recursive: true });
            });

            afterAll(async () => {
                await removeDir(tmpRoot);
            });

            it("should load JS config with default export", async () => {
                await writeTemp(
                    ".chunkylint.js",
                    "export default { size: 10, verbose: true };\n"
                );
                const result = await loadConfig(".chunkylint.js", tmpRoot);
                expect(result).toEqual({ size: 10, verbose: true });
            });

            it("should load JS config with named export", async () => {
                await writeTemp(
                    ".chunkylint.js",
                    "export const size = 10; export const verbose = true; export default { size, verbose };\n"
                );
                const result = await loadConfig(".chunkylint.js", tmpRoot);
                expect(result).toEqual({ size: 10, verbose: true });
            });

            it("should load JS config with function export", async () => {
                await writeTemp(
                    ".chunkylint.js",
                    "export default () => ({ size: 10, verbose: true });\n"
                );
                const result = await loadConfig(".chunkylint.js", tmpRoot);
                expect(result).toEqual({ size: 10, verbose: true });
            });

            it("should handle async function config", async () => {
                await writeTemp(
                    ".chunkylint.js",
                    "export default async () => ({ size: 10, verbose: true });\n"
                );
                const result = await loadConfig(".chunkylint.js", tmpRoot);
                expect(result).toEqual({ size: 10, verbose: true });
            });

            it("should handle .mjs files", async () => {
                await writeTemp(
                    ".chunkylint.mjs",
                    "export default { size: 11, verbose: false };\n"
                );
                const result = await loadConfig(".chunkylint.mjs", tmpRoot);
                expect(result).toEqual({ size: 11, verbose: false });
            });

            it("should handle .ts files", async () => {
                // Create placeholder file (content not actually executed by Node here)
                await writeTemp(
                    ".chunkylint.ts",
                    "export default { size: 12, verbose: true };\n"
                );
                const original = globalWithImport.import;
                globalWithImport.import = vi.fn((url: string) => {
                    if (url.includes(".chunkylint.ts")) {
                        return { default: { size: 12, verbose: true } };
                    }

                    if (typeof original === "function") {
                        return original(url);
                    }

                    throw new Error("global import is unavailable");
                });
                const result = await loadConfig(".chunkylint.ts", tmpRoot);
                expect(result).toEqual({ size: 12, verbose: true });
            });
        });

        describe("error handling", () => {
            it("should throw error for explicit config file not found", async () => {
                const configPath = "missing.json";
                mockResolve.mockReturnValue("/project/missing.json");
                mockFs.access.mockRejectedValue(new Error("ENOENT"));

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow("Config file not found:");
            });

            it("should throw error for unsupported file extension", async () => {
                const configPath = ".chunkylint.yml";
                mockResolve.mockReturnValue("/project/.chunkylint.yml");
                mockFs.access.mockResolvedValue();

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow("Unsupported config file type:");
            });

            it("should throw error for file without extension", async () => {
                const configPath = "chunkylint";
                mockResolve.mockReturnValue("/project/chunkylint");
                mockFs.access.mockResolvedValue();

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow("Unsupported config file type:");
            });

            it("should throw error for import failures", async () => {
                const configPath = ".chunkylint.js";
                mockResolve.mockReturnValue("/project/.chunkylint.js");
                mockFs.access.mockResolvedValue();

                globalWithImport.import = vi
                    .fn()
                    .mockRejectedValue(new Error("Module not found"));

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow("Failed to load JS/TS config");
            });
        });

        describe("config validation", () => {
            it("should validate valid config", async () => {
                const configPath = ".chunkylint.json",
                    validConfig = {
                        concurrency: 2,
                        fix: false,
                        ignore: ["**/*.test.ts"],
                        include: ["src/**/*.ts"],
                        size: 10,
                        verbose: true,
                    };

                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();
                mockFs.readFile.mockResolvedValue(JSON.stringify(validConfig));

                const result = await loadConfig(configPath, "/project");
                expect(result).toEqual(validConfig);
            });

            it("should reject non-object config", async () => {
                const configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();
                mockFs.readFile.mockResolvedValue(
                    JSON.stringify("string config")
                );

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow("Config must be an object");
            });

            it("should reject null config", async () => {
                const configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();
                mockFs.readFile.mockResolvedValue(JSON.stringify(null));

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow("Config must be an object");
            });

            it("should reject invalid size (non-integer)", async () => {
                const configPath = ".chunkylint.json",
                    invalidConfig = { size: 5.5 };
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();
                mockFs.readFile.mockResolvedValue(
                    JSON.stringify(invalidConfig)
                );

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow("size must be a positive integer");
            });

            it("should reject invalid size (zero)", async () => {
                const configPath = ".chunkylint.json",
                    invalidConfig = { size: 0 };
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();
                mockFs.readFile.mockResolvedValue(
                    JSON.stringify(invalidConfig)
                );

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow("size must be a positive integer");
            });

            it("should reject invalid size (negative)", async () => {
                const configPath = ".chunkylint.json",
                    invalidConfig = { size: -1 };
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();
                mockFs.readFile.mockResolvedValue(
                    JSON.stringify(invalidConfig)
                );

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow("size must be a positive integer");
            });

            it("should reject invalid concurrency (non-integer)", async () => {
                const configPath = ".chunkylint.json",
                    invalidConfig = { concurrency: 2.5 };
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();
                mockFs.readFile.mockResolvedValue(
                    JSON.stringify(invalidConfig)
                );

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow("concurrency must be a positive integer");
            });

            it("should reject invalid concurrency (zero)", async () => {
                const configPath = ".chunkylint.json",
                    invalidConfig = { concurrency: 0 };
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();
                mockFs.readFile.mockResolvedValue(
                    JSON.stringify(invalidConfig)
                );

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow("concurrency must be a positive integer");
            });

            it("should reject invalid include (non-array)", async () => {
                const configPath = ".chunkylint.json",
                    invalidConfig = { include: "src/**/*.ts" };
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();
                mockFs.readFile.mockResolvedValue(
                    JSON.stringify(invalidConfig)
                );

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow("include must be an array of strings");
            });

            it("should reject invalid ignore (non-array)", async () => {
                const configPath = ".chunkylint.json",
                    invalidConfig = { ignore: "**/*.test.ts" };
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();
                mockFs.readFile.mockResolvedValue(
                    JSON.stringify(invalidConfig)
                );

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow("ignore must be an array of strings");
            });

            it("should allow undefined optional fields", async () => {
                const configPath = ".chunkylint.json",
                    validConfig = { size: 5 };
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();
                mockFs.readFile.mockResolvedValue(JSON.stringify(validConfig));

                const result = await loadConfig(configPath, "/project");
                expect(result).toEqual(validConfig);
            });

            it("should allow empty arrays", async () => {
                const configPath = ".chunkylint.json",
                    validConfig = { ignore: [], include: [] };
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();
                mockFs.readFile.mockResolvedValue(JSON.stringify(validConfig));

                const result = await loadConfig(configPath, "/project");
                expect(result).toEqual(validConfig);
            });
        });

        describe("file discovery", () => {
            it("should search all config file types in order", async () => {
                mockFs.access.mockRejectedValue(new Error("ENOENT"));

                await loadConfig(undefined, "/project");

                const expectedFiles = [
                    ".chunkylint.ts",
                    ".chunkylint.js",
                    ".chunkylint.mjs",
                    ".chunkylint.json",
                    "chunkylint.config.ts",
                    "chunkylint.config.js",
                    "chunkylint.config.mjs",
                    "chunkylint.config.json",
                ];

                for (const filename of expectedFiles) {
                    expect(mockJoin).toHaveBeenCalledWith("/project", filename);
                }
            });
        });

        describe("error handling", () => {
            it("should handle non-Error objects in catch block", async () => {
                // Test the error instanceof Error ternary on lines 52-53
                const configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue();

                // Mock a non-Error object being thrown
                mockFs.readFile.mockRejectedValue(
                    "String error, not Error object"
                );

                await expect(
                    loadConfig(configPath, "/project")
                ).rejects.toThrow(
                    "Failed to load config: Failed to parse JSON config: String error, not Error object"
                );
            });
        });
    });
});
