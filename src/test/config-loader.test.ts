import { promises as fs } from "node:fs";
import os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import type { ChunkyLintConfig } from "../types/chunky-lint-types.js";

import { loadConfig, mergeConfig } from "../lib/config-loader.js";

const withTempDirectory = async (
    run: (directory: string) => Promise<void>
): Promise<void> => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), "chunkylint-"));

    try {
        await run(directory);
    } finally {
        await fs.rm(directory, { force: true, recursive: true });
    }
};

const writeConfigFile = async (
    directory: string,
    fileName: string,
    content: string
): Promise<string> => {
    const filePath = path.join(directory, fileName);
    await fs.writeFile(filePath, content, "utf8");
    return filePath;
};

describe("configLoader", () => {
    describe(mergeConfig, () => {
        it("merges with CLI values taking precedence", () => {
            expect.hasAssertions();

            const baseConfig: ChunkyLintConfig = {
                cacheLocation: ".cache",
                concurrency: 1,
                continueOnError: false,
                fix: false,
                include: ["src/**/*.js"],
                size: 5,
                verbose: false,
            };
            const cliConfig: Partial<ChunkyLintConfig> = {
                include: ["src/**/*.ts"],
                size: 25,
                verbose: true,
            };

            const result = mergeConfig(baseConfig, cliConfig);

            expect(result).toStrictEqual({
                cacheLocation: ".cache",
                concurrency: 1,
                continueOnError: false,
                fix: false,
                include: ["src/**/*.ts"],
                size: 25,
                verbose: true,
            });
        });

        it("returns base config when CLI overrides are empty", () => {
            expect.hasAssertions();

            const baseConfig: ChunkyLintConfig = {
                concurrency: 2,
                include: ["src/**/*.ts"],
                size: 50,
                verbose: false,
            };

            const result = mergeConfig(baseConfig, {});

            expect(result).toStrictEqual(baseConfig);
        });
    });

    describe(loadConfig, () => {
        it("loads explicit JSON config", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(
                    directory,
                    ".chunkylint.json",
                    JSON.stringify({ include: ["src/**/*.ts"], size: 20 })
                );

                const result = await loadConfig(".chunkylint.json", directory);

                expect(result).toMatchObject({
                    include: ["src/**/*.ts"],
                    size: 20,
                });
            });
        });

        it("auto-discovers config files when no explicit path is provided", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(
                    directory,
                    ".chunkylint.json",
                    JSON.stringify({ concurrency: 3, size: 40 })
                );

                const result = await loadConfig(undefined, directory);

                expect(result).toMatchObject({
                    concurrency: 3,
                    size: 40,
                });
            });
        });

        it("returns null when no config file exists", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                const result = await loadConfig(undefined, directory);

                expect(result).toBeNull();
            });
        });

        it("loads JavaScript object default exports", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(
                    directory,
                    ".chunkylint.js",
                    "export default { size: 15, verbose: true };\n"
                );

                const result = await loadConfig(".chunkylint.js", directory);

                expect(result).toMatchObject({ size: 15, verbose: true });
            });
        });

        it("loads JavaScript function exports", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(
                    directory,
                    ".chunkylint.js",
                    "export default () => ({ size: 10, quiet: false });\n"
                );

                const result = await loadConfig(".chunkylint.js", directory);

                expect(result).toMatchObject({ quiet: false, size: 10 });
            });
        });

        it("loads async JavaScript function exports", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(
                    directory,
                    ".chunkylint.js",
                    "export default async () => ({ chunkLogs: true, size: 12 });\n"
                );

                const result = await loadConfig(".chunkylint.js", directory);

                expect(result).toMatchObject({ chunkLogs: true, size: 12 });
            });
        });

        it("throws for unsupported extensions", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(
                    directory,
                    ".chunkylint.yml",
                    "size: 10\n"
                );

                await expect(
                    loadConfig(".chunkylint.yml", directory)
                ).rejects.toThrow("Unsupported config file type");
            });
        });

        it("throws when explicit file does not exist", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await expect(
                    loadConfig("missing.json", directory)
                ).rejects.toThrow("Config file not found");
            });
        });

        it("throws for invalid JSON", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(
                    directory,
                    ".chunkylint.json",
                    "{ invalid"
                );

                await expect(
                    loadConfig(".chunkylint.json", directory)
                ).rejects.toThrow("Failed to parse JSON config");
            });
        });

        it("throws when config is null", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(directory, ".chunkylint.json", "null");

                await expect(
                    loadConfig(".chunkylint.json", directory)
                ).rejects.toThrow("Config must be an object");
            });
        });

        it("throws for invalid size", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(
                    directory,
                    ".chunkylint.json",
                    JSON.stringify({ size: 0 })
                );

                await expect(
                    loadConfig(".chunkylint.json", directory)
                ).rejects.toThrow("size must be a positive integer");
            });
        });

        it("throws for invalid concurrency", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(
                    directory,
                    ".chunkylint.json",
                    JSON.stringify({ concurrency: -1 })
                );

                await expect(
                    loadConfig(".chunkylint.json", directory)
                ).rejects.toThrow("concurrency must be a positive integer");
            });
        });

        it("throws for invalid include type", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(
                    directory,
                    ".chunkylint.json",
                    JSON.stringify({ include: "src/**/*.ts" })
                );

                await expect(
                    loadConfig(".chunkylint.json", directory)
                ).rejects.toThrow("include must be an array of strings");
            });
        });

        it("throws for invalid ignore type", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(
                    directory,
                    ".chunkylint.json",
                    JSON.stringify({ ignore: "dist/**" })
                );

                await expect(
                    loadConfig(".chunkylint.json", directory)
                ).rejects.toThrow("ignore must be an array of strings");
            });
        });

        it("throws for invalid verbose type", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(
                    directory,
                    ".chunkylint.json",
                    JSON.stringify({ verbose: "yes" })
                );

                await expect(
                    loadConfig(".chunkylint.json", directory)
                ).rejects.toThrow("verbose must be a boolean");
            });
        });

        it("throws for invalid quiet type", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(
                    directory,
                    ".chunkylint.json",
                    JSON.stringify({ quiet: "no" })
                );

                await expect(
                    loadConfig(".chunkylint.json", directory)
                ).rejects.toThrow("quiet must be a boolean");
            });
        });

        it("throws for invalid chunkLogs type", async () => {
            expect.hasAssertions();

            await withTempDirectory(async (directory) => {
                await writeConfigFile(
                    directory,
                    ".chunkylint.json",
                    JSON.stringify({ chunkLogs: 1 })
                );

                await expect(
                    loadConfig(".chunkylint.json", directory)
                ).rejects.toThrow("chunkLogs must be a boolean");
            });
        });
    });
});
