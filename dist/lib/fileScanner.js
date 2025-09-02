import { ESLint } from "eslint";
import fg from "fast-glob";
import { resolve } from "path";
/**
 * Default include patterns for common file extensions
 */
const DEFAULT_INCLUDE_PATTERNS = [
    "**/*.js",
    "**/*.jsx",
    "**/*.ts",
    "**/*.tsx",
    "**/*.mjs",
    "**/*.cjs",
    "**/*.vue",
];
/**
 * Default ignore patterns
 */
const DEFAULT_IGNORE_PATTERNS = [
    "node_modules/**",
    "dist/**",
    "build/**",
    "coverage/**",
    ".git/**",
    "**/*.min.js",
    "**/*.bundle.js",
];
/**
 * File scanner that discovers files to lint based on ESLint configuration
 */
export class FileScanner {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Scan and discover files to lint
     */
    async scanFiles(options = {}) {
        const {
            config,
            cwd = process.cwd(),
            include = DEFAULT_INCLUDE_PATTERNS,
            ignore = DEFAULT_IGNORE_PATTERNS,
            followSymlinks = false,
        } = options;
        this.logger.verbose("Starting file discovery...");
        this.logger.debug("Discovery options:", {
            config,
            cwd,
            include,
            ignore,
        });
        try {
            // Create ESLint instance to get configuration
            const eslintOptions = {
                cwd,
                ignore: true,
            };
            // Only set overrideConfigFile if config is explicitly provided
            if (config) {
                eslintOptions.overrideConfigFile = config;
            }
            const eslint = new ESLint(eslintOptions);
            // Get ignore patterns from ESLint configuration
            const eslintIgnorePatterns = await this.getESLintIgnorePatterns(
                eslint,
                cwd
            );
            // Combine ignore patterns
            const allIgnorePatterns = [
                ...ignore,
                ...eslintIgnorePatterns,
            ].filter(Boolean);
            this.logger.debug("Combined ignore patterns:", allIgnorePatterns);
            // Use fast-glob to find files
            const files = await fg(include, {
                cwd,
                absolute: true,
                ignore: allIgnorePatterns,
                followSymbolicLinks: followSymlinks,
                onlyFiles: true,
                suppressErrors: false,
            });
            // Filter out files that ESLint would ignore
            const filteredFiles = await this.filterIgnoredFiles(eslint, files);
            this.logger.info(
                `Discovered ${filteredFiles.length} files to lint (${files.length - filteredFiles.length} ignored)`
            );
            this.logger.verbose("Files found:", filteredFiles);
            return filteredFiles;
        } catch (error) {
            this.logger.error("Error during file discovery:", error);
            throw new Error(
                `File discovery failed: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
    /**
     * Get ignore patterns from ESLint configuration
     */
    async getESLintIgnorePatterns(eslint, cwd) {
        try {
            // Try to get ignore patterns from a sample file
            const sampleFile = resolve(cwd, "package.json");
            const config = await eslint.calculateConfigForFile(sampleFile);
            // Extract ignore patterns from config
            const ignorePatterns = [];
            // Check for ignorePatterns in config
            if (
                config &&
                typeof config === "object" &&
                "ignorePatterns" in config
            ) {
                const patterns = config.ignorePatterns;
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
    /**
     * Filter out files that ESLint would ignore
     */
    async filterIgnoredFiles(eslint, files) {
        const filteredFiles = [];
        for (const file of files) {
            try {
                const isIgnored = await eslint.isPathIgnored(file);
                if (!isIgnored) {
                    filteredFiles.push(file);
                } else {
                    this.logger.verbose(`File ignored by ESLint: ${file}`);
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
        return filteredFiles;
    }
    /**
     * Split files into chunks
     */
    chunkFiles(files, chunkSize) {
        if (chunkSize <= 0) {
            throw new Error("Chunk size must be greater than 0");
        }
        const chunks = [];
        for (let i = 0; i < files.length; i += chunkSize) {
            chunks.push(files.slice(i, i + chunkSize));
        }
        this.logger.debug(
            `Split ${files.length} files into ${chunks.length} chunks of ~${chunkSize} files each`
        );
        return chunks;
    }
}
//# sourceMappingURL=fileScanner.js.map
