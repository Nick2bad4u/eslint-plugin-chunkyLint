import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { join, resolve } from "path";
import { loadConfig, mergeConfig } from "../lib/configLoader.js";
import { promises as fs } from "fs";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock the fs module – expose real write/mkdir helpers for temp file tests
vi.mock("fs", async () => {
    const actualFs = await import("fs");
    return {
        promises: {
            access: vi.fn(), // Spied in tests
            readFile: vi.fn(), // Spied in tests
            writeFile: actualFs.promises.writeFile,
            mkdir: actualFs.promises.mkdir,
            readdir: actualFs.promises.readdir,
            stat: actualFs.promises.stat,
            unlink: actualFs.promises.unlink,
            rmdir: actualFs.promises.rmdir,
        },
    };
});
// Mock path functions
vi.mock("path", () => ({
    join: vi.fn(),
    resolve: vi.fn(),
}));
// Store original import
const originalImport = globalThis.import;
describe("ConfigLoader", () => {
    const mockFs = vi.mocked(fs), mockJoin = vi.mocked(join), mockResolve = vi.mocked(resolve);
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default path behavior
        mockJoin.mockImplementation((...parts) => parts.join("/"));
        mockResolve.mockImplementation((...parts) => parts.join("/"));
        // Reset global import
        globalThis.import = originalImport;
    });
    afterEach(() => {
        globalThis.import = originalImport;
    });
    describe("mergeConfig", () => {
        const baseConfig = {
            size: 5,
            concurrency: 1,
            verbose: false,
            cacheLocation: ".cache",
            fix: false,
            continueOnError: false,
            include: ["src/**/*.js"],
        };
        it("should merge configs with CLI taking precedence", () => {
            const cliConfig = {
                size: 10,
                verbose: true,
                include: ["src/**/*.ts"],
            }, result = mergeConfig(baseConfig, cliConfig);
            expect(result).toEqual({
                size: 10, // From CLI
                concurrency: 1, // From base
                verbose: true, // From CLI
                cacheLocation: ".cache", // From base
                fix: false, // From base
                continueOnError: false, // From base
                include: ["src/**/*.ts"], // From CLI
            });
        });
        it("should handle empty CLI config", () => {
            const result = mergeConfig(baseConfig, {});
            expect(result).toEqual(baseConfig);
        });
        it("should filter out undefined values from CLI config", () => {
            const cliConfig = {
                size: 10,
                verbose: undefined,
                include: ["src/**/*.ts"],
            }, result = mergeConfig(baseConfig, cliConfig);
            expect(result).toEqual({
                size: 10,
                concurrency: 1,
                verbose: false, // From base, not overridden
                cacheLocation: ".cache",
                fix: false,
                continueOnError: false,
                include: ["src/**/*.ts"],
            });
        });
        it("should handle all config properties", () => {
            const cliConfig = {
                config: "/custom/eslint.config.js",
                size: 15,
                cacheLocation: "/tmp/cache",
                concurrency: 4,
                verbose: true,
                fix: true,
                continueOnError: true,
                include: ["**/*.tsx"],
                ignore: ["**/dist/**"],
                cwd: "/custom/dir",
            }, result = mergeConfig(baseConfig, cliConfig);
            expect(result).toEqual({
                config: "/custom/eslint.config.js",
                size: 15,
                concurrency: 4,
                verbose: true,
                cacheLocation: "/tmp/cache",
                fix: true,
                continueOnError: true,
                include: ["**/*.tsx"],
                ignore: ["**/dist/**"],
                cwd: "/custom/dir",
            });
        });
        it("should preserve base config when CLI config has no values", () => {
            const result = mergeConfig(baseConfig, {});
            expect(result).toStrictEqual(baseConfig);
        });
        it("should handle partial overrides correctly", () => {
            const cliConfig = {
                size: 20,
                fix: true,
            }, result = mergeConfig(baseConfig, cliConfig);
            expect(result).toEqual({
                size: 20, // Overridden
                concurrency: 1, // From base
                verbose: false, // From base
                cacheLocation: ".cache", // From base
                fix: true, // Overridden
                continueOnError: false, // From base
                include: ["src/**/*.js"], // From base
            });
        });
        it("should handle null and false values correctly", () => {
            const cliConfig = {
                verbose: false,
                fix: false,
                include: [],
            }, result = mergeConfig(baseConfig, cliConfig);
            expect(result).toEqual({
                size: 5,
                concurrency: 1,
                verbose: false,
                cacheLocation: ".cache",
                fix: false,
                continueOnError: false,
                include: [],
            });
        });
        it("should preserve properties not in CLI config", () => {
            const baseWithMore = {
                ...baseConfig,
                ignore: ["**/*.test.js"],
                cwd: "/base/path",
            }, cliConfig = {
                size: 8,
            }, result = mergeConfig(baseWithMore, cliConfig);
            expect(result).toEqual({
                size: 8, // Overridden
                concurrency: 1,
                verbose: false,
                cacheLocation: ".cache",
                fix: false,
                continueOnError: false,
                include: ["src/**/*.js"],
                ignore: ["**/*.test.js"], // Preserved
                cwd: "/base/path", // Preserved
            });
        });
    });
    describe("loadConfig", () => {
        describe("JSON config files", () => {
            it("should load valid JSON config with explicit path", async () => {
                const configPath = ".chunkylint.json", configContent = JSON.stringify({
                    size: 10,
                    concurrency: 2,
                    verbose: true,
                });
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
                mockFs.readFile.mockResolvedValue(configContent);
                const result = await loadConfig(configPath, "/project");
                expect(result).toEqual({
                    size: 10,
                    concurrency: 2,
                    verbose: true,
                });
                expect(mockResolve).toHaveBeenCalledWith("/project", ".chunkylint.json");
            });
            it("should return null when no config found during auto-discovery", async () => {
                mockFs.access.mockRejectedValue(new Error("ENOENT"));
                const result = await loadConfig(undefined, "/project");
                expect(result).toBeNull();
            });
            it("should throw error for invalid JSON", async () => {
                const configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
                mockFs.readFile.mockResolvedValue("{ invalid json }");
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("Failed to parse JSON config");
            });
            it("should find config file during auto-discovery", async () => {
                const configContent = JSON.stringify({ size: 8 });
                mockFs.access
                    .mockRejectedValueOnce(new Error("ENOENT")) // .chunkylint.ts not found
                    .mockRejectedValueOnce(new Error("ENOENT")) // .chunkylint.js not found
                    .mockRejectedValueOnce(new Error("ENOENT")) // .chunkylint.mjs not found
                    .mockResolvedValueOnce(undefined); // .chunkylint.json found
                mockFs.readFile.mockResolvedValue(configContent);
                const result = await loadConfig(undefined, "/project");
                expect(result).toEqual({ size: 8 });
            });
        });
        describe("JavaScript/TypeScript config files", () => {
            const realCwd = process.cwd();
            const tmpRoot = `${realCwd}/temp-config-tests`;
            const writeTemp = async (fileName, contents) => {
                await fs.mkdir(tmpRoot, { recursive: true });
                const full = resolve(tmpRoot, fileName);
                await fs.writeFile(full, contents, "utf-8");
                return full;
            };
            // Simple recursive directory remover compatible with older Node (no fs.rm)
            const removeDir = async (dir) => {
                try {
                    const entries = await fs.readdir(dir).catch(() => []);
                    await Promise.all(entries.map(async (entry) => {
                        const full = resolve(dir, entry);
                        try {
                            const st = await fs.stat(full);
                            if (st.isDirectory()) {
                                await removeDir(full);
                            }
                            else {
                                await fs.unlink(full).catch(() => undefined);
                            }
                        }
                        catch {
                            // Ignore
                        }
                    }));
                    await fs.rmdir(dir).catch(() => undefined);
                }
                catch {
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
                await writeTemp(".chunkylint.js", "export default { size: 10, verbose: true };\n");
                const result = await loadConfig(".chunkylint.js", tmpRoot);
                expect(result).toEqual({ size: 10, verbose: true });
            });
            it("should load JS config with named export", async () => {
                await writeTemp(".chunkylint.js", "export const size = 10; export const verbose = true; export default { size, verbose };\n");
                const result = await loadConfig(".chunkylint.js", tmpRoot);
                expect(result).toEqual({ size: 10, verbose: true });
            });
            it("should load JS config with function export", async () => {
                await writeTemp(".chunkylint.js", "export default () => ({ size: 10, verbose: true });\n");
                const result = await loadConfig(".chunkylint.js", tmpRoot);
                expect(result).toEqual({ size: 10, verbose: true });
            });
            it("should handle async function config", async () => {
                await writeTemp(".chunkylint.js", "export default async () => ({ size: 10, verbose: true });\n");
                const result = await loadConfig(".chunkylint.js", tmpRoot);
                expect(result).toEqual({ size: 10, verbose: true });
            });
            it("should handle .mjs files", async () => {
                await writeTemp(".chunkylint.mjs", "export default { size: 11, verbose: false };\n");
                const result = await loadConfig(".chunkylint.mjs", tmpRoot);
                expect(result).toEqual({ size: 11, verbose: false });
            });
            it("should handle .ts files", async () => {
                // Create placeholder file (content not actually executed by Node here)
                await writeTemp(".chunkylint.ts", "export default { size: 12, verbose: true };\n");
                const original = globalThis.import;
                globalThis.import = vi.fn((url) => {
                    if (url.includes(".chunkylint.ts")) {
                        return { default: { size: 12, verbose: true } };
                    }
                    return original(url);
                });
                const result = await loadConfig(".chunkylint.ts", tmpRoot);
                expect(result).toEqual({ size: 12, verbose: true });
                globalThis.import = original;
            });
        });
        describe("error handling", () => {
            it("should throw error for explicit config file not found", async () => {
                const configPath = "missing.json";
                mockResolve.mockReturnValue("/project/missing.json");
                mockFs.access.mockRejectedValue(new Error("ENOENT"));
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("Config file not found:");
            });
            it("should throw error for unsupported file extension", async () => {
                const configPath = ".chunkylint.yml";
                mockResolve.mockReturnValue("/project/.chunkylint.yml");
                mockFs.access.mockResolvedValue(undefined);
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("Unsupported config file type:");
            });
            it("should throw error for file without extension", async () => {
                const configPath = "chunkylint";
                mockResolve.mockReturnValue("/project/chunkylint");
                mockFs.access.mockResolvedValue(undefined);
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("Unsupported config file type:");
            });
            it("should throw error for import failures", async () => {
                const configPath = ".chunkylint.js";
                mockResolve.mockReturnValue("/project/.chunkylint.js");
                mockFs.access.mockResolvedValue(undefined);
                globalThis.import = vi.fn().mockRejectedValue(new Error("Module not found"));
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("Failed to load JS/TS config");
            });
        });
        describe("config validation", () => {
            it("should validate valid config", async () => {
                const validConfig = {
                    size: 10,
                    concurrency: 2,
                    include: ["src/**/*.ts"],
                    ignore: ["**/*.test.ts"],
                    verbose: true,
                    fix: false,
                }, configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
                mockFs.readFile.mockResolvedValue(JSON.stringify(validConfig));
                const result = await loadConfig(configPath, "/project");
                expect(result).toEqual(validConfig);
            });
            it("should reject non-object config", async () => {
                const configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
                mockFs.readFile.mockResolvedValue(JSON.stringify("string config"));
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("Config must be an object");
            });
            it("should reject null config", async () => {
                const configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
                mockFs.readFile.mockResolvedValue(JSON.stringify(null));
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("Config must be an object");
            });
            it("should reject invalid size (non-integer)", async () => {
                const invalidConfig = { size: 5.5 }, configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
                mockFs.readFile.mockResolvedValue(JSON.stringify(invalidConfig));
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("size must be a positive integer");
            });
            it("should reject invalid size (zero)", async () => {
                const invalidConfig = { size: 0 }, configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
                mockFs.readFile.mockResolvedValue(JSON.stringify(invalidConfig));
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("size must be a positive integer");
            });
            it("should reject invalid size (negative)", async () => {
                const invalidConfig = { size: -1 }, configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
                mockFs.readFile.mockResolvedValue(JSON.stringify(invalidConfig));
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("size must be a positive integer");
            });
            it("should reject invalid concurrency (non-integer)", async () => {
                const invalidConfig = { concurrency: 2.5 }, configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
                mockFs.readFile.mockResolvedValue(JSON.stringify(invalidConfig));
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("concurrency must be a positive integer");
            });
            it("should reject invalid concurrency (zero)", async () => {
                const invalidConfig = { concurrency: 0 }, configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
                mockFs.readFile.mockResolvedValue(JSON.stringify(invalidConfig));
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("concurrency must be a positive integer");
            });
            it("should reject invalid include (non-array)", async () => {
                const invalidConfig = { include: "src/**/*.ts" }, configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
                mockFs.readFile.mockResolvedValue(JSON.stringify(invalidConfig));
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("include must be an array of strings");
            });
            it("should reject invalid ignore (non-array)", async () => {
                const invalidConfig = { ignore: "**/*.test.ts" }, configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
                mockFs.readFile.mockResolvedValue(JSON.stringify(invalidConfig));
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("ignore must be an array of strings");
            });
            it("should allow undefined optional fields", async () => {
                const validConfig = { size: 5 }, configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
                mockFs.readFile.mockResolvedValue(JSON.stringify(validConfig));
                const result = await loadConfig(configPath, "/project");
                expect(result).toEqual(validConfig);
            });
            it("should allow empty arrays", async () => {
                const validConfig = { include: [], ignore: [] }, configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
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
                expectedFiles.forEach(filename => {
                    expect(mockJoin).toHaveBeenCalledWith("/project", filename);
                });
            });
        });
        describe("error handling", () => {
            it("should handle non-Error objects in catch block", async () => {
                // Test the error instanceof Error ternary on lines 52-53
                const configPath = ".chunkylint.json";
                mockResolve.mockReturnValue("/project/.chunkylint.json");
                mockFs.access.mockResolvedValue(undefined);
                // Mock a non-Error object being thrown
                mockFs.readFile.mockRejectedValue("String error, not Error object");
                await expect(loadConfig(configPath, "/project")).rejects.toThrow("Failed to load config: Failed to parse JSON config: String error, not Error object");
            });
        });
    });
});
//# sourceMappingURL=configLoader.test.js.map