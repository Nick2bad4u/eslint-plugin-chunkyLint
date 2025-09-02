import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierRecommended from "eslint-config-prettier";

export default [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettierRecommended,
    {
        files: ["src/**/*.ts"],
        ignores: ["src/**/*.test.ts", "src/**/*.spec.ts"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
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
        },
    },
    {
        // Test files with basic rules only
        files: ["src/**/*.test.ts", "src/**/*.spec.ts"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
    {
        ignores: ["dist/**", "node_modules/**", "*.js", "*.mjs", "examples/**"],
    },
];
