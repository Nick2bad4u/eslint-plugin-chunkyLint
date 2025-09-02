import { describe, it, expect } from "vitest";
import { mergeConfig } from "../lib/configLoader.js";
import type { ChunkyLintConfig } from "../types/index.js";

describe("ConfigLoader", () => {
    describe("mergeConfig", () => {
        const baseConfig: ChunkyLintConfig = {
            size: 5,
            concurrency: 1,
            verbose: false,
            cacheLocation: ".cache",
            fix: false,
            continueOnError: false,
            include: ["src/**/*.js"],
        };

        it("should merge configs with CLI taking precedence", () => {
            const cliConfig: Partial<ChunkyLintConfig> = {
                size: 10,
                verbose: true,
                include: ["src/**/*.ts"],
            };

            const result = mergeConfig(baseConfig, cliConfig);

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
            const cliConfig: Partial<ChunkyLintConfig> = {
                size: 10,
                verbose: undefined,
                include: ["src/**/*.ts"],
            };

            const result = mergeConfig(baseConfig, cliConfig);

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
            const cliConfig: Partial<ChunkyLintConfig> = {
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
            };

            const result = mergeConfig(baseConfig, cliConfig);

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
            const cliConfig: Partial<ChunkyLintConfig> = {
                size: 20,
                fix: true,
            };

            const result = mergeConfig(baseConfig, cliConfig);

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
    });
});
