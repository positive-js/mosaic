module.exports = (StyleDictionary) => {

    StyleDictionary.registerFormat({
        name: 'mc-scss/typography',
        formatter: function(dictionary) {
            let string;

            string = dictionary.allProperties
                .map((prop) => {
                    let output = '';

                    const value = prop.attributes.category === 'asset' ? `"${ prop.value }"` : prop.value;

                    output += `$${ prop.name }: ${ value };`

                    if (prop.comment) {
                        output += ` // ${ prop.comment }`;
                    }

                    output += '\n';

                    return output;
                })
                .join('');

            string += `\n$${this.mapName || 'tokens' }: ${processJsonNode(dictionary.properties, 0)};\n`;

            return string;
        }
    })
};


function processJsonNode(obj, depth) {
    let output = '';

    if (obj.hasOwnProperty('value')) {
        output += `$${obj.name}`;
    } else {
        output += '(\n'
        output += Object.keys(obj).map((newKey) => {
            const newProp = obj[newKey];
            const indent = '  '.repeat(depth+1);

            return `${indent}'${newKey}': ${processJsonNode(newProp, depth + 1)}`;
        }).join(',\n');

        output += '\n' + '  '.repeat(depth) + ')';
    }

    return output;
}
