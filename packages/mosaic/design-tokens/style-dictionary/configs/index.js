const merge = require('lodash/merge');

const scssConfig = require('./scss');
const jsConfig = require('./js');
const cssConfig = require('./css');

const filterObj = {
    options: {
        showFileHeader: true
    }
};

function filterOptions(platforms) {
    const platformObj = {};

    platforms.map(p => Object.assign(platformObj, p));

    Object.keys(platformObj).forEach((p) => {
        platformObj[p].files.map(f => merge(f, filterObj));
    });

    return platformObj;
}

function getSources(theme) {
    // Example
    // [
    //         `packages/design-tokens/tokens/${theme}/properties/**/*.json5`,
    //         `packages/design-tokens/tokens/${theme}/components/**/*.json5`
    //     ];
    return theme.buildPath;
}

function getConfigs(theme) {

    scssConfig.scss.buildPath = theme.outputPath;
    jsConfig.js.buildPath = theme.outputPath;
    cssConfig.css.buildPath = theme.outputPath;

    return filterOptions([scssConfig, jsConfig, cssConfig]);
}

module.exports = (theme) => {
    const sources = [
        ...getSources(theme)
    ];
    return {
        source: sources,
        platforms: getConfigs(theme)
    };
};
