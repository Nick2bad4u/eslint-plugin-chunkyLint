import { promises as fs } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { loadConfig } from "../lib/config-loader.js";

describe("configLoader Real File Tests - targeting uncovered lines", () => {
    const configPaths: string[] = [];
    const testDir = path.join(process.cwd(), "temp-config-test");

    const cleanupTestFiles = async (): Promise<void> => {
        // Clean up config files

        for (const configPath of configPaths) {
            try {
                await fs.unlink(configPath);
            } catch {
                // Ignore cleanup errors
            }
        }

        configPaths.length = 0;

        try {
            await fs.rmdir(testDir);
        } catch {
            // Ignore cleanup errors
        }
    };

    const createConfigFile = async (
        filename: string,
        content: string
    ): Promise<string> => {
        const filePath = path.join(testDir, filename);
        await fs.writeFile(filePath, content, "utf8");
        configPaths.push(filePath);
        return filePath;
    };

    it("should handle function config exports (covers lines 130, 134-138)", async () => {
        expect.hasAssertions();

        await fs.mkdir(testDir, { recursive: true });
        try {
            // Create a JavaScript config file with a function export
            const configPath = await createConfigFile(
                ".chunkyLint.js",
                '\n            export default function() {\n                return {\n                    size: 100,\n                    concurrency: 4,\n                    include: ["**/*.js"],\n                    ignore: ["node_modules/**"]\n                };\n            }\n        '
            );
            const config = await loadConfig(configPath);

            expect(config).toBeDefined();
            expect(config?.size).toBe(100);
            expect(config?.concurrency).toBe(4);
            expect(config?.include).toStrictEqual(["**/*.js"]);
            expect(config?.ignore).toStrictEqual(["node_modules/**"]);
        } finally {
            await cleanupTestFiles();
        }
    });

    it("should handle async function config exports", async () => {
        expect.hasAssertions();

        await fs.mkdir(testDir, { recursive: true });
        try {
            // Create a JavaScript config file with an async function export
            const configPath = await createConfigFile(
                ".chunkyLintAsync.js",
                '\n            export default async function() {\n                // Simulate async operation\n                await new Promise(resolve => setTimeout(resolve, 1));\n                return {\n                    size: 200,\n                    concurrency: 8,\n                    include: ["**/*.ts"],\n                    ignore: ["dist/**"]\n                };\n            }\n        '
            );
            const config = await loadConfig(configPath);

            expect(config).toBeDefined();
            expect(config?.size).toBe(200);
            expect(config?.concurrency).toBe(8);
            expect(config?.include).toStrictEqual(["**/*.ts"]);
            expect(config?.ignore).toStrictEqual(["dist/**"]);
        } finally {
            await cleanupTestFiles();
        }
    });

    it("should handle object config exports", async () => {
        expect.hasAssertions();

        await fs.mkdir(testDir, { recursive: true });
        try {
            // Create a JavaScript config file with an object export
            const configPath = await createConfigFile(
                ".chunkyLintObject.js",
                '\n            export default {\n                size: 300,\n                concurrency: 1,\n                include: ["**/*.jsx"],\n                ignore: ["build/**"]\n            };\n        '
            );
            const config = await loadConfig(configPath);

            expect(config).toBeDefined();
            expect(config?.size).toBe(300);
            expect(config?.concurrency).toBe(1);
            expect(config?.include).toStrictEqual(["**/*.jsx"]);
            expect(config?.ignore).toStrictEqual(["build/**"]);
        } finally {
            await cleanupTestFiles();
        }
    });

    it("should handle auto-discovery returning null (covers lines 52-53)", async () => {
        expect.hasAssertions();

        await fs.mkdir(testDir, { recursive: true });
        try {
            // Test auto-discovery when no config file exists
            const nonExistentDir = path.join(testDir, "empty");
            await fs.mkdir(nonExistentDir, { recursive: true });

            const config = await loadConfig(undefined, nonExistentDir);

            expect(config).toBeNull();

            await fs.rmdir(nonExistentDir);
        } finally {
            await cleanupTestFiles();
        }
    });

    it("should handle auto-discovery file found but not accessible (covers lines 52-53)", async () => {
        expect.hasAssertions();

        await fs.mkdir(testDir, { recursive: true });
        try {
            // Create a config file then delete it to simulate race condition
            const configPath = await createConfigFile(
                ".chunkyLint.json",
                '{"size": 50}'
            );

            // Delete the file to simulate it being found by findConfigFile but not accessible
            await fs.unlink(configPath);

            // This should trigger the fs.access failure during auto-discovery
            const config = await loadConfig(undefined, testDir);

            expect(config).toBeNull();
        } finally {
            await cleanupTestFiles();
        }
    });
});
