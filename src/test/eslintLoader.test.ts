import { describe, expect, it } from "vitest";

describe("eslintLoader", () => {
    it("loads eslint module when available", async () => {
        const { loadESLintModule } = await import("../lib/eslintLoader.js"),
            eslintModule = await loadESLintModule();

        expect(typeof eslintModule.ESLint).toBe("function");
    });

    it("throws a friendly peer dependency error when eslint is missing", async () => {
        const missingImporter = (): Promise<typeof import("eslint")> =>
                Promise.reject(
                    new Error(
                        "Cannot find package 'eslint' imported from /virtual/test.mjs"
                    )
                ),
            { loadESLintModule } = await import("../lib/eslintLoader.js");

        await expect(loadESLintModule(missingImporter)).rejects.toThrow(
            "Missing peer dependency 'eslint'"
        );
    });

    it("rethrows non-missing-eslint import errors", async () => {
        const failingImporter = (): Promise<typeof import("eslint")> =>
                Promise.reject(new Error("Unexpected eslint loader failure")),
            { loadESLintModule } = await import("../lib/eslintLoader.js");

        await expect(loadESLintModule(failingImporter)).rejects.toThrow(
            "Unexpected eslint loader failure"
        );
    });
});
