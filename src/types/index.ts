/**
 * Configuration options for the ESLint chunker
 */
export interface ChunkerOptions {
    /** Path to ESLint cache file */
    cacheLocation?: string;
    /** Show per-chunk completion logs */
    chunkLogs?: boolean;
    /** Concurrency for processing chunks */
    concurrency?: number;
    /** Path to ESLint config file */
    config?: string;
    /** Continue processing even if a chunk fails */
    continueOnError?: boolean;
    /** Working directory */
    cwd?: string;
    /** Apply fixes to files */
    fix?: boolean;
    /** Types of fixes to apply */
    fixTypes?: ("directive" | "layout" | "problem" | "suggestion")[];
    /** Custom ignore patterns */
    ignore?: string[];
    /** Custom include patterns */
    include?: string[];
    /** Number of ESLint worker processes */
    maxWorkers?: "auto" | "off" | number;
    /** Suppress all non-final output */
    quiet?: boolean;
    /** Number of files per chunk */
    size?: number;
    /** Enable verbose output */
    verbose?: boolean;
    /** Show warnings for ignored files */
    warnIgnored?: boolean;
}

/**
 * Statistics about a chunking run
 */
export interface ChunkingStats {
    /** Number of failed chunks */
    failedChunks: number;
    /** Number of files that were fixed */
    filesFixed: number;
    /** Number of files with errors */
    filesWithErrors: number;
    /** Number of files with warnings */
    filesWithWarnings: number;
    /** Number of chunks processed */
    totalChunks: number;
    /** Total number of files discovered */
    totalFiles: number;
    /** Total processing time in milliseconds */
    totalTime: number;
}

/**
 * Result from processing a single chunk
 */
export interface ChunkResult {
    /** Chunk index */
    chunkIndex: number;
    /** Error message if chunk failed */
    error?: string;
    /** Number of errors in this chunk */
    errorCount: number;
    /** Files in this chunk */
    files: string[];
    /** Number of files fixed in this chunk */
    fixedCount: number;
    /** Processing time for this chunk */
    processingTime: number;
    /** Whether the chunk was successful */
    success: boolean;
    /** Number of warnings in this chunk */
    warningCount: number;
}

/**
 * Config file structure for chunkyLint
 */
export interface ChunkyLintConfig {
    /** Cache directory location */
    cacheLocation?: string;
    /** Show per-chunk completion logs */
    chunkLogs?: boolean;
    /** Number of concurrent chunks to process */
    concurrency?: number;
    /** ESLint configuration file path */
    config?: string;
    /** Continue processing even if errors occur */
    continueOnError?: boolean;
    /** Working directory */
    cwd?: string;
    /** Enable auto-fixing */
    fix?: boolean;
    /** Follow symbolic links */
    followSymlinks?: boolean;
    /** Custom ignore patterns */
    ignore?: string[];
    /** Custom include patterns */
    include?: string[];
    /** Suppress all non-final output */
    quiet?: boolean;
    /** Maximum chunk size (number of files per chunk) */
    size?: number;
    /** Enable verbose logging */
    verbose?: boolean;
}

/**
 * Configuration for file discovery
 */
export interface FileDiscoveryOptions {
    /** ESLint config file path */
    config?: string;
    /** Working directory */
    cwd?: string;
    /** Follow symbolic links */
    followSymlinks?: boolean;
    /** Custom ignore patterns */
    ignore?: string[];
    /** Custom include patterns */
    include?: string[];
}

/**
 * Logger interface
 */
export interface Logger {
    debug: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    verbose: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
}

/**
 * Progress callback function
 */
export type ProgressCallback = (
    processed: number,
    total: number,
    currentChunk: ChunkResult | null
) => void;
