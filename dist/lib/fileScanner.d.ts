import type { FileDiscoveryOptions, Logger } from "../types/index.js";
/**
 * File scanner that discovers files to lint based on ESLint configuration
 */
export declare class FileScanner {
    private logger;
    constructor(logger: Logger);
    /**
     * Scan and discover files to lint
     */
    scanFiles(options?: FileDiscoveryOptions): Promise<string[]>;
    /**
     * Get ignore patterns from ESLint configuration
     */
    private getESLintIgnorePatterns;
    /**
     * Filter out files that ESLint would ignore
     */
    private filterIgnoredFiles;
    /**
     * Split files into chunks
     */
    chunkFiles(files: string[], chunkSize: number): string[][];
}
//# sourceMappingURL=fileScanner.d.ts.map