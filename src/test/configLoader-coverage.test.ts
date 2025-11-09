/*
 * Focused coverage tests to exercise branches not touched by primary spec:
 *  - Auto discovery returning null
 *  - Async function default export
 *  - Throwing function default export (error path propagation)
 *  - Invalid function return triggering validation error
 *  - Plain object default export
 *  - Named exports only (no default)
 *
 * These tests intentionally avoid mocking core modules to prevent cross-test
 * contamination seen previously. Real temporary files are written then cleaned.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import { loadConfig } from "../lib/configLoader.js";
import path from "path";

describe("ConfigLoader Coverage Tests - Missing Lines", () => {
    const projectDir = path.join(process.cwd(), "temp-config-coverage");

    const ensureDir = async (): Promise<void> => {
        await fs.mkdir(projectDir, { recursive: true });
    };

    const cleanDir = async (): Promise<void> => {
        const entries = await fs
            .readdir(projectDir)
            .catch(() => [] as string[]);
        if (entries.length === 0) return;
        await Promise.all(
            entries.map(async (entry) => {
                const fp = path.join(projectDir, entry);
                try {
                    await fs.unlink(fp);
                } catch {
                    // Ignore
                }
            })
        );
    };

    beforeAll(async () => {
        await ensureDir();
    });

    afterAll(async () => {
        await cleanDir();
    });

    it("returns null when no config file found during auto-discovery", async () => {
        const result = await loadConfig(undefined, projectDir);
        expect(result).toBeNull();
    });

    it("loads async function config (.chunkylint.js)", async () => {
        const file = path.join(projectDir, ".chunkylint.js");
        await fs.writeFile(
            file,
            "export default async () => ({ size: 100, verbose: true });\n",
            "utf-8"
        );
        const result = await loadConfig(undefined, projectDir);
        expect(result).toMatchObject({ size: 100, verbose: true });
    });

    it("propagates error from throwing function (throwConfig.js)", async () => {
        const file = path.join(projectDir, "throwConfig.js");
        await fs.writeFile(
            file,
            "export default () => { throw new Error('Config function failed'); };\n",
            "utf-8"
        );
        await expect(loadConfig("throwConfig.js", projectDir)).rejects.toThrow(
            /Config function failed/u
        );
    });

    it("rejects invalid function return (invalidConfig.mjs)", async () => {
        const file = path.join(projectDir, "invalidConfig.mjs");
        await fs.writeFile(
            file,
            "export default async () => ({ size: 'invalid' });\n",
            "utf-8"
        );
        await expect(
            loadConfig("invalidConfig.mjs", projectDir)
        ).rejects.toThrow(/size must be a positive integer/u);
    });

    it("loads plain object default export (objectConfig.mjs)", async () => {
        const file = path.join(projectDir, "objectConfig.mjs");
        await fs.writeFile(
            file,
            "export default { size: 50, concurrency: 2 };\n",
            "utf-8"
        );
        const result = await loadConfig("objectConfig.mjs", projectDir);
        expect(result).toMatchObject({ size: 50, concurrency: 2 });
    });

    it("loads named exports only when no default (namedOnly.js)", async () => {
        // Ensure any earlier file removed
        await cleanDir();
        const file = path.join(projectDir, "namedOnly.js");
        await fs.writeFile(
            file,
            "export const size = 75; export const verbose = false;\n",
            "utf-8"
        );
        const result = await loadConfig("namedOnly.js", projectDir);
        expect(result).toMatchObject({ size: 75, verbose: false });
    });
});
