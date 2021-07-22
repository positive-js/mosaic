module.exports = (StyleDictionary) => {

    StyleDictionary.registerFilter({
        name: 'typography',
        matcher: (prop) => prop.attributes.typography
    })
}
