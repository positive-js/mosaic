const _ = require('lodash');
const fs = require('fs-extra');
require('json5/lib/register')

const rawPropColors= require('./tokens/properties/colors.json5');
const rawPropFonts= require('./tokens/properties/font.json5');
const rawPropGlobals= require('./tokens/properties/globals.json5');

const dataByPlatform = {
    web: {}
};

// keep tokens
dataByPlatform.web.colors = rawPropColors;
dataByPlatform.web.fonts = rawPropFonts;
dataByPlatform.web.globals = rawPropGlobals;

fs.outputFileSync('./dist/json/platform-tokens.json', JSON.stringify(dataByPlatform, null, 4));
