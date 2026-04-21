import type { ESLint as ESLintClass } from "eslint";

/**
 * Shape of the dynamically-loaded `eslint` module used by this package.
 *
 * @remarks
 * Defined as a structural interface (rather than `typeof import("eslint")`) to
 * avoid inline `import()` type annotations that are disallowed by
 * `@typescript-eslint/consistent-type-imports`.
 */
export type ESLintModule = {
    readonly ESLint: {
        readonly outputFixes: typeof ESLintClass.outputFixes;
        new (options?: Readonly<ESLintClass.Options>): ESLintClass;
    };
};

/**
 * Loads ESLint at runtime and provides a friendly error when the peer
 * dependency is missing from the consuming project.
 */
type ESLintImporter = () => Promise<ESLintModule>;

const importESLint: ESLintImporter = async () => import("eslint");

/**
 * Load the ESLint module using the provided importer function.
 */
export async function loadESLintModule(
    importer: ESLintImporter = importESLint
): Promise<ESLintModule> {
    try {
        return await importer();
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error),
            normalizedMessage = message.toLowerCase();

        const missingEslint =
            normalizedMessage.includes("cannot find package 'eslint'") ||
            normalizedMessage.includes('cannot find package "eslint"') ||
            normalizedMessage.includes("cannot find module 'eslint'") ||
            normalizedMessage.includes('cannot find module "eslint"');

        if (missingEslint) {
            throw new Error(
                "Missing peer dependency 'eslint'. Install it in your project (for example: npm i -D eslint@^10).",
                { cause: error }
            );
        }

        throw error;
    }
}
