import type { ChunkyLintConfig } from "./src/types/index.js";

const config: ChunkyLintConfig = {
    size: 3,
    concurrency: 1,
    verbose: true,
    cacheLocation: ".chunky-cache-ts",
    fix: false,
    continueOnError: true,
    include: ["src/**/*.ts"],
};

export default config;
