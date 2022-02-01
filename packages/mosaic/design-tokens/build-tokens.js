const buildTokens = require('./style-dictionary/build');

buildTokens([
    {
        name: 'pt-2022',
        buildPath: [
            `packages/mosaic/design-tokens/pt-2022/tokens/properties/**/*.json5`,
            `packages/mosaic/design-tokens/pt-2022/tokens/components/**/*.json5`
        ],
        outputPath: 'packages/mosaic/design-tokens/pt-2022/'
    }
]);

buildTokens([
    {
        name: 'legacy-2017',
        buildPath: [
            `packages/mosaic/design-tokens/legacy-2017/tokens/properties/**/*.json5`,
            `packages/mosaic/design-tokens/legacy-2017/tokens/components/**/*.json5`
        ],
        outputPath: 'packages/mosaic/design-tokens/legacy-2017/'
    }
]);

