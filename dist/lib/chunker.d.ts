import type {
    ChunkerOptions,
    ChunkingStats,
    ProgressCallback,
} from "../types/index.js";
/**
 * ESLint Chunker - Main orchestrator for chunked ESLint execution
 */
export declare class ESLintChunker {
    private options;
    private logger;
    private fileScanner;
    constructor(options?: ChunkerOptions);
    /**
     * Run ESLint in chunked mode
     */
    run(progressCallback?: ProgressCallback): Promise<ChunkingStats>;
    /**
     * Process all chunks
     */
    private processChunks;
    /**
     * Process a single chunk
     */
    private processChunk;
    /**
     * Create statistics summary
     */
    private createStats;
    /**
     * Log progress for a completed chunk
     */
    private logChunkProgress;
    /**
     * Log final statistics
     */
    private logFinalStats;
    /**
     * Normalize and validate options
     */
    private normalizeOptions;
}
//# sourceMappingURL=chunker.d.ts.map
