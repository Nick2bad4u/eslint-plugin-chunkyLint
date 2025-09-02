import { describe, it, expect } from "vitest";
import ESLintChunker, {
    ESLintChunker as NamedESLintChunker,
    FileScanner,
    ConsoleLogger,
} from "../index.js";

describe("Index exports", () => {
    it("should export ESLintChunker as default export", () => {
        expect(ESLintChunker).toBeDefined();
        expect(typeof ESLintChunker).toBe("function");
    });

    it("should export ESLintChunker as named export", () => {
        expect(NamedESLintChunker).toBeDefined();
        expect(typeof NamedESLintChunker).toBe("function");
    });

    it("should export FileScanner", () => {
        expect(FileScanner).toBeDefined();
        expect(typeof FileScanner).toBe("function");
    });

    it("should export ConsoleLogger", () => {
        expect(ConsoleLogger).toBeDefined();
        expect(typeof ConsoleLogger).toBe("function");
    });

    it("should have default export equal to named ESLintChunker export", () => {
        expect(ESLintChunker).toBe(NamedESLintChunker);
    });

    it("should be able to instantiate ESLintChunker from default export", () => {
        const chunker = new ESLintChunker();
        expect(chunker).toBeInstanceOf(NamedESLintChunker);
    });

    it("should be able to instantiate ESLintChunker from named export", () => {
        const chunker = new NamedESLintChunker();
        expect(chunker).toBeInstanceOf(NamedESLintChunker);
    });

    it("should be able to instantiate FileScanner", () => {
        const logger = new ConsoleLogger(false);
        const scanner = new FileScanner(logger);
        expect(scanner).toBeInstanceOf(FileScanner);
    });

    it("should be able to instantiate ConsoleLogger", () => {
        const logger = new ConsoleLogger(false);
        expect(logger).toBeInstanceOf(ConsoleLogger);
    });
});
