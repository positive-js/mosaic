const buildTokens = require('../../mosaic/design-tokens/style-dictionary/build');


const mosaicTokensProps = 'packages/mosaic/design-tokens/tokens/properties/**/*.json5';
const mosaicTokensComponents = 'packages/mosaic/design-tokens/tokens/components/**/*.json5';

buildTokens([
    {
        name: 'default-theme',
        buildPath: [
            mosaicTokensProps,
            mosaicTokensComponents
        ],
        outputPath: 'packages/docs/src/styles/default-theme/',
        selectorCSSVars: '.active-blue'
    },
    {
        name: 'green-theme',
        buildPath: [
            mosaicTokensProps,
            `packages/docs/src/styles/green-theme/properties/**/*.json5`,
            mosaicTokensComponents,
            `packages/docs/src/styles/green-theme/components/**/*.json5`,
        ],
        outputPath: 'packages/docs/src/styles/green-theme/',
        selectorCSSVars: '.active-green'
    },
    {
        name: 'red-theme',
        buildPath: [
            mosaicTokensProps,
            `packages/docs/src/styles/red-theme/properties/**/*.json5`,
            mosaicTokensComponents
        ],
        outputPath: 'packages/docs/src/styles/red-theme/',
        selectorCSSVars: '.active-red'
    },
    {
        name: 'yellow-theme',
        buildPath: [
            mosaicTokensProps,
            `packages/docs/src/styles/yellow-theme/properties/**/*.json5`,
            mosaicTokensComponents
        ],
        outputPath: 'packages/docs/src/styles/yellow-theme/',
        selectorCSSVars: '.active-yellow'
    }
]);

