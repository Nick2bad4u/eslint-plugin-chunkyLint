/* eslint-disable sort-imports */
import { promises as fs } from "fs";
import path from "path";
import { loadConfig } from "../lib/configLoader.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
describe("ConfigLoader Real File Tests - targeting uncovered lines", () => {
    const testDir = path.join(process.cwd(), "temp-config-test"),
        configPaths = [];
    beforeEach(async () => {
        // Create test directory
        await fs.mkdir(testDir, { recursive: true });
    });
    afterEach(async () => {
        // Clean up config files
        /* eslint-disable no-await-in-loop */
        for (const configPath of configPaths) {
            try {
                await fs.unlink(configPath);
            } catch {
                // Ignore cleanup errors
            }
        }
        /* eslint-enable no-await-in-loop */
        configPaths.length = 0;
        try {
            await fs.rmdir(testDir);
        } catch {
            // Ignore cleanup errors
        }
    });
    const createConfigFile = async (filename, content) => {
        const filePath = path.join(testDir, filename);
        await fs.writeFile(filePath, content, "utf8");
        configPaths.push(filePath);
        return filePath;
    };
    it("should handle function config exports (covers lines 130, 134-138)", async () => {
        // Create a JavaScript config file with a function export
        const configPath = await createConfigFile(
                ".chunkyLint.js",
                `
            export default function() {
                return {
                    size: 100,
                    concurrency: 4,
                    include: ["**/*.js"],
                    ignore: ["node_modules/**"]
                };
            }
        `
            ),
            config = await loadConfig(configPath);
        expect(config).toBeDefined();
        expect(config?.size).toBe(100);
        expect(config?.concurrency).toBe(4);
        expect(config?.include).toEqual(["**/*.js"]);
        expect(config?.ignore).toEqual(["node_modules/**"]);
    });
    it("should handle async function config exports", async () => {
        // Create a JavaScript config file with an async function export
        const configPath = await createConfigFile(
                ".chunkyLintAsync.js",
                `
            export default async function() {
                // Simulate async operation
                await new Promise(resolve => setTimeout(resolve, 1));
                return {
                    size: 200,
                    concurrency: 8,
                    include: ["**/*.ts"],
                    ignore: ["dist/**"]
                };
            }
        `
            ),
            config = await loadConfig(configPath);
        expect(config).toBeDefined();
        expect(config?.size).toBe(200);
        expect(config?.concurrency).toBe(8);
        expect(config?.include).toEqual(["**/*.ts"]);
        expect(config?.ignore).toEqual(["dist/**"]);
    });
    it("should handle object config exports", async () => {
        // Create a JavaScript config file with an object export
        const configPath = await createConfigFile(
                ".chunkyLintObject.js",
                `
            export default {
                size: 300,
                concurrency: 1,
                include: ["**/*.jsx"],
                ignore: ["build/**"]
            };
        `
            ),
            config = await loadConfig(configPath);
        expect(config).toBeDefined();
        expect(config?.size).toBe(300);
        expect(config?.concurrency).toBe(1);
        expect(config?.include).toEqual(["**/*.jsx"]);
        expect(config?.ignore).toEqual(["build/**"]);
    });
    it("should handle auto-discovery returning null (covers lines 52-53)", async () => {
        // Test auto-discovery when no config file exists
        const nonExistentDir = path.join(testDir, "empty");
        await fs.mkdir(nonExistentDir, { recursive: true });
        const config = await loadConfig(undefined, nonExistentDir);
        expect(config).toBeNull();
        await fs.rmdir(nonExistentDir);
    });
    it("should handle auto-discovery file found but not accessible (covers lines 52-53)", async () => {
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
    });
});
//# sourceMappingURL=configLoader-real-files.test.js.map
