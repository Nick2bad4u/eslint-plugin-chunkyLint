# ESLint Chunker

🚀 **Auto-chunking ESLint runner that updates cache incrementally based on your ESLint config.**

Perfect for large codebases where traditional ESLint runs might crash or take too long. ESLint Chunker splits your files into manageable chunks and processes them sequentially, updating the cache after each successful chunk.

![ChunkyLint](image.png)

## ✨ Features

- **🔄 Incremental Cache Updates**: Updates ESLint cache after each successful chunk, preventing loss of progress on failures
- **📁 Smart File Discovery**: Automatically discovers files based on your ESLint configuration and ignore patterns
- **⚡ Configurable Chunk Sizes**: Customize chunk size based on your system's capabilities
- **🛠️ Auto-fixing Support**: Apply ESLint fixes incrementally with configurable fix types
- **📊 Detailed Progress Reporting**: Real-time progress updates with statistics
- **💪 Error Recovery**: Continue processing remaining chunks even if some fail
- **🎯 TypeScript Support**: Written in TypeScript with full type definitions
- **🎨 Beautiful CLI**: Colorful, informative command-line interface
- **⚙️ Highly Configurable**: Extensive configuration options for all use cases

## 📦 Installation

```bash
npm install -g eslint-chunker
```

Or use locally in your project:

```bash
npm install --save-dev eslint-chunker
```

You can also run it directly with npx without installation:

```bash
npx eslint-chunker   # Original command
npx chunkylint       # Short alias
npx chunky-lint      # Hyphenated alias
```

## 🚀 Quick Start

### Command Line Usage

```bash
# Basic usage with default settings (200 files per chunk)
chunkylint

# Or use the original command name
eslint-chunker

# Or use the hyphenated alias
chunky-lint

# Specify chunk size and enable fixing
chunkylint --size 150 --fix

# Use custom cache location and enable verbose output
chunkylint --cache-location .cache/.eslintcache --verbose

# Include custom patterns and continue on errors
chunkylint --include "**/*.{js,ts,tsx}" --continue-on-error
```

### Programmatic Usage

```typescript
import { ESLintChunker } from "eslint-chunker";

const chunker = new ESLintChunker({
 size: 150,
 cacheLocation: ".cache/.eslintcache",
 fix: true,
 verbose: true,
 continueOnError: true,
});

const stats = await chunker.run((processed, total, currentChunk) => {
 console.log(`Progress: ${processed}/${total} chunks`);
 if (currentChunk) {
  console.log(`Current chunk: ${currentChunk.files.length} files`);
 }
});

console.log(
 `✅ Processed ${stats.totalFiles} files in ${stats.totalChunks} chunks`
);
console.log(`⏱️ Total time: ${stats.totalTime}ms`);
console.log(`🔧 Files fixed: ${stats.filesFixed}`);
```

## ⚙️ Configuration Options

### CLI Options

| Option                    | Description                                   | Default         |
| ------------------------- | --------------------------------------------- | --------------- |
| `-c, --config <path>`     | Path to ESLint config file                    | Auto-detected   |
| `-s, --size <number>`     | Files per chunk                               | `200`           |
| `--cache-location <path>` | ESLint cache file location                    | `.eslintcache`  |
| `--max-workers <n>`       | ESLint max workers ("auto", "off", or number) | `"off"`         |
| `--continue-on-error`     | Do not exit on first chunk failure            | `false`         |
| `--fix`                   | Apply ESLint fixes                            | `false`         |
| `--fix-types <types>`     | Types of fixes to apply (comma-separated)     | All types       |
| `--no-warn-ignored`       | Do not warn about ignored files               | Warn enabled    |
| `--include <patterns>`    | Include patterns (comma-separated)            | Auto-detected   |
| `--ignore <patterns>`     | Additional ignore patterns (comma-separated)  | Auto-detected   |
| `--cwd <path>`            | Working directory                             | `process.cwd()` |
| `-v, --verbose`           | Enable verbose output                         | `false`         |
| `--concurrency <n>`       | Number of chunks to process concurrently      | `1`             |
| `--config-file <path>`    | Path to chunkyLint config file                | Auto-detected   |

### 📄 Configuration Files

ESLint Chunker supports configuration files to avoid passing many command-line flags. Create a config file in your project root:

```json
// .chunkylint.json
{
 "size": 10,
 "concurrency": 2,
 "verbose": true,
 "cacheLocation": ".chunky-cache",
 "fix": false,
 "continueOnError": true,
 "include": ["src/**/*.ts"],
 "ignore": ["**/*.test.ts"]
}
```

```typescript
// .chunkylint.ts - TypeScript config with full type safety
import type { ChunkyLintConfig } from "eslint-chunker";

const config: ChunkyLintConfig = {
 size: 10,
 concurrency: 2,
 verbose: true,
 cacheLocation: ".chunky-cache",
 fix: false,
 continueOnError: true,
 include: ["src/**/*.ts"],
 ignore: ["**/*.test.ts"],
};

export default config;
```

```javascript
// .chunkylint.js - JavaScript config
module.exports = {
 size: 10,
 concurrency: 2,
 verbose: true,
 cacheLocation: ".chunky-cache",
 fix: false,
 continueOnError: true,
 include: ["src/**/*.ts"],
 ignore: ["**/*.test.ts"],
};
```

**Supported config files (in order of precedence):**

- `.chunkylint.ts` - TypeScript config
- `.chunkylint.js` - JavaScript config
- `.chunkylint.mjs` - ES Module config
- `.chunkylint.json` - JSON config
- `chunkylint.config.*` - Alternative naming

**CLI options always override config file settings.**

See the [Configuration Guide](./docs/configuration.md) for detailed examples and advanced usage.

### 🚀 NPX Aliases

You can run ESLint Chunker using any of these commands:

```bash
npx eslint-chunker    # Original command
npx chunkylint        # Short alias
npx chunky-lint       # Hyphenated alias
```

### Programmatic Options

```typescript
interface ChunkerOptions {
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
```

## 📊 Statistics

ESLint Chunker provides detailed statistics about the processing:

```typescript
interface ChunkingStats {
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
```

## 🎯 Use Cases

### Large Codebases

Perfect for monorepos or large projects where ESLint might run out of memory or take too long:

```bash
chunkylint --size 100 --max-workers auto --continue-on-error
```

### CI/CD Pipelines

Ideal for continuous integration where you want to ensure progress isn't lost:

```bash
chunkylint --cache-location /tmp/.eslintcache --verbose --continue-on-error
```

### Development Workflows

Great for development with auto-fixing enabled:

```bash
chunkylint --fix --fix-types problem,suggestion --size 50
```

### Gradual Migration

Useful when gradually fixing linting issues in legacy codebases:

```bash
chunkylint --continue-on-error --fix --fix-types problem
```

## 🏗️ How It Works

1. **File Discovery**: Uses your ESLint configuration to discover files that should be linted
2. **Chunking**: Splits the discovered files into manageable chunks
3. **Sequential Processing**: Processes each chunk with ESLint, updating the cache after each successful chunk
4. **Error Handling**: Optionally continues processing even if some chunks fail
5. **Statistics**: Provides detailed statistics about the entire operation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Nick2bad4u/eslint-plugin-chunkyLint.git
cd eslint-plugin-chunkyLint

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

### Testing Your Changes

```bash
# Build and test the CLI locally
npm run build
node dist/bin/eslint-chunker.js --help

# Or use the development command (no build required)
npm run dev -- --help

# Test with different aliases
npm run dev -- --size 50 --verbose
```

## 📝 License

MIT © [Nick2bad4u](https://github.com/Nick2bad4u)

## 🙏 Acknowledgments

- [ESLint](https://eslint.org/) - The amazing linting tool this package enhances
- [Commander.js](https://github.com/tj/commander.js) - Excellent CLI framework
- [fast-glob](https://github.com/mrmlnc/fast-glob) - Fast and efficient file globbing
- [chalk](https://github.com/chalk/chalk) - Beautiful terminal colors

---

**Made with ❤️ for developers dealing with large codebases**
