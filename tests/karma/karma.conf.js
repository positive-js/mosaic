const webpack = require('../../tools/webpack/webpack.test.js');
const { customLaunchers } = require('../browser-providers');

module.exports = function (config) {

    const configuration = {
        basePath: '../../',

        frameworks: ['jasmine'],

        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-sourcemap-loader'),
            require('karma-coverage'),
            require('karma-webpack')
        ],

        exclude: [],

        files: [
            { pattern: './tests/karma/spec-bundle.js', watched: false }
        ],

        logLevel: config.LOG_INFO,

        customLaunchers: customLaunchers,

        preprocessors: { './tests/karma/spec-bundle.js': ['coverage', 'webpack', 'sourcemap'] },

        browserDisconnectTimeout: 20000,
        browserNoActivityTimeout: 240000,
        captureTimeout: 120000,
        browsers: ['ChromeHeadless'],

        specReporter: {
            maxLogLines: 5
        },

        reporters: ['dots', 'coverage'],

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
