const { join } = require('path');
const { constants } = require('karma');


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
            clearContext: false, // leave Jasmine Spec Runner output visible in browser
            jasmine: {
                random: false
            }
        },
        angularCli: {
            sourceMap: true
        },

        reporters: ['dots', 'junit'],

        files: [
            { pattern: '../../dist/mosaic/prebuilt-themes/default-theme.css', included: true, watched: true },
        ],

        port: 9876,
        colors: true,
        logLevel: constants.LOG_INFO,
        autoWatch: false,
        singleRun: true,

        coverageIstanbulReporter: {
            dir: 'dist/coverage/',
            reports: ['html', 'lcovonly', 'text-summary'],
            fixWebpackSourcePaths: true
        },

        junitReporter: {
            outputDir: process.env.JUNIT_REPORT_PATH || join(__dirname, './dist/reports/junit'),
            outputFile: process.env.JUNIT_REPORT_NAME || join(__dirname, './dist/reports/junit/test-results.xml'),
            suite: '', // suite will become the package name attribute in xml testsuite element
            useBrowserName: true, // add browser name to report and classes names
            nameFormatter: undefined, // function (browser, result) to customize the name attribute in xml testcase element
            classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element
            properties: {} // key value pair of properties to add to the <properties> section of the report
        },

        customLaunchers: {
            'ChromeHeadlessLocal': {
                'base': 'ChromeHeadless',
                'flags': [
                    '--window-size=1024,768',
                    '--no-sandbox'
                ],
                'debug': true
            }
        },

        browsers: ['ChromeHeadlessLocal']
    };
};
