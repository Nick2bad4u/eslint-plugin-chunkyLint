import { promises as fs } from "node:fs";
import * as path from "node:path";
import { isEmpty, safeCastTo } from "ts-extras";
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
import { describe, expect, it } from "vitest";

import { loadConfig } from "../lib/config-loader.js";

describe("configLoader Coverage Tests - Missing Lines", () => {
    const projectDir = path.join(process.cwd(), "temp-config-coverage");

    const ensureDir = async (): Promise<void> => {
        await fs.mkdir(projectDir, { recursive: true });
    };

    const cleanDir = async (): Promise<void> => {
        const entries = await fs
            .readdir(projectDir)
            .catch(() => safeCastTo<string[]>([]));
        if (isEmpty(entries)) return;
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

    const withProjectDir = async (run: () => Promise<void>): Promise<void> => {
        await ensureDir();
        try {
            await run();
        } finally {
            await cleanDir();
        }
    };

    it("returns null when no config file found during auto-discovery", async () => {
        expect.hasAssertions();

        await withProjectDir(async () => {
            const result = await loadConfig(undefined, projectDir);

            expect(result).toBeNull();
        });
    });

    it("loads async function config (.chunkylint.js)", async () => {
        expect.hasAssertions();

        await withProjectDir(async () => {
            const file = path.join(projectDir, ".chunkylint.js");
            await fs.writeFile(
                file,
                "export default async () => ({ size: 100, verbose: true });\n",
                "utf8"
            );
            const result = await loadConfig(undefined, projectDir);

            expect(result).toMatchObject({ size: 100, verbose: true });
        });
    });

    it("propagates error from throwing function (throwConfig.js)", async () => {
        expect.hasAssertions();

        await withProjectDir(async () => {
            const file = path.join(projectDir, "throwConfig.js");
            await fs.writeFile(
                file,
                "export default () => { throw new Error('Config function failed'); };\n",
                "utf8"
            );

            await expect(
                loadConfig("throwConfig.js", projectDir)
            ).rejects.toThrow(/Config function failed/v);
        });
    });

    it("rejects invalid function return (invalidConfig.mjs)", async () => {
        expect.hasAssertions();

        await withProjectDir(async () => {
            const file = path.join(projectDir, "invalidConfig.mjs");
            await fs.writeFile(
                file,
                "export default async () => ({ size: 'invalid' });\n",
                "utf8"
            );

            await expect(
                loadConfig("invalidConfig.mjs", projectDir)
            ).rejects.toThrow(/size must be a positive integer/v);
        });
    });

    it("loads plain object default export (objectConfig.mjs)", async () => {
        expect.hasAssertions();

        await withProjectDir(async () => {
            const file = path.join(projectDir, "objectConfig.mjs");
            await fs.writeFile(
                file,
                "export default { size: 50, concurrency: 2 };\n",
                "utf8"
            );
            const result = await loadConfig("objectConfig.mjs", projectDir);

            expect(result).toMatchObject({ concurrency: 2, size: 50 });
        });
    });

    it("loads named exports only when no default (namedOnly.js)", async () => {
        expect.hasAssertions();

        await withProjectDir(async () => {
            const file = path.join(projectDir, "namedOnly.js");
            await fs.writeFile(
                file,
                "export const size = 75; export const verbose = false;\n",
                "utf8"
            );
            const result = await loadConfig("namedOnly.js", projectDir);

            expect(result).toMatchObject({ size: 75, verbose: false });
        });
    });
});
