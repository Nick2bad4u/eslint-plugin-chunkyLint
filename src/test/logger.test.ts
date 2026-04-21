import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConsoleLogger } from "../lib/logger.js";

interface StreamSpy {
    stderr: ReturnType<typeof vi.spyOn>;
    stdout: ReturnType<typeof vi.spyOn>;
}

// Mock chalk
vi.mock("chalk", () => ({
    default: {
        blue: vi.fn((text: string) => `blue(${text})`),
        gray: vi.fn((text: string) => `gray(${text})`),
        green: vi.fn((text: string) => `green(${text})`),
        red: vi.fn((text: string) => `red(${text})`),
        yellow: vi.fn((text: string) => `yellow(${text})`),
    },
}));

describe("ConsoleLogger", () => {
    let logger: ConsoleLogger = new ConsoleLogger(false);
    let streamSpy: StreamSpy = {
        stderr: vi
            .spyOn(process.stderr, "write")
            .mockImplementation(() => true),
        stdout: vi
            .spyOn(process.stdout, "write")
            .mockImplementation(() => true),
    };

    beforeEach(() => {
        logger = new ConsoleLogger(false);

        streamSpy = {
            stderr: vi
                .spyOn(process.stderr, "write")
                .mockImplementation(() => true),
            stdout: vi
                .spyOn(process.stdout, "write")
                .mockImplementation(() => true),
        };
    });

    afterEach(() => {
        streamSpy.stdout.mockRestore();
        streamSpy.stderr.mockRestore();
    });

    describe("info", () => {
        it("should log info messages", () => {
            logger.info("Test message");
            expect(streamSpy.stdout).toHaveBeenCalledWith(
                expect.stringContaining("blue(ℹ) Test message")
            );
        });

        it("should log info messages with additional arguments", () => {
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
            logger.warn("Warning message");
            expect(streamSpy.stderr).toHaveBeenCalledWith(
                expect.stringContaining("yellow(⚠) Warning message")
            );
        });
    });

    describe("error", () => {
        it("should log error messages", () => {
            logger.error("Error message");
            expect(streamSpy.stderr).toHaveBeenCalledWith(
                expect.stringContaining("red(✖) Error message")
            );
        });
    });

    describe("verbose mode", () => {
        beforeEach(() => {
            logger = new ConsoleLogger(true);
        });

        it("should log debug messages when verbose is enabled", () => {
            logger.debug("Debug message");
            expect(streamSpy.stdout).toHaveBeenCalledWith(
                expect.stringContaining("gray(🐛) Debug message")
            );
        });

        it("should log verbose messages when verbose is enabled", () => {
            logger.verbose("Verbose message");
            expect(streamSpy.stdout).toHaveBeenCalledWith(
                expect.stringContaining("gray(📝) Verbose message")
            );
        });
    });

    describe("non-verbose mode", () => {
        it("should not log debug messages when verbose is disabled", () => {
            logger.debug("Debug message");
            expect(streamSpy.stdout).not.toHaveBeenCalled();
        });

        it("should not log verbose messages when verbose is disabled", () => {
            logger.verbose("Verbose message");
            expect(streamSpy.stdout).not.toHaveBeenCalled();
        });
    });

    describe("setVerbose", () => {
        it("should change verbose mode", () => {
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
            logger = new ConsoleLogger(false, true);

            logger.info("Info message");
            logger.warn("Warn message");

            expect(streamSpy.stdout).not.toHaveBeenCalled();
            expect(streamSpy.stderr).not.toHaveBeenCalled();
        });

        it("should still print errors when quiet is enabled", () => {
            logger = new ConsoleLogger(false, true);

            logger.error("Error message");

            expect(streamSpy.stderr).toHaveBeenCalledWith(
                expect.stringContaining("red(✖) Error message")
            );
        });

        it("should suppress verbose logs even if verbose is enabled when quiet is enabled", () => {
            logger = new ConsoleLogger(true, true);

            logger.debug("Debug message");
            logger.verbose("Verbose message");

            expect(streamSpy.stdout).not.toHaveBeenCalled();
        });

        it("should toggle quiet mode via setQuiet", () => {
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
