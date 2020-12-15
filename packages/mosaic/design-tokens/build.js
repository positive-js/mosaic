const StyleDictionary = require('style-dictionary');

console.log('Build started...');
console.log('\n==============================================');


// REGISTER THE CUSTOM TRANFORMS

StyleDictionary.registerTransform({
    name: 'mc-transform/scss/palette', // notice: the name is an override of an existing predefined method (yes, you can do it)
    type: 'name',
    matcher: function (prop) {
        // this is an example of a possible filter (based on the "cti" values) to show how a "matcher" works
        return prop.attributes.category === 'palette';
    },
    transformer: function (prop) {
        return `${ prop.value }px`;
    }
});

StyleDictionary.registerTransform({
    name: 'mc-transform/scss/color', // notice: the name is an override of an existing predefined method (yes, you can do it)
    type: 'name',
    matcher: function (prop) {
        // this is an example of a possible filter (based on the "cti" values) to show how a "matcher" works
        return prop.attributes.category === 'color';
    },
    transformer: function (prop) {
        return `${ prop.value }px`;
    }
});


StyleDictionary.registerFormat({
    name: 'mc-format/scss/map-deep',
    formatter: function(dictionary, config) {
        return JSON.stringify(dictionary.properties, null, 2);
    }
})

// REGISTER THE CUSTOM TRANFORM GROUPS

// if you want to see what a pre-defined group contains, uncomment the next line:
// console.log(StyleDictionary.transformGroup['group_name']);

StyleDictionary.registerTransformGroup({
    name: 'mosaic/scss',
    // notice: here the "size/px" transform is not the pre-defined one, but the custom one we have declared above
    transforms: [
        'attribute/cti',
        'mc-transform/scss/palette',
        'mc-transform/scss/color'
    ]
});

StyleDictionary.registerFilter({
    name: 'isColor',
    matcher: function(prop) {
        console.log('prop:', prop);
        return prop.attributes.category === 'colors';
    }
})


// APPLY THE CONFIGURATION
// IMPORTANT: the registration of custom transforms
// needs to be done _before_ applying the configuration
StyleDictionaryExtended = StyleDictionary.extend(__dirname + '/config.json');


// FINALLY, BUILD ALL THE PLATFORMS
StyleDictionaryExtended.buildAllPlatforms();


console.log('\n==============================================');
console.log('\nBuild completed!');
