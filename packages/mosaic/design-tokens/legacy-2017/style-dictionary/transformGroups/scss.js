module.exports = (StyleDictionary) => {

    StyleDictionary.registerTransformGroup({
        name: 'mc/scss',
        transforms: [
            'attribute/cti',
            'mc-attribute/palette',
            'mc-attribute/typography',
            'name/cti/kebab'
        ]
    });
}
