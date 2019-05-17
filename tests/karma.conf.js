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
            require('karma-coverage'),
            require('karma-junit-reporter')
        ],
        files: [
            {pattern: 'node_modules/core-js/client/core.min.js', included: true, watched: false},
            {pattern: 'node_modules/tslib/tslib.js', included: false, watched: false},
            {pattern: 'node_modules/systemjs/dist/system.js', included: true, watched: false},
            {pattern: 'node_modules/zone.js/dist/zone.min.js', included: true, watched: false},
            {pattern: 'node_modules/zone.js/dist/proxy.min.js', included: true, watched: false},
            {pattern: 'node_modules/zone.js/dist/sync-test.js', included: true, watched: false},
            {pattern: 'node_modules/zone.js/dist/jasmine-patch.min.js', included: true, watched: false},
            {pattern: 'node_modules/zone.js/dist/async-test.js', included: true, watched: false},
            {pattern: 'node_modules/zone.js/dist/fake-async-test.js', included: true, watched: false},
            {pattern: 'node_modules/moment/min/moment-with-locales.min.js', included: false, watched: false},
            {pattern: 'node_modules/messageformat/messageformat.js', included: false, watched: false},

            // Include all Angular dependencies
            {pattern: 'node_modules/@angular/**/*', included: false, watched: false},
            {pattern: 'node_modules/rxjs/**/*', included: false, watched: false},

            {pattern: 'tests/karma-system-config.js', included: true, watched: false},
            {pattern: 'tests/karma-test-shim.js', included: true, watched: false},

            // Include theme in the test suite.
            {pattern: 'dist/packages/**/core/theming/prebuilt/default-theme.css', included: true, watched: true},

            // Paths to support debugging with source maps in dev tools
            {pattern: 'dist/packages/**/*', included: false, watched: true},
        ],

        customLaunchers: customLaunchers,

        preprocessors: {
            'dist/packages/**/*.js': ['sourcemap']
        },

        reporters: ['dots', 'junit'],

        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,

        coverageReporter: {
            dir : 'dist/coverage/',
            subdir: '.',
            reporters: [
                { type: 'lcov' }
            ]
        },

        junitReporter: {
            outputDir: process.env.JUNIT_REPORT_PATH || 'dist/reports/junit',
            outputFile: process.env.JUNIT_REPORT_NAME || 'test-results.xml',
            useBrowserName: false
        },

        browserDisconnectTimeout: 20000,
        browserNoActivityTimeout: 240000,
        captureTimeout: 120000,
        browsers: ['ChromeHeadlessLocal'],

        singleRun: false,

        transports: ['websocket', 'polling'],

        browserConsoleLogOptions: {
            terminal: true,
            level: 'log'
        },

        client: {
            jasmine: {
                random: false
            }
        }
    });

    config.preprocessors['dist/packages/**/!(*+(.|-)spec).js'] = ['coverage'];
    config.reporters.push('coverage');
};
