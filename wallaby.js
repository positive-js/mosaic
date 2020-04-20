
module.exports = () => ({
    autoDetect: true,
    tests: [
        "packages/**/*.spec.ts",
        "!packages/mosaic/schematics/**/*.spec.ts",
        "!packages/docs/**/*.*",
        "!packages/mosaic-dev/**/*.*",
        "!packages/mosaic-examples/**/*.*"
    ]
});
