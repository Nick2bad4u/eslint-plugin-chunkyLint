import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierRecommended from "eslint-config-prettier";
import path from "path";
import { fileURLToPath } from "url";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { importX } from "eslint-plugin-import-x";

export default [
    eslint.configs.all,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    importX.flatConfigs.typescript,
    prettierRecommended,
    // Global TypeScript config for all .ts/.tsx files
    {
        files: ["**/*.ts", "**/*.tsx"],
        ignores: ["node_modules/**", "dist/**", "coverage/**"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                project: ["tsconfig.json"],
                tsconfigRootDir: path.resolve(
                    path.dirname(fileURLToPath(import.meta.url))
                ),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
    },
    {
        settings: {
            "import-x/resolver": {
                node: true,
            },
            "import-x/resolver-next": [
                createTypeScriptImportResolver({
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    bun: true, // Resolve Bun modules (https://github.com/import-js/eslint-import-resolver-typescript#bun)
                    noWarnOnMultipleProjects: true, // Don't warn about multiple projects
                    // Use an array
                    project: "tsconfig.json",
                }),
            ],
            react: { version: "19" },
        },
    },
    {
        settings: {
            "import-x/resolver": {
                node: true,
                project: ["tsconfig.json"],
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["tsconfig.json"],
                },
            },
        },
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
                project: ["tsconfig.json"],
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
        ignores: ["dist/**", "node_modules/**", "*.js", "*.mjs", "examples/**"],
    },
];
