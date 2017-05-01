const webpack = require('../webpack/webpack.test.js');
const helpers = require('../helpers');

module.exports = function (config) {

    const configuration = {
        basePath: '../..',

        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],

        exclude: [],

        files: [
            { pattern: './config/karma/spec-bundle.js', watched: false }
        ],

        logLevel: config.LOG_INFO,

        phantomJsLauncher: {
            exitOnResourceError: true
        },
        preprocessors: { './config/karma/spec-bundle.js': ['coverage', 'webpack', 'sourcemap'] },

        specReporter: {
            maxLogLines: 5
        },

        //reporters: ['dots', 'coverage-istanbul'],
        reporters: ['dots', 'coverage', 'remap-coverage'],

        coverageIstanbulReporter: {
            reports: [ 'html', 'lcovonly' ],
            fixWebpackSourcePaths: true
        },

        coverageReporter: {
            type: 'in-memory'
        },

        remapCoverageReporter: {
            'text-summary': null,
            lcovonly: './coverage/lcov.info',
            json: './coverage/coverage.json',
            html: './coverage/html'
        },

        port: 9876,
        autoWatch: false,
        colors: true,
        singleRun: true,
        failOnEmptyTestSuite: false,

        webpack: webpack,
        webpackMiddleware: {
            stats: 'errors-only'
        }
    };

    config.set(configuration);
};
