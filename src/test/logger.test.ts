/* eslint-disable vitest/prefer-import-in-mock -- String-specifier mocks are required for strict Vitest+TS compatibility in this test file. */
import type { MockInstance } from "vitest";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConsoleLogger } from "../lib/logger.js";

type Colorizer = (text: string) => string;

interface StreamSpy {
    stderr: MockInstance<typeof process.stderr.write>;
    stdout: MockInstance<typeof process.stdout.write>;
}

// Mock yoctocolors
vi.mock("yoctocolors", () => ({
    default: {
        blue: vi.fn<Colorizer>((text: string) => `blue(${text})`),
        gray: vi.fn<Colorizer>((text: string) => `gray(${text})`),
        green: vi.fn<Colorizer>((text: string) => `green(${text})`),
        red: vi.fn<Colorizer>((text: string) => `red(${text})`),
        yellow: vi.fn<Colorizer>((text: string) => `yellow(${text})`),
    },
}));

describe(ConsoleLogger, () => {
    let logger: ConsoleLogger = new ConsoleLogger(false);
    let streamSpy: StreamSpy = {
        stderr: vi.spyOn(process.stderr, "write").mockReturnValue(true),
        stdout: vi.spyOn(process.stdout, "write").mockReturnValue(true),
    };

    // eslint-disable-next-line vitest/no-hooks -- Shared stream spies are reset before each test for deterministic assertions.
    beforeEach(() => {
        logger = new ConsoleLogger(false);

        streamSpy = {
            stderr: vi.spyOn(process.stderr, "write").mockReturnValue(true),
            stdout: vi.spyOn(process.stdout, "write").mockReturnValue(true),
        };
    });

    // eslint-disable-next-line vitest/no-hooks -- Restore process stream spies to avoid cross-test leakage.
    afterEach(() => {
        streamSpy.stdout.mockRestore();
        streamSpy.stderr.mockRestore();
    });

    describe("info", () => {
        it("should log info messages", () => {
            expect.hasAssertions();

            logger.info("Test message");

            expect(streamSpy.stdout).toHaveBeenCalledWith(
                expect.stringContaining("blue(ℹ) Test message")
            );
        });

        it("should log info messages with additional arguments", () => {
            expect.hasAssertions();

            logger.info("Test message", "arg1", "arg2");

            expect(streamSpy.stdout).toHaveBeenCalledWith(
                expect.stringContaining("blue(ℹ) Test message")
            );
            expect(streamSpy.stdout).toHaveBeenCalledWith(
                expect.stringContaining("arg1")
            );
            expect(streamSpy.stdout).toHaveBeenCalledWith(
                expect.stringContaining("arg2")
            );
        });
    });

    describe("warn", () => {
        it("should log warning messages", () => {
            expect.hasAssertions();

            logger.warn("Warning message");

            expect(streamSpy.stderr).toHaveBeenCalledWith(
                expect.stringContaining("yellow(⚠) Warning message")
            );
        });
    });

    describe("error", () => {
        it("should log error messages", () => {
            expect.hasAssertions();

            logger.error("Error message");

            expect(streamSpy.stderr).toHaveBeenCalledWith(
                expect.stringContaining("red(✖) Error message")
            );
        });
    });

    describe("verbose mode", () => {
        // eslint-disable-next-line vitest/no-hooks -- Suite-level verbose logger setup keeps assertions focused.
        beforeEach(() => {
            logger = new ConsoleLogger(true);
        });

        it("should log debug messages when verbose is enabled", () => {
            expect.hasAssertions();

            logger.debug("Debug message");

            expect(streamSpy.stdout).toHaveBeenCalledWith(
                expect.stringContaining("gray(🐛) Debug message")
            );
        });

        it("should log verbose messages when verbose is enabled", () => {
            expect.hasAssertions();

            logger.verbose("Verbose message");

            expect(streamSpy.stdout).toHaveBeenCalledWith(
                expect.stringContaining("gray(📝) Verbose message")
            );
        });
    });

    describe("non-verbose mode", () => {
        it("should not log debug messages when verbose is disabled", () => {
            expect.hasAssertions();

            logger.debug("Debug message");

            expect(streamSpy.stdout).not.toHaveBeenCalled();
        });

        it("should not log verbose messages when verbose is disabled", () => {
            expect.hasAssertions();

            logger.verbose("Verbose message");

            expect(streamSpy.stdout).not.toHaveBeenCalled();
        });
    });

    describe("setVerbose", () => {
        it("should change verbose mode", () => {
            expect.hasAssertions();

            logger.setVerbose(true);
            logger.debug("Debug message");

            expect(streamSpy.stdout).toHaveBeenCalledWith(
                expect.stringContaining("gray(🐛) Debug message")
            );

            streamSpy.stdout.mockClear();

            logger.setVerbose(false);
            logger.debug("Debug message 2");

            expect(streamSpy.stdout).not.toHaveBeenCalled();
        });
    });

    describe("quiet mode", () => {
        it("should suppress info and warn logs when quiet is enabled", () => {
            expect.hasAssertions();

            logger = new ConsoleLogger(false, true);

            logger.info("Info message");
            logger.warn("Warn message");

            expect(streamSpy.stdout).not.toHaveBeenCalled();
            expect(streamSpy.stderr).not.toHaveBeenCalled();
        });

        it("should still print errors when quiet is enabled", () => {
            expect.hasAssertions();

            logger = new ConsoleLogger(false, true);

            logger.error("Error message");

            expect(streamSpy.stderr).toHaveBeenCalledWith(
                expect.stringContaining("red(✖) Error message")
            );
        });

        it("should suppress verbose logs even if verbose is enabled when quiet is enabled", () => {
            expect.hasAssertions();

            logger = new ConsoleLogger(true, true);

            logger.debug("Debug message");
            logger.verbose("Verbose message");

            expect(streamSpy.stdout).not.toHaveBeenCalled();
        });

        it("should toggle quiet mode via setQuiet", () => {
            expect.hasAssertions();

            logger.setQuiet(true);
            logger.info("suppressed");

            expect(streamSpy.stdout).not.toHaveBeenCalled();

            logger.setQuiet(false);
            logger.info("visible");

            expect(streamSpy.stdout).toHaveBeenCalledWith(
                expect.stringContaining("blue(ℹ) visible")
            );
        });
    });
});

/* eslint-enable vitest/prefer-import-in-mock -- Re-enable standard lint rules after compatibility-focused mocks. */
