import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            all: true,
            exclude: [
                "**/dist/**",
                "**/node_modules/**",
                "**/*.test.ts",
                "**/*.spec.ts",
                "**/tests/**",
                "**/coverage/**",
                "**/*.config.*",
                "**/bin/**",
                "**/types/**",
            ],
            include: ["src/**/*.ts"],
            provider: "v8",
            reporter: [
                "text",
                "json",
                "html",
                "lcov",
            ],
            reportsDirectory: "./coverage",
        },
        environment: "node",
        exclude: [
            "dist/**",
            "node_modules/**",
            "coverage/**",
        ],
        globals: true,
        include: ["src/test/**/*.test.ts"],
        watch: false,
    },
});
