import ESLintChunker, {
    ConsoleLogger,
    FileScanner,
    ESLintChunker as NamedESLintChunker,
} from "../index.js";
import { describe, expect, it } from "vitest";

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
        const logger = new ConsoleLogger(false),
            scanner = new FileScanner(logger);
        expect(scanner).toBeInstanceOf(FileScanner);
    });

    it("should be able to instantiate ConsoleLogger", () => {
        const logger = new ConsoleLogger(false);
        expect(logger).toBeInstanceOf(ConsoleLogger);
    });
});
