import type { Logger } from "../types/index.js";
import chalk from "chalk";

/**
 * Console logger implementation with colored output
 */
export class ConsoleLogger implements Logger {
    /* eslint-disable class-methods-use-this */
    private verboseMode: boolean;

    constructor(verbose = false) {
        this.verboseMode = verbose;
    }

    info(message: string, ...args: unknown[]): void {
        console.log(chalk.blue("ℹ"), message, ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        console.warn(chalk.yellow("⚠"), message, ...args);
    }

    error(message: string, ...args: unknown[]): void {
        console.error(chalk.red("✖"), message, ...args);
    }

    debug(message: string, ...args: unknown[]): void {
        if (this.verboseMode) {
            console.log(chalk.gray("🐛"), message, ...args);
        }
    }

    verbose(message: string, ...args: unknown[]): void {
        if (this.verboseMode) {
            console.log(chalk.gray("📝"), message, ...args);
        }
    }

    setVerbose(verbose: boolean): void {
        this.verboseMode = verbose;
    }
}
