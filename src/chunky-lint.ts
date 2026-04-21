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

import { ESLintChunker as InternalESLintChunker } from "./lib/chunker.js";
import { FileScanner as InternalFileScanner } from "./lib/file-scanner.js";
import { ConsoleLogger as InternalConsoleLogger } from "./lib/logger.js";

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
 * Console logger implementation used by the chunker runtime.
 */
export class ConsoleLogger extends InternalConsoleLogger {}

/**
 * ESLint chunking orchestrator.
 */
export class ESLintChunker extends InternalESLintChunker {}

/**
 * File discovery and chunking utility.
 */
export class FileScanner extends InternalFileScanner {}

/**
 * Default export for convenience.
 */
export default ESLintChunker;
