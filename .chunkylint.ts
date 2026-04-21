import type { ChunkyLintConfig } from "./src/types/chunky-lint-types.js";

const config: ChunkyLintConfig = {
    cacheLocation: ".chunky-cache-ts",
    concurrency: 1,
    continueOnError: true,
    fix: false,
    include: ["src/**/*.ts"],
    size: 3,
    verbose: true,
};

export default config;
