import chalk from "chalk";

import type { Logger } from "../types/index.js";

/**
 * Console logger implementation with colored output
 */
export class ConsoleLogger implements Logger {
     
    private quietMode: boolean;
    private verboseMode: boolean;

    constructor(verbose = false, quiet = false) {
        this.verboseMode = verbose;
        this.quietMode = quiet;
    }

    debug(message: string, ...args: unknown[]): void {
        if (this.verboseMode && !this.quietMode) {
            console.log(chalk.gray("🐛"), message, ...args);
        }
    }

    error(message: string, ...args: unknown[]): void {
        console.error(chalk.red("✖"), message, ...args);
    }

    info(message: string, ...args: unknown[]): void {
        if (this.quietMode) {
            return;
        }

        console.log(chalk.blue("ℹ"), message, ...args);
    }

    setQuiet(quiet: boolean): void {
        this.quietMode = quiet;
    }

    setVerbose(verbose: boolean): void {
        this.verboseMode = verbose;
    }

    verbose(message: string, ...args: unknown[]): void {
        if (this.verboseMode && !this.quietMode) {
            console.log(chalk.gray("📝"), message, ...args);
        }
    }

    warn(message: string, ...args: unknown[]): void {
        if (this.quietMode) {
            return;
        }

        console.warn(chalk.yellow("⚠"), message, ...args);
    }
}
