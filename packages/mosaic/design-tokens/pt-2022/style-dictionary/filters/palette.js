module.exports = (StyleDictionary) => {

    StyleDictionary.registerFilter({
        name: 'palette',
        matcher: (prop) => prop.attributes.palette
    })
}
