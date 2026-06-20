import type { UnknownArray } from "type-fest";

import { formatWithOptions } from "node:util";
import colors from "yoctocolors";

import type { Logger } from "../types/chunky-lint-types.js";

/**
 * Console logger implementation with colored output
 */
export class ConsoleLogger implements Logger {
    private quietMode: boolean;
    private verboseMode: boolean;

    public constructor(isVerbose = false, isQuiet = false) {
        this.verboseMode = isVerbose;
        this.quietMode = isQuiet;
    }

    private static writeStderr(
        prefix: string,
        message: string,
        ...args: Readonly<UnknownArray>
    ): void {
        process.stderr.write(
            `${formatWithOptions({ colors: true }, "%s %s", prefix, message)}${
                args.length > 0
                    ? ` ${formatWithOptions({ colors: true }, "%o", args)}`
                    : ""
            }\n`
        );
    }

    private static writeStdout(
        prefix: string,
        message: string,
        ...args: Readonly<UnknownArray>
    ): void {
        process.stdout.write(
            `${formatWithOptions({ colors: true }, "%s %s", prefix, message)}${
                args.length > 0
                    ? ` ${formatWithOptions({ colors: true }, "%o", args)}`
                    : ""
            }\n`
        );
    }

    public debug(message: string, ...args: Readonly<UnknownArray>): void {
        if (this.verboseMode && !this.quietMode) {
            ConsoleLogger.writeStdout(colors.gray("🐛"), message, ...args);
        }
    }

    public error(message: string, ...args: Readonly<UnknownArray>): void {
        if (this.quietMode) {
            // Keep errors visible even in quiet mode.
        }

        ConsoleLogger.writeStderr(colors.red("✖"), message, ...args);
    }

    public info(message: string, ...args: Readonly<UnknownArray>): void {
        if (this.quietMode) {
            return;
        }

        ConsoleLogger.writeStdout(colors.blue("ℹ"), message, ...args);
    }

    public setQuiet(isQuiet: boolean): void {
        this.quietMode = isQuiet;
    }

    public setVerbose(isVerbose: boolean): void {
        this.verboseMode = isVerbose;
    }

    public verbose(message: string, ...args: Readonly<UnknownArray>): void {
        if (this.verboseMode && !this.quietMode) {
            ConsoleLogger.writeStdout(colors.gray("📝"), message, ...args);
        }
    }

    public warn(message: string, ...args: Readonly<UnknownArray>): void {
        if (this.quietMode) {
            return;
        }

        ConsoleLogger.writeStderr(colors.yellow("⚠"), message, ...args);
    }
}
