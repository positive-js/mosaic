const path = require('path');
const { customLaunchers } = require('./browser-providers');


module.exports = (config) => {

    config.set({
        basePath: path.join(__dirname, '..'),
        frameworks: ['jasmine'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-sourcemap-loader'),
            require('karma-coverage')
        ],
        files: [
            {pattern: 'node_modules/core-js/client/core.js', included: true, watched: false},
            {pattern: 'node_modules/systemjs/dist/system.src.js', included: true, watched: false},
            {pattern: 'node_modules/zone.js/dist/zone.js', included: true, watched: false},
            {pattern: 'node_modules/zone.js/dist/proxy.js', included: true, watched: false},
            {pattern: 'node_modules/zone.js/dist/sync-test.js', included: true, watched: false},
            {pattern: 'node_modules/zone.js/dist/jasmine-patch.js', included: true, watched: false},
            {pattern: 'node_modules/zone.js/dist/async-test.js', included: true, watched: false},
            {pattern: 'node_modules/zone.js/dist/fake-async-test.js', included: true, watched: false},

            // Include all Angular dependencies
            {pattern: 'node_modules/@angular/**/*', included: false, watched: false},
            {pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false},

            // Paths to support debugging with source maps in dev tools
            {pattern: 'dist/**/*.ts', included: false, watched: false},
            {pattern: 'dist/**/*.js.map', included: false, watched: false}
        ],

        customLaunchers: customLaunchers,

        preprocessors: {
            'dist/**/*.js': ['sourcemap']
        },

        reporters: ['dots'],

        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,

        coverageReporter: {
            type : 'json-summary',
            dir : 'dist/coverage/',
            subdir: '.'
        },


        browserDisconnectTimeout: 20000,
        browserNoActivityTimeout: 240000,
        captureTimeout: 120000,
        browsers: ['ChromeHeadless'],

        singleRun: false,

        browserConsoleLogOptions: {
            terminal: true,
            level: 'log'
        }

    });
};
