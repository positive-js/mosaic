
module.exports = () => ({
    autoDetect: true,
    files: [
        'packages/**/*.ts',
        "!packages/**/*.spec.ts",
    ],
    tests: [
        "packages/**/*.spec.ts",
        "!packages/mosaic/schematics/**/*.spec.ts",
        "!packages/docs/**/*.*",
        "!packages/mosaic-dev/**/*.*",
        "!packages/mosaic-examples/**/*.*"
    ]
});
