import type { Logger } from "../types/index.js";
/**
 * Console logger implementation with colored output
 */
export declare class ConsoleLogger implements Logger {
    private verboseMode;
    constructor(verbose?: boolean);
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
    verbose(message: string, ...args: unknown[]): void;
    setVerbose(verbose: boolean): void;
}
//# sourceMappingURL=logger.d.ts.map