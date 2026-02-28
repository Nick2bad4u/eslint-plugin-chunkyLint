# Configuration Files

ChunkyLint supports configuration files to avoid having to pass many command-line flags. This makes it easier to maintain consistent settings across your project.

## Supported File Types

ChunkyLint will automatically detect and load configuration files in the following order of precedence:

1. `.chunkylint.ts` - TypeScript configuration
2. `.chunkylint.js` - JavaScript configuration
3. `.chunkylint.mjs` - ES Module JavaScript configuration
4. `.chunkylint.json` - JSON configuration
5. `chunkylint.config.ts` - Alternative TypeScript configuration
6. `chunkylint.config.js` - Alternative JavaScript configuration
7. `chunkylint.config.mjs` - Alternative ES Module configuration
8. `chunkylint.config.json` - Alternative JSON configuration

## Configuration Options

All configuration options are optional. Any option not specified will use the default value.

```typescript
interface ChunkyLintConfig {
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
 /** Suppress all non-final output */
 quiet?: boolean;
 /** Show per-chunk completion logs */
 chunkLogs?: boolean;
 /** Cache directory location */
 cacheLocation?: string;
 /** Enable auto-fixing */
 fix?: boolean;
 /** Continue processing even if errors occur */
 continueOnError?: boolean;
}
```

## Example Configurations

### JSON Configuration (`.chunkylint.json`)

```json
{
 "size": 10,
 "concurrency": 2,
 "verbose": true,
 "quiet": false,
 "chunkLogs": true,
 "cacheLocation": ".chunky-cache",
 "fix": false,
 "continueOnError": true,
 "include": ["src/**/*.ts", "lib/**/*.js"],
 "ignore": ["**/*.test.ts", "dist/**"]
}
```

### TypeScript Configuration (`.chunkylint.ts`)

```typescript
import type { ChunkyLintConfig } from "eslint-plugin-chunkylint";

const config: ChunkyLintConfig = {
 size: 15,
 concurrency: 4,
 verbose: process.env.NODE_ENV === "development",
 quiet: false,
 chunkLogs: true,
 cacheLocation: ".chunky-cache",
 fix: false,
 continueOnError: true,
 include: ["src/**/*.{ts,tsx}"],
 ignore: ["**/*.test.{ts,tsx}", "dist/**", "coverage/**"],
};

export default config;
```

### JavaScript Configuration (`.chunkylint.js`)

```javascript
/** @type {import('eslint-plugin-chunkylint').ChunkyLintConfig} */
const config = {
 size: 8,
 concurrency: 2,
 verbose: false,
 quiet: false,
 chunkLogs: true,
 cacheLocation: ".chunky-cache",
 fix: true,
 continueOnError: false,
 include: ["src/**/*.js", "lib/**/*.js"],
 ignore: ["**/*.test.js", "dist/**"],
};

module.exports = config;
```

### Function-based Configuration

You can also export a function that returns the configuration:

```typescript
import type { ChunkyLintConfig } from "eslint-plugin-chunkylint";

export default function (): ChunkyLintConfig {
 const isDevelopment = process.env.NODE_ENV === "development";

 return {
  size: isDevelopment ? 5 : 20,
  concurrency: isDevelopment ? 1 : 4,
  verbose: isDevelopment,
  quiet: false,
  chunkLogs: true,
  cacheLocation: ".chunky-cache",
  fix: !isDevelopment,
  continueOnError: true,
  include: ["src/**/*.{ts,tsx,js,jsx}"],
 };
}
```

## Command Line Override

Command-line options always take precedence over configuration file settings. This allows you to override specific settings without modifying the configuration file:

```bash
# Use config file settings but override chunk size
npx chunkylint --config-file .chunkylint.json --size 5

# Use auto-detected config but enable verbose mode
npx chunkylint --verbose

# Quiet mode: only print final completion summary
npx chunkylint --quiet

# Hide per-chunk logs while keeping startup/final summaries
npx chunkylint --no-chunk-logs

# Override multiple settings
npx chunkylint --size 2 --concurrency 1 --fix
```

## Specifying Config File

By default, ChunkyLint will search for configuration files in the current working directory. You can specify a custom configuration file using the `--config-file` option:

```bash
# Use specific config file
npx chunkylint --config-file ./configs/chunky.config.ts

# Use config file in parent directory
npx chunkylint --config-file ../.chunkylint.json
```

## Default Values

When no configuration is provided (either via file or command line), ChunkyLint uses these defaults:

- **size**: 200 files per chunk
- **concurrency**: 1 (sequential processing)
- **verbose**: false
- **quiet**: false
- **chunkLogs**: true
- **cacheLocation**: '.eslintcache'
- **fix**: false
- **continueOnError**: false
- **include**: [] (must be specified to find files)
- **ignore**: []
- **cwd**: current working directory

## Best Practices

1. **Use TypeScript configs** for better type safety and IDE support
2. **Keep configs in version control** to ensure consistent settings across team members
3. **Use environment variables** in function-based configs for different environments
4. **Start with small chunk sizes** and increase based on your system's performance
5. **Use concurrency wisely** - too many concurrent chunks can overwhelm the system
6. **Include explicit patterns** - ChunkyLint requires include patterns to discover files
