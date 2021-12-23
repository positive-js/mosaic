const _ = require('lodash');
const fs = require('fs-extra');
require('json5/lib/register')

let rawPropColors = require('./legacy-2017/tokens/properties/colors.json5');
let rawPropFonts = require('./legacy-2017/tokens/properties/font.json5');
let rawPropGlobals = require('./legacy-2017/tokens/properties/globals.json5');

const dataByPlatform = {
    web: {}
};

// keep tokens
dataByPlatform.web.colors = rawPropColors;
dataByPlatform.web.fonts = rawPropFonts;
dataByPlatform.web.globals = rawPropGlobals;

fs.outputFileSync('./dist/json/platform-tokens_legacy-2017.json', JSON.stringify(dataByPlatform, null, 4));

rawPropColors = require('./pt-2022/tokens/properties/colors.json5');
rawPropFonts = require('./pt-2022/tokens/properties/font.json5');
rawPropGlobals = require('./pt-2022/tokens/properties/globals.json5');

// keep tokens
dataByPlatform.web.colors = rawPropColors;
dataByPlatform.web.fonts = rawPropFonts;
dataByPlatform.web.globals = rawPropGlobals;

fs.outputFileSync('./dist/json/platform-tokens_pt-2022.json', JSON.stringify(dataByPlatform, null, 4));
