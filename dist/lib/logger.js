import chalk from "chalk";
/**
 * Console logger implementation with colored output
 */
export class ConsoleLogger {
    /* eslint-disable class-methods-use-this */
    verboseMode;
    constructor(verbose = false) {
        this.verboseMode = verbose;
    }
    info(message, ...args) {
        console.log(chalk.blue("ℹ"), message, ...args);
    }
    warn(message, ...args) {
        console.warn(chalk.yellow("⚠"), message, ...args);
    }
    error(message, ...args) {
        console.error(chalk.red("✖"), message, ...args);
    }
    debug(message, ...args) {
        if (this.verboseMode) {
            console.log(chalk.gray("🐛"), message, ...args);
        }
    }
    verbose(message, ...args) {
        if (this.verboseMode) {
            console.log(chalk.gray("📝"), message, ...args);
        }
    }
    setVerbose(verbose) {
        this.verboseMode = verbose;
    }
}
//# sourceMappingURL=logger.js.map