import { describe, expect, it } from "vitest";

import type { ESLintModule } from "../lib/eslint-loader.js";

describe("eslintLoader", () => {
    it("loads eslint module when available", async () => {
        expect.hasAssertions();

        const { loadESLintModule } = await import("../lib/eslint-loader.js"),
            eslintModule = await loadESLintModule();

        expect(eslintModule.ESLint).toBeTypeOf("function");
    });

    it("throws a friendly peer dependency error when eslint is missing", async () => {
        expect.hasAssertions();

        const missingImporter = (): Promise<ESLintModule> =>
                Promise.reject(
                    new Error(
                        "Cannot find package 'eslint' imported from /virtual/test.mjs"
                    )
                ),
            { loadESLintModule } = await import("../lib/eslint-loader.js");

        await expect(loadESLintModule(missingImporter)).rejects.toThrow(
            "Missing peer dependency 'eslint'"
        );
    });

    it("rethrows non-missing-eslint import errors", async () => {
        expect.hasAssertions();

        const failingImporter = (): Promise<ESLintModule> =>
                Promise.reject(new Error("Unexpected eslint loader failure")),
            { loadESLintModule } = await import("../lib/eslint-loader.js");

        await expect(loadESLintModule(failingImporter)).rejects.toThrow(
            "Unexpected eslint loader failure"
        );
    });
});
