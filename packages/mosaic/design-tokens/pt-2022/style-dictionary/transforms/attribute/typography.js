module.exports = (StyleDictionary) => {

    StyleDictionary.registerTransform({
        name: 'mc-attribute/typography',
        type: 'attribute',
        matcher: (prop) => prop.attributes.category === 'typography',
        transformer: (prop) => ({typography: true})
    });
};
