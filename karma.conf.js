const { customLaunchers } = require('./tests/browser-providers');


module.exports = () => {

    return {
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-coverage-istanbul-reporter'),
            require('karma-junit-reporter'),
            require('@angular-devkit/build-angular/plugins/karma')
        ],
        client: {
            clearContext: false // leave Jasmine Spec Runner output visible in browser
        },

        reporters: ['dots', 'junit'],

        port: 9876,
        colors: true,
        logLevel: 'INFO',
        autoWatch: false,

        coverageIstanbulReporter: {
            dir: 'dist/coverage/',
            reports: ['html', 'lcovonly', 'text-summary'],
            fixWebpackSourcePaths: true
        },

        junitReporter: {
            outputDir: process.env.JUNIT_REPORT_PATH || 'dist/reports/junit',
            outputFile: process.env.JUNIT_REPORT_NAME || 'test-results.xml',
            useBrowserName: false
        },

        customLaunchers: customLaunchers,

        browsers: ['ChromeHeadlessLocal'],
        singleRun: true
    };
};
