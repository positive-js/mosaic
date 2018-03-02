'use strict';

const browserConfig = {
    'Chrome':       { unitTest: {target: 'SL', required: true  }},
    'Firefox':      { unitTest: {target: 'SL', required: true  }},
    'IE10':         { unitTest: {target: 'SL', required: true  }},
    'IE11':         { unitTest: {target: 'SL', required: true  }},
    'Edge':         { unitTest: {target: 'SL', required: true  }},
    'Safari9':      { unitTest: {target: 'SL', required: false }},
    'Safari10':     { unitTest: {target: 'SL', required: true }}
};

/** Exports all available remote browsers. */
exports.customLaunchers = require('./remote_browsers.json');

/** Exports a map of configured browsers, which should run on the CI. */
exports.platformMap = {
    'saucelabs': {
        required: buildConfiguration('unitTest', 'SL', true),
        optional: buildConfiguration('unitTest', 'SL', false)
    },
    'browserstack': {
        required: buildConfiguration('unitTest', 'BS', true),
        optional: buildConfiguration('unitTest', 'BS', false)
    },
};

/** Build a list of configuration (custom launcher names). */
function buildConfiguration(type, target, required) {
    return Object.keys(browserConfig)
            .map(item => [item, browserConfig[item][type]])
            .filter(([, conf]) => conf.required === required && conf.target === target)
            .map(([item]) => `${target}_${item.toUpperCase()}`);
}

/** Decode the token for Travis to use. */
function decodeToken(token) {
    return (token || '').split('').reverse().join('');
}


if (process.env.TRAVIS) {
    process.env.SAUCE_ACCESS_KEY = decodeToken(process.env.SAUCE_ACCESS_KEY);
}
