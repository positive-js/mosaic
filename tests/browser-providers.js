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
