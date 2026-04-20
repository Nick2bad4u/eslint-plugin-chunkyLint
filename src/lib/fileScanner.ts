 
import type { ESLint } from "eslint";

import fg from "fast-glob";
import { resolve } from "node:path";
import { safeCastTo } from "ts-extras";

import type { FileDiscoveryOptions, Logger } from "../types/index.js";

import { loadESLintModule } from "./eslintLoader.js";

/**
 * Default include patterns for common file extensions
 */
const /**
     * Default ignore patterns
     */
    DEFAULT_IGNORE_PATTERNS = [
        "node_modules/**",
        "dist/**",
        "build/**",
        "coverage/**",
        ".git/**",
        "**/*.min.js",
        "**/*.bundle.js",
    ],
    DEFAULT_INCLUDE_PATTERNS = [
        "**/*.js",
        "**/*.jsx",
        "**/*.ts",
        "**/*.tsx",
        "**/*.mjs",
        "**/*.cjs",
        "**/*.vue",
    ];

/**
 * File scanner that discovers files to lint based on ESLint configuration
 */
export class FileScanner {
    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    /**
     * Split files into chunks
     */
    chunkFiles(files: string[], chunkSize: number): string[][] {
        if (chunkSize <= 0) {
            throw new Error("Chunk size must be greater than 0");
        }

        const chunks: string[][] = [];
        for (let index = 0; index < files.length; index += chunkSize) {
            chunks.push(files.slice(index, index + chunkSize));
        }

        this.logger.debug(
            `Split ${files.length.toString()} files into ${chunks.length.toString()} chunks of ~${chunkSize.toString()} files each`
        );

        return chunks;
    }

    /**
     * Scan and discover files to lint
     */
    async scanFiles(options: FileDiscoveryOptions = {}): Promise<string[]> {
        const {
            config,
            cwd = process.cwd(),
            followSymlinks = false,
            ignore = DEFAULT_IGNORE_PATTERNS,
            include = DEFAULT_INCLUDE_PATTERNS,
        } = options;

        this.logger.verbose("Starting file discovery...");
        this.logger.debug("Discovery options:", {
            config: config ?? "auto-detect (ESLint default)",
            cwd,
            ignore,
            include,
        });

        try {
            const { ESLint } = await loadESLintModule();

            // Create ESLint instance to get configuration
            const eslintOptions: ESLint.Options = {
                cwd,
                ignore: true,
            };

            // Only set overrideConfigFile if config is explicitly provided
            if (config) {
                eslintOptions.overrideConfigFile = config;
            }

            const eslint = new ESLint(eslintOptions),
                // Get ignore patterns from ESLint configuration
                eslintIgnorePatterns = await this.getESLintIgnorePatterns(
                    eslint,
                    cwd
                ),
                // Combine ignore patterns
                allIgnorePatterns = [...ignore, ...eslintIgnorePatterns].filter(
                    Boolean
                );

            this.logger.debug("Combined ignore patterns:", allIgnorePatterns);

            // Use fast-glob to find files
            const files = await fg(include, {
                    absolute: true,
                    cwd,
                    followSymbolicLinks: followSymlinks,
                    ignore: allIgnorePatterns,
                    onlyFiles: true,
                    suppressErrors: false,
                }),
                // Filter out files that ESLint would ignore
                filteredFiles = await this.filterIgnoredFiles(eslint, files);

            this.logger.info(
                `Discovered ${filteredFiles.length.toString()} files to lint (${(
                    files.length - filteredFiles.length
                ).toString()} ignored)`
            );
            this.logger.verbose("Files found:", filteredFiles);

            return filteredFiles;
        } catch (error) {
            this.logger.error("Error during file discovery:", error);
            throw new Error(
                `File discovery failed: ${
                    error instanceof Error ? error.message : String(error)
                }`,
                { cause: error }
            );
        }
    }

    /**
     * Filter out files that ESLint would ignore
     */
    private async filterIgnoredFiles(
        eslint: ESLint,
        files: string[]
    ): Promise<string[]> {
        const filteredFiles: string[] = [];

        /* eslint-disable no-await-in-loop */
        for (const file of files) {
            try {
                const isIgnored = await eslint.isPathIgnored(file);
                if (isIgnored) {
                    this.logger.verbose(`File ignored by ESLint: ${file}`);
                } else {
                    filteredFiles.push(file);
                }
            } catch (error) {
                // If we can't determine if a file is ignored, include it
                this.logger.debug(
                    `Could not check if file is ignored: ${file}`,
                    error
                );
                filteredFiles.push(file);
            }
        }
        /* eslint-enable no-await-in-loop */

        return filteredFiles;
    }

    /**
     * Get ignore patterns from ESLint configuration
     */
    private async getESLintIgnorePatterns(
        eslint: ESLint,
        cwd: string
    ): Promise<string[]> {
        try {
            // Try to get ignore patterns from a sample file
            const sampleFile = resolve(cwd, "package.json");
             
            const config = await eslint.calculateConfigForFile(sampleFile);
             

            // Extract ignore patterns from config
            const ignorePatterns: string[] = [];

            // Check for ignorePatterns in config
            if (
                config &&
                typeof config === "object" &&
                "ignorePatterns" in config
            ) {
                const patterns = (safeCastTo<{ ignorePatterns?: string[] }>(config))
                    .ignorePatterns;
                if (Array.isArray(patterns)) {
                    ignorePatterns.push(...patterns);
                }
            }

            return ignorePatterns;
        } catch (error) {
            this.logger.debug(
                "Could not extract ignore patterns from ESLint config:",
                error
            );
            return [];
        }
    }
}
