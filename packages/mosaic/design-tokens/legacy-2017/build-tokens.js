require('./style-dictionary/build')([
    {
        name: 'default-theme',
        buildPath: [
            `packages/mosaic/design-tokens/tokens/properties/**/*.json5`,
            `packages/mosaic/design-tokens/tokens/components/**/*.json5`
        ],
        outputPath: 'packages/mosaic/design-tokens/'
    }
]);

