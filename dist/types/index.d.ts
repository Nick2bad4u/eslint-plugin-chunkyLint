/**
 * Configuration options for the ESLint chunker
 */
export interface ChunkerOptions {
    /** Path to ESLint config file */
    config?: string;
    /** Number of files per chunk */
    size?: number;
    /** Path to ESLint cache file */
    cacheLocation?: string;
    /** Number of ESLint worker processes */
    maxWorkers?: number | "auto" | "off";
    /** Continue processing even if a chunk fails */
    continueOnError?: boolean;
    /** Apply fixes to files */
    fix?: boolean;
    /** Types of fixes to apply */
    fixTypes?: Array<"directive" | "problem" | "suggestion" | "layout">;
    /** Show warnings for ignored files */
    warnIgnored?: boolean;
    /** Custom include patterns */
    include?: string[];
    /** Custom ignore patterns */
    ignore?: string[];
    /** Working directory */
    cwd?: string;
    /** Enable verbose output */
    verbose?: boolean;
    /** Concurrency for processing chunks */
    concurrency?: number;
}
/**
 * Statistics about a chunking run
 */
export interface ChunkingStats {
    /** Total number of files discovered */
    totalFiles: number;
    /** Number of chunks processed */
    totalChunks: number;
    /** Total processing time in milliseconds */
    totalTime: number;
    /** Number of files with errors */
    filesWithErrors: number;
    /** Number of files with warnings */
    filesWithWarnings: number;
    /** Number of files that were fixed */
    filesFixed: number;
    /** Number of failed chunks */
    failedChunks: number;
}
/**
 * Result from processing a single chunk
 */
export interface ChunkResult {
    /** Chunk index */
    chunkIndex: number;
    /** Files in this chunk */
    files: string[];
    /** Whether the chunk was successful */
    success: boolean;
    /** Error message if chunk failed */
    error?: string;
    /** Processing time for this chunk */
    processingTime: number;
    /** Number of errors in this chunk */
    errorCount: number;
    /** Number of warnings in this chunk */
    warningCount: number;
    /** Number of files fixed in this chunk */
    fixedCount: number;
}
/**
 * Configuration for file discovery
 */
export interface FileDiscoveryOptions {
    /** ESLint config file path */
    config?: string;
    /** Working directory */
    cwd?: string;
    /** Custom include patterns */
    include?: string[];
    /** Custom ignore patterns */
    ignore?: string[];
    /** Follow symbolic links */
    followSymlinks?: boolean;
}
/**
 * Progress callback function
 */
export type ProgressCallback = (
    processed: number,
    total: number,
    currentChunk: ChunkResult | null
) => void;
/**
 * Config file structure for chunkyLint
 */
export interface ChunkyLintConfig {
    /** ESLint configuration file path */
    config?: string;
    /** Working directory */
    cwd?: string;
    /** Custom include patterns */
    include?: string[];
    /** Custom ignore patterns */
    ignore?: string[];
    /** Follow symbolic links */
    followSymlinks?: boolean;
    /** Maximum chunk size (number of files per chunk) */
    size?: number;
    /** Number of concurrent chunks to process */
    concurrency?: number;
    /** Enable verbose logging */
    verbose?: boolean;
    /** Cache directory location */
    cacheLocation?: string;
    /** Enable auto-fixing */
    fix?: boolean;
    /** Continue processing even if errors occur */
    continueOnError?: boolean;
}
/**
 * Logger interface
 */
export interface Logger {
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
    verbose(message: string, ...args: unknown[]): void;
}
//# sourceMappingURL=index.d.ts.map
