'use strict';

const path = require('path');
const tsConfigPaths = require('tsconfig-paths');
const tsNode = require('ts-node');

const tsconfigPath = path.join(__dirname, 'tools/gulp/tsconfig.json');
const tsconfig = require(tsconfigPath);

// TS compilation.
tsNode.register({
    project: tsconfigPath
});

tsConfigPaths.register({
    baseUrl: path.dirname(tsconfigPath),
    paths: tsconfig.compilerOptions.paths
});

require('./tools/gulp/gulpfile');
