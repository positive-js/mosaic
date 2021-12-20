module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'mc-attribute/size',
        type: 'attribute',
        matcher: (prop) => prop.attributes.type === 'size',
        transformer: (prop) => ({size: true})
    });
}
