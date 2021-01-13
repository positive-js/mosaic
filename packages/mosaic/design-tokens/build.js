const StyleDictionary = require('style-dictionary');


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

console.log('Build started...');
console.log('\n==============================================');


StyleDictionary.registerTransform({
    name: 'mc-attribute/palette',
    type: 'attribute',
    matcher: (prop) => prop.name === 'palette',
    transformer: (prop) => ({ palette: prop.value })
});


StyleDictionary.registerFormat({
    name: 'mc-scss/palette',
    formatter: function(dictionary) {
        return dictionary.allProperties
            .map((prop) => `\$${prop.name}: ${getMapFromObj(prop.value)};\n`)
            .join('\n');
    }
})

StyleDictionary.registerTransformGroup({
    name: 'mc/scss',
    transforms: [
        'attribute/cti',
        'mc-attribute/palette',
        'name/cti/kebab'
    ]
});

StyleDictionary.registerFilter({
    name: 'palette',
    matcher: (prop) => prop.attributes.palette
})

StyleDictionary.registerFilter({
    name: 'notPalette',
    matcher: (prop) => !prop.attributes.palette
})


// APPLY THE CONFIGURATION
// IMPORTANT: the registration of custom transforms
// needs to be done _before_ applying the configuration
const StyleDictionaryExtended = StyleDictionary.extend(__dirname + '/config.json');


// FINALLY, BUILD ALL THE PLATFORMS
StyleDictionaryExtended.buildAllPlatforms();


console.log('\n==============================================');
console.log('\nBuild completed!');
