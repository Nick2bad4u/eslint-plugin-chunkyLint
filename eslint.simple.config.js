const simpleConfig = [
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
        rules: {
            "no-console": "off",
            "no-unused-vars": "warn",
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

export default simpleConfig;
