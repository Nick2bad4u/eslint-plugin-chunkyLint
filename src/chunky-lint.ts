/**
 * ESLint Chunker - Auto-chunking ESLint runner with incremental cache updates.
 *
 * @example
 *
 * ```typescript
 * import { ESLintChunker } from "eslint-chunker";
 *
 * const chunker = new ESLintChunker({
 *     size: 150,
 *     cacheLocation: ".cache/.eslintcache",
 *     fix: true,
 *     verbose: true,
 * });
 *
 * const stats = await chunker.run();
 * ```
 */

import type {
    ChunkerOptions as ChunkerOptionsType,
    ChunkingStats as ChunkingStatsType,
    ChunkResult as ChunkResultType,
    FileDiscoveryOptions as FileDiscoveryOptionsType,
    Logger as LoggerType,
    ProgressCallback as ProgressCallbackType,
} from "./types/chunky-lint-types.js";

import { ESLintChunker } from "./lib/chunker.js";

export { ESLintChunker } from "./lib/chunker.js";
export { FileScanner } from "./lib/file-scanner.js";
export { ConsoleLogger } from "./lib/logger.js";

/**
 * Chunker options contract.
 */
export type ChunkerOptions = ChunkerOptionsType;

/**
 * Chunker summary statistics.
 */
export type ChunkingStats = ChunkingStatsType;

/**
 * Result for a single processed chunk.
 */
export type ChunkResult = ChunkResultType;

/**
 * File discovery options contract.
 */
export type FileDiscoveryOptions = FileDiscoveryOptionsType;

/**
 * Logger interface used by runtime components.
 */
export type Logger = LoggerType;

/**
 * Progress callback signature.
 */
export type ProgressCallback = ProgressCallbackType;

/**
 * Default export for convenience.
 */
export default ESLintChunker;
