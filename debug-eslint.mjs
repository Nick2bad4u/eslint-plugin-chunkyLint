import { loadConfig } from "./dist/lib/configLoader.js";

async function testConfigLoader() {
    console.log("=== Testing config loader ===");

    try {
        const jsonConfig = await loadConfig(".chunkylint.json");
        console.log("JSON config:", jsonConfig);
    } catch (error) {
        console.error("JSON config error:", error);
    }

    try {
        const tsConfig = await loadConfig(".chunkylint.ts");
        console.log("TS config:", tsConfig);
    } catch (error) {
        console.error("TS config error:", error);
    }
}

testConfigLoader().catch(console.error);
