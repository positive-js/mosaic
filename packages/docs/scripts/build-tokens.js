const buildTokens = require('../../mosaic/design-tokens/style-dictionary/build');

const skinPt2022 = 'pt-2022';
const skinLegacy2017 = 'legacy-2017';

const themesConfig = [];

const themeColorNames = ['default-theme', 'green-theme', 'red-theme', 'yellow-theme']

for (const skin of [skinLegacy2017, skinPt2022]) {
    const mosaicTokensProps = `packages/mosaic/design-tokens/${skin}/tokens/properties/**/*.json5`;
    const mosaicTokensComponents = `packages/mosaic/design-tokens/${skin}/tokens/components/**/*.json5`;

    for (const theme of themeColorNames) {
        themesConfig.push({
            name: theme,
            buildPath: [
                mosaicTokensProps,
                `packages/docs/src/styles/${skin}/${theme}/properties/**/*.json5`,
                mosaicTokensComponents
            ],
            outputPath: `packages/docs/src/styles/${skin}/${theme}/`
        });
    }
}

buildTokens(themesConfig);

