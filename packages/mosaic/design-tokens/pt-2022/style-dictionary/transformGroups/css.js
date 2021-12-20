module.exports = (StyleDictionary) => {

    StyleDictionary.registerTransformGroup({
        name: 'mc/css',
        transforms: [
            'attribute/cti',
            'mc-attribute/size',
            'name/cti/kebab',
            'color/css',
            'mc/prefix'
        ]
    });
};
