module.exports = (StyleDictionary) => {

    StyleDictionary.registerFilter({
        name: 'color',
        matcher: (prop) => !prop.attributes.palette && !prop.attributes.typography
    })
}
