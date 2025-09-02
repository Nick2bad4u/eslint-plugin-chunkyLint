/**
 * ESLint Chunker - Auto-chunking ESLint runner with incremental cache updates
 *
 * @example
 * ```typescript
 * import { ESLintChunker } from 'eslint-chunker';
 *
 * const chunker = new ESLintChunker({
 *   size: 150,
 *   cacheLocation: '.cache/.eslintcache',
 *   fix: true,
 *   verbose: true
 * });
 *
 * const stats = await chunker.run();
 * console.log(`Processed ${stats.totalFiles} files in ${stats.totalChunks} chunks`);
 * ```
 */
export { ESLintChunker } from "./lib/chunker.js";
export { FileScanner } from "./lib/fileScanner.js";
export { ConsoleLogger } from "./lib/logger.js";
export type {
    ChunkerOptions,
    ChunkingStats,
    ChunkResult,
    FileDiscoveryOptions,
    ProgressCallback,
    Logger,
} from "./types/index.js";
/**
 * Default export for convenience
 */
import { ESLintChunker } from "./lib/chunker.js";
export default ESLintChunker;
//# sourceMappingURL=index.d.ts.map
