import type { ChunkyLintConfig } from "../types/index.js";
/**
 * Load configuration from a config file
 * @param configPath - Path to the config file (optional, will search if not provided)
 * @param cwd - Working directory to search for config files
 * @returns Configuration object or null if no config found
 */
export declare function loadConfig(
    configPath?: string,
    cwd?: string
): Promise<ChunkyLintConfig | null>;
/**
 * Merge configuration with CLI options
 * CLI options take precedence over config file options
 * @param config - Configuration from file
 * @param cliOptions - Options from CLI
 * @returns Merged configuration
 */
export declare function mergeConfig(
    config: ChunkyLintConfig,
    cliOptions: Partial<ChunkyLintConfig>
): ChunkyLintConfig;
//# sourceMappingURL=configLoader.d.ts.map
