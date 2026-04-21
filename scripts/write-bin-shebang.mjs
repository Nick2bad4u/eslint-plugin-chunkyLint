#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const binFilePath = fileURLToPath(
    new URL("../dist/bin/eslint-chunker.js", import.meta.url)
);
const shebang = "#!/usr/bin/env node\n";

/**
 * Ensure the built CLI bin file has an executable shebang.
 *
 * @returns {Promise<void>}
 */
const main = async () => {
    const fileContent = await readFile(binFilePath, "utf8");

    if (fileContent.startsWith(shebang)) {
        console.log("CLI bin shebang already present.");
        return;
    }

    await writeFile(binFilePath, `${shebang}${fileContent}`, "utf8");
    console.log("Prepended shebang to dist/bin/eslint-chunker.js");
};

try {
    await main();
} catch (error) {
    console.error("Failed to write CLI bin shebang:", error);
    process.exitCode = 1;
}
