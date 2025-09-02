#!/usr/bin/env node

/**
 * Example script showing how to use ESLint Chunker programmatically
 */

import { ESLintChunker } from "../dist/index.js";

async function main() {
    console.log("🚀 ESLint Chunker - Programmatic Example\n");

    try {
        // Create chunker with custom options
        const chunker = new ESLintChunker({
            size: 5,
            cacheLocation: ".custom-eslintcache",
            verbose: true,
            continueOnError: true,
            include: ["src/**/*.ts"],
        });

        // Run with progress callback
        const stats = await chunker.run((processed, total, currentChunk) => {
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
        });

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

main();
