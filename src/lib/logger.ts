import type { Logger } from "../types/index.js";
import chalk from "chalk";

/**
 * Console logger implementation with colored output
 */
export class ConsoleLogger implements Logger {
    /* eslint-disable class-methods-use-this */
    private verboseMode: boolean;
    private quietMode: boolean;

    constructor(verbose = false, quiet = false) {
        this.verboseMode = verbose;
        this.quietMode = quiet;
    }

    info(message: string, ...args: unknown[]): void {
        if (this.quietMode) {
            return;
        }

        console.log(chalk.blue("ℹ"), message, ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        if (this.quietMode) {
            return;
        }

        console.warn(chalk.yellow("⚠"), message, ...args);
    }

    error(message: string, ...args: unknown[]): void {
        console.error(chalk.red("✖"), message, ...args);
    }

    debug(message: string, ...args: unknown[]): void {
        if (this.verboseMode && !this.quietMode) {
            console.log(chalk.gray("🐛"), message, ...args);
        }
    }

    verbose(message: string, ...args: unknown[]): void {
        if (this.verboseMode && !this.quietMode) {
            console.log(chalk.gray("📝"), message, ...args);
        }
    }

    setVerbose(verbose: boolean): void {
        this.verboseMode = verbose;
    }

    setQuiet(quiet: boolean): void {
        this.quietMode = quiet;
    }
}
