import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConsoleLogger } from "../lib/logger.js";
// Mock chalk
vi.mock("chalk", () => ({
    default: {
        blue: vi.fn((text) => `blue(${text})`),
        yellow: vi.fn((text) => `yellow(${text})`),
        red: vi.fn((text) => `red(${text})`),
        gray: vi.fn((text) => `gray(${text})`),
        green: vi.fn((text) => `green(${text})`),
    },
}));
describe("ConsoleLogger", () => {
    let consoleSpy, logger;
    beforeEach(() => {
        logger = new ConsoleLogger(false);
        /* eslint-disable @typescript-eslint/no-empty-function */
        consoleSpy = {
            log: vi.spyOn(console, "log").mockImplementation(() => { }),
            warn: vi.spyOn(console, "warn").mockImplementation(() => { }),
            error: vi.spyOn(console, "error").mockImplementation(() => { }),
        };
        /* eslint-enable @typescript-eslint/no-empty-function */
    });
    afterEach(() => {
        consoleSpy.log.mockRestore();
        consoleSpy.warn.mockRestore();
        consoleSpy.error.mockRestore();
    });
    describe("info", () => {
        it("should log info messages", () => {
            logger.info("Test message");
            expect(consoleSpy.log).toHaveBeenCalledWith("blue(ℹ)", "Test message");
        });
        it("should log info messages with additional arguments", () => {
            logger.info("Test message", "arg1", "arg2");
            expect(consoleSpy.log).toHaveBeenCalledWith("blue(ℹ)", "Test message", "arg1", "arg2");
        });
    });
    describe("warn", () => {
        it("should log warning messages", () => {
            logger.warn("Warning message");
            expect(consoleSpy.warn).toHaveBeenCalledWith("yellow(⚠)", "Warning message");
        });
    });
    describe("error", () => {
        it("should log error messages", () => {
            logger.error("Error message");
            expect(consoleSpy.error).toHaveBeenCalledWith("red(✖)", "Error message");
        });
    });
    describe("verbose mode", () => {
        beforeEach(() => {
            logger = new ConsoleLogger(true);
        });
        it("should log debug messages when verbose is enabled", () => {
            logger.debug("Debug message");
            expect(consoleSpy.log).toHaveBeenCalledWith("gray(🐛)", "Debug message");
        });
        it("should log verbose messages when verbose is enabled", () => {
            logger.verbose("Verbose message");
            expect(consoleSpy.log).toHaveBeenCalledWith("gray(📝)", "Verbose message");
        });
    });
    describe("non-verbose mode", () => {
        it("should not log debug messages when verbose is disabled", () => {
            logger.debug("Debug message");
            expect(consoleSpy.log).not.toHaveBeenCalled();
        });
        it("should not log verbose messages when verbose is disabled", () => {
            logger.verbose("Verbose message");
            expect(consoleSpy.log).not.toHaveBeenCalled();
        });
    });
    describe("setVerbose", () => {
        it("should change verbose mode", () => {
            logger.setVerbose(true);
            logger.debug("Debug message");
            expect(consoleSpy.log).toHaveBeenCalledWith("gray(🐛)", "Debug message");
            consoleSpy.log.mockClear();
            logger.setVerbose(false);
            logger.debug("Debug message 2");
            expect(consoleSpy.log).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=logger.test.js.map