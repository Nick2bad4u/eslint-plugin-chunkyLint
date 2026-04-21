type ESLintModule = typeof import("eslint");

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
