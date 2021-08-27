module.exports = (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'css/variables',
        formatter: function(dictionary, config) {
            //
            return `${this.selector} {
${dictionary.allProperties.map((prop) => `    --${prop.name}: ${prop.value};`).join('\n')}
}`
        }
    })
};
