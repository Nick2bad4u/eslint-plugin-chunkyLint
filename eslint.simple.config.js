export default [
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
        rules: {
            "no-unused-vars": "warn",
            "no-console": "off",
            "prefer-const": "error",
        },
    },
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            "*.js",
        ],
    },
];
