import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "@eslint/config-helpers";
import tseslint from "typescript-eslint";
import prettierEslintDisables from "eslint-config-prettier";
import progress from "eslint-plugin-file-progress-2";
import path from "path";
import { fileURLToPath } from "url";

export default defineConfig([
    globalIgnores(["**/CHANGELOG.md"]),
    eslint.configs.all,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        name: "progress",
        plugins: {
            "file-progress": progress,
        },
        rules: {
            "file-progress/activate": "warn",
        },
        settings: {
            progress: {
                hide: false, // hide progress output (useful in CI)
                hideFileName: false, // show generic "Linting..." instead of file names
                hidePrefix: false, // hide plugin prefix text before progress/summary output
                hideDirectoryNames: false, // show only the filename (no directory path segments)
                fileNameOnNewLine: true, // place filename on a second line under the linting prefix
                successMessage: "Lint done...",
                detailedSuccess: false, // show multi-line final summary (duration, file count, exit code)
                spinnerStyle: "dots", // line | dots | arc | bounce | clock
                prefixMark: "•", // marker after plugin name prefix in progress lines
                successMark: "✔", // custom mark used for success completion
                failureMark: "✖", // custom mark used for failure completion
            },
        },
    },
    // Global TypeScript config for all .ts/.tsx files
    {
        files: ["**/*.ts", "**/*.tsx"],
        ignores: [
            "node_modules/**",
            "dist/**",
            "coverage/**",
            ".github/chatmodes/**",
        ],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                project: ["tsconfig.json", "tsconfig.test.json"],
                tsconfigRootDir: path.resolve(
                    path.dirname(fileURLToPath(import.meta.url))
                ),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
    },
    {
        files: ["src/**/*.ts"],
        ignores: ["src/**/*.test.ts", "src/**/*.spec.ts"],
        languageOptions: {
            globals: {
                document: "readonly",
                globalThis: "readonly",
                NodeJS: "readonly",
                window: "readonly",
            },
            parser: tseslint.parser,
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/explicit-function-return-type": "warn",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/prefer-nullish-coalescing": "error",
            "@typescript-eslint/prefer-optional-chain": "error",
            "no-inline-comments": "off",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-ternary": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-console": "off",
            "@typescript-eslint/no-magic-numbers": "off",
            "no-void": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "sort-keys": "off",
            "sort-vars": "off",
            "max-statements": "off",
            "max-lines-per-function": "off",
            "max-lines": "off",
        },
    },
    {
        // Test files with basic rules only
        files: ["src/**/*.test.ts", "src/**/*.spec.ts"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                project: ["tsconfig.json", "tsconfig.test.json"],
                tsconfigRootDir: path.resolve(
                    path.dirname(fileURLToPath(import.meta.url))
                ),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/explicit-function-return-type": "warn",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/prefer-nullish-coalescing": "error",
            "@typescript-eslint/prefer-optional-chain": "error",
            "no-inline-comments": "off",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-ternary": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-console": "off",
            "@typescript-eslint/no-magic-numbers": "off",
            "no-void": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "sort-keys": "off",
            "sort-vars": "off",
            "max-statements": "off",
            "max-lines-per-function": "off",
            "max-lines": "off",
        },
    },
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            "*.js",
            "*.mjs",
            "examples/**",
        ],
    },
    prettierEslintDisables,
]);
