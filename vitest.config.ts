import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        watch: false,
        environment: "node",
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html", "lcov"],
            include: ["src/**/*.ts"],
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
            reportsDirectory: "./coverage",
            all: true,
        },
    },
});
