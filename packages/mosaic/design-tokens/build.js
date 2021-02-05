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
    transformer: (prop) => ({ palette: true })
});

StyleDictionary.registerTransform({
    name: 'mc-attribute/typography',
    type: 'attribute',
    matcher: (prop) => prop.attributes.category === 'typography',
    transformer: (prop) => ({ typography: true })
});

StyleDictionary.registerTransform({
    name: 'mc-attribute/size',
    type: 'attribute',
    matcher: (prop) => prop.attributes.type === 'size',
    transformer: (prop) => ({ size: true })
});

StyleDictionary.registerTransform({
    name: 'mc/prefix',
    type: 'attribute',
    transformer: (prop, options) => {
        const prefix = options.files[0].prefix ? `${options.files[0].prefix}-` : '';

        prop.name = `${prefix}${prop.name}`;
    }
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
        'mc-attribute/typography',
        'name/cti/kebab'
    ]
});

StyleDictionary.registerTransformGroup({
    name: 'mc/css',
    transforms: [
        'attribute/cti',
        'mc-attribute/size',
        'name/cti/kebab',
        'color/css',
        'mc/prefix'
    ]
});

StyleDictionary.registerFilter({
    name: 'palette',
    matcher: (prop) => prop.attributes.palette
})

StyleDictionary.registerFilter({
    name: 'typography',
    matcher: (prop) => prop.attributes.typography
})

StyleDictionary.registerFilter({
    name: 'color',
    matcher: (prop) => !prop.attributes.palette && !prop.attributes.typography
})

StyleDictionary.registerFilter({
    name: 'size',
    matcher: (prop) => prop.attributes.size
})

// APPLY THE CONFIGURATION
// IMPORTANT: the registration of custom transforms
// needs to be done _before_ applying the configuration
const StyleDictionaryExtended = StyleDictionary.extend(__dirname + '/config.json5');

const buildPath = process.argv[2];

StyleDictionaryExtended.options.platforms.scss.buildPath = buildPath;
StyleDictionaryExtended.options.platforms.css.buildPath = buildPath;
StyleDictionaryExtended.options.platforms.js.buildPath = buildPath;

// FINALLY, BUILD ALL THE PLATFORMS
StyleDictionaryExtended.buildAllPlatforms();


console.log('\n==============================================');
console.log('\nBuild completed!');
