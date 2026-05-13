import { describe, expect, it } from "vitest";

import ESLintChunker, {
    ConsoleLogger,
    FileScanner,
    ESLintChunker as NamedESLintChunker,
} from "../chunky-lint.js";

describe("index exports", () => {
    it("should export ESLintChunker as default export", () => {
        expect.hasAssertions();
        expect(ESLintChunker).toBeDefined();
        expect(ESLintChunker).toBeTypeOf("function");
    });

    it("should export ESLintChunker as named export", () => {
        expect.hasAssertions();
        expect(NamedESLintChunker).toBeDefined();
        expect(NamedESLintChunker).toBeTypeOf("function");
    });

    it("should export FileScanner", () => {
        expect.hasAssertions();
        expect(FileScanner).toBeDefined();
        expect(FileScanner).toBeTypeOf("function");
    });

    it("should export ConsoleLogger", () => {
        expect.hasAssertions();
        expect(ConsoleLogger).toBeDefined();
        expect(ConsoleLogger).toBeTypeOf("function");
    });

    it("should have default export equal to named ESLintChunker export", () => {
        expect.hasAssertions();
        expect(ESLintChunker).toBe(NamedESLintChunker);
    });

    it("should be able to instantiate ESLintChunker from default export", () => {
        expect.hasAssertions();

        const chunker = new ESLintChunker();

        expect(chunker).toBeInstanceOf(NamedESLintChunker);
    });

    it("should be able to instantiate ESLintChunker from named export", () => {
        expect.hasAssertions();

        const chunker = new NamedESLintChunker();

        expect(chunker).toBeInstanceOf(NamedESLintChunker);
    });

    it("should be able to instantiate FileScanner", () => {
        expect.hasAssertions();

        const logger = new ConsoleLogger(false),
            scanner = new FileScanner(logger);

        expect(scanner).toBeInstanceOf(FileScanner);
    });

    it("should be able to instantiate ConsoleLogger", () => {
        expect.hasAssertions();

        const logger = new ConsoleLogger(false);

        expect(logger).toBeInstanceOf(ConsoleLogger);
    });
});
