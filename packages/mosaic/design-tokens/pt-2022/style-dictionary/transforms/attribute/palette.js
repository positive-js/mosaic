module.exports = (StyleDictionary) => {

    StyleDictionary.registerTransform({
        name: 'mc-attribute/palette',
        type: 'attribute',
        matcher: (prop) => prop.name === 'palette',
        transformer: (prop) => ({ palette: true })
    });
};
