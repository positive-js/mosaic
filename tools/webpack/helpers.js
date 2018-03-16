const path = require('path');
const EVENT = process.env.npm_lifecycle_event || '';

// Helper functions
const ROOT = path.resolve(__dirname, '../..');


function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [ROOT].concat(args));
}

function isExternalLib(module, check = /node_modules/) {
    const req = module.userRequest;
    if (typeof req !== 'string') {
        return false;
    }
    return req.search(check) >= 0;
}

module.exports = {
    root,
    isExternalLib
};
