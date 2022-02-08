const StyleDictionary = require('style-dictionary');
const getPlatformConfig = require('./configs');

// ==== Include custom transforms ====
require('./transforms/attribute/typography')(StyleDictionary);
require('./transforms/attribute/palette')(StyleDictionary);
require('./transforms/attribute/prefix')(StyleDictionary);
require('./transforms/attribute/size')(StyleDictionary);

// ==== Include custom filters ====
require('./filters/palette')(StyleDictionary);
require('./filters/color')(StyleDictionary);
require('./filters/size')(StyleDictionary);
require('./filters/typography')(StyleDictionary);

// ==== Include custom transform groups ====
require('./transformGroups/scss')(StyleDictionary);
require('./transformGroups/css')(StyleDictionary);

// ==== Include custom formats ====
require('./formats/typography')(StyleDictionary);
require('./formats/palette')(StyleDictionary);

// ==== Run build ====
console.log('Build started...');
console.log('==============================================');

module.exports = (themeConfig) => {
    StyleDictionary.registerFileHeader({
        name: 'customHeader',
        fileHeader: () => {
            return [`Do not edit directly`];
        }
    });
    console.log('themeConfig: ', themeConfig);

    if (!themeConfig || themeConfig.length === 0) {
        console.error('Build Failed. Please set ThemeConfig, for example: ', {
                name: 'default-theme',
                buildPath: [
                    `packages/mosaic/design-tokens/tokens/properties/**/*.json5`,
                    `packages/mosaic/design-tokens/tokens/components/**/*.json5`
                ],
                outputPath: 'packages/mosaic/design-tokens/'
            }
        )
        process.exit(0);
    }

    themeConfig.map((platform) => {
        // APPLY THE CONFIGURATION
        // Very important: the registration of custom transforms
        // needs to be done _before_ applying the configuration
        const StyleDictionaryExtended = StyleDictionary.extend(getPlatformConfig(platform));

        // FINALLY, BUILD ALL THE PLATFORMS
        StyleDictionaryExtended.buildAllPlatforms();
    });

    console.log('\n==============================================');
    console.log('\nBuild completed!');
}
