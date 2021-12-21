module.exports = (StyleDictionary) => {

    StyleDictionary.registerFilter({
        name: 'size',
        matcher: (prop) => prop.attributes.size
    })
}
