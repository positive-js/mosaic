
module.exports = (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'mc-scss/palette',
        formatter: function (dictionary) {
            return dictionary.allProperties
                .map((prop) => `\$${prop.name}: ${getMapFromObj(prop.value)};\n`)
                .join('\n');
        }
    })
};

function getMapFromObj(object) {
    const result = Object.keys(object)
        .map((key) => {
            if (key === 'contrast') {
                return `${key}: ${getMapFromObj(object[key])}`
            }

            return `${key}: ${object[key].value},\n`
        })
        .join('');

    return `(\n${result}\n)`
}
