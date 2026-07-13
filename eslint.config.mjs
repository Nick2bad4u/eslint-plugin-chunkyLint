import nickTwoBadFourU from "eslint-config-nick2bad4u";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nickTwoBadFourU.createConfig({
        plugins: {
            "test-signal": false,
        },
        rootDirectory,
        tsconfigPaths: [
            "./tsconfig.eslint.json",
            "./tsconfig.js.json",
            "./tsconfig.test.json",
        ],
    }),

    {
        files: ["**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}"],
        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.eslint.json"],
                projectService: false,
                tsconfigRootDir: rootDirectory,
            },
        },
        name: "chunkylint/typed-eslint-project",
        rules: {
            "unicorn/consistent-class-member-order": "off",
        },
    },
    {
        files: ["eslint.config.mjs"],
        name: "chunkylint/eslint-config-node20",
        rules: {
            // Git-cliff is configured through the shared package referenced by package scripts.
            "repo-compliance/require-release-config-file": "off",
            "unicorn/prefer-import-meta-properties": "off",
        },
    },
    {
        files: ["cliff.toml", "lychee.toml"],
        name: "chunkylint/tool-specific-toml-config-compatibility",
        rules: {
            // Keep these files in the syntax their owning tools accept.
            "tombi/tombi": "off",
        },
    },
    {
        files: ["src/chunky-lint.ts"],
        name: "chunkylint/public-entrypoint",
        rules: {
            "canonical/no-re-export": "off",
            "no-barrel-files/no-barrel-files": "off",
            "unicorn/prefer-export-from": "off",
        },
    },
    {
        files: ["src/test/logger.test.ts", "src/test/types.test.ts"],
        name: "chunkylint/logger-debug-tests",
        rules: {
            "testing-library/no-debugging-utils": "off",
        },
    },
];

export default config;
