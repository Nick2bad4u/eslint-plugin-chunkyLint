#!/usr/bin/env node

/**
 * Example script showing how to use ESLint Chunker programmatically.
 *
 * @typedef {import("../src/chunky-lint.ts").ChunkerOptions} ChunkerOptions
 *
 * @typedef {import("../src/chunky-lint.ts").ChunkResult} ChunkResult
 */

import process from "node:process";
async function main() {
    console.log("🚀 ESLint Chunker - Programmatic Example\n");

    try {
        const { ESLintChunker } = await import("../dist/chunky-lint.js");

        // Create chunker with custom options
        const chunker = new ESLintChunker({
            cacheLocation: ".custom-eslintcache",
            continueOnError: true,
            include: ["src/**/*.ts"],
            size: 5,
            verbose: true,
        });

        /**
         * @param {number} processed
         * @param {number} total
         * @param {null | Readonly<ChunkResult>} currentChunk
         */
        const onProgress = (processed, total, currentChunk) => {
            const percentage = Math.round((processed / total) * 100);
            console.log(
                `📊 Progress: ${processed}/${total} chunks (${percentage}%)`
            );

            if (currentChunk) {
                if (currentChunk.success) {
                    console.log(
                        `   ✅ Chunk ${currentChunk.chunkIndex + 1}: ${currentChunk.files.length} files`
                    );
                } else {
                    console.log(
                        `   ❌ Chunk ${currentChunk.chunkIndex + 1}: FAILED - ${currentChunk.error}`
                    );
                }
            }
        };

        // Run with progress callback
        const stats = await chunker.run(onProgress);

        // Display final statistics
        console.log("\n📈 Final Statistics:");
        console.log(`   📁 Total files: ${stats.totalFiles}`);
        console.log(`   📦 Total chunks: ${stats.totalChunks}`);
        console.log(`   ⏱️  Total time: ${Math.round(stats.totalTime)}ms`);
        console.log(`   ❌ Files with errors: ${stats.filesWithErrors}`);
        console.log(`   ⚠️  Files with warnings: ${stats.filesWithWarnings}`);
        console.log(`   🔧 Files fixed: ${stats.filesFixed}`);
        console.log(`   💥 Failed chunks: ${stats.failedChunks}`);

        if (stats.failedChunks > 0) {
            console.log("\n⚠️  Some chunks failed, but processing continued");
            process.exit(1);
        } else {
            console.log("\n✅ All chunks processed successfully!");
        }
    } catch (error) {
        console.error(
            "❌ Error:",
            error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
    }
}

await main();
