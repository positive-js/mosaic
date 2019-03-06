// Configure the base path and map the different node packages.
System.config({
    baseURL: '/base',
    paths: {
        'node:*': 'node_modules/*'
    },
    map: {
        'rxjs': 'node:rxjs',
        'tslib': 'node:tslib/tslib.js',
        'moment': 'node:moment/min/moment-with-locales.min.js',
        'messageformat': 'node:messageformat/messageformat.min.js',

        // Angular specific mappings.
        '@angular/core': 'node:@angular/core/bundles/core.umd.js',
        '@angular/core/testing': 'node:@angular/core/bundles/core-testing.umd.js',
        '@angular/common': 'node:@angular/common/bundles/common.umd.js',
        '@angular/common/testing': 'node:@angular/common/bundles/common-testing.umd.js',
        '@angular/common/http': 'node:@angular/common/bundles/common-http.umd.js',
        '@angular/common/http/testing': 'node:@angular/common/bundles/common-http-testing.umd.js',
        '@angular/compiler': 'node:@angular/compiler/bundles/compiler.umd.js',
        '@angular/compiler/testing': 'node:@angular/compiler/bundles/compiler-testing.umd.js',
        '@angular/forms': 'node:@angular/forms/bundles/forms.umd.js',
        '@angular/forms/testing': 'node:@angular/forms/bundles/forms-testing.umd.js',
        '@angular/animations': 'node:@angular/animations/bundles/animations.umd.js',
        '@angular/animations/browser': 'node:@angular/animations/bundles/animations-browser.umd.js',
        '@angular/platform-browser/animations':
            'node:@angular/platform-browser/bundles/platform-browser-animations.umd',
        '@angular/platform-browser':
            'node:@angular/platform-browser/bundles/platform-browser.umd.js',
        '@angular/platform-browser/testing':
            'node:@angular/platform-browser/bundles/platform-browser-testing.umd.js',
        '@angular/platform-browser-dynamic':
            'node:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
        '@angular/platform-browser-dynamic/testing':
            'node:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js',

        // Path for local packages. Can be imported inside of tests.
        '@ptsecurity/mosaic': 'dist/packages/mosaic/index.js',

        '@ptsecurity/cdk': 'dist/packages/cdk/index.js',
        '@ptsecurity/cdk/a11y': 'dist/packages/cdk/a11y/index.js',
        '@ptsecurity/cdk/accordion': 'dist/packages/cdk/accordion/index.js',
        '@ptsecurity/cdk/bidi': 'dist/packages/cdk/bidi/index.js',
        '@ptsecurity/cdk/datetime': 'dist/packages/cdk/datetime/index.js',
        '@ptsecurity/cdk/coercion': 'dist/packages/cdk/coercion/index.js',
        '@ptsecurity/cdk/collections': 'dist/packages/cdk/collections/index.js',
        '@ptsecurity/cdk/keycodes': 'dist/packages/cdk/keycodes/index.js',
        '@ptsecurity/cdk/layout': 'dist/packages/cdk/layout/index.js',
        '@ptsecurity/cdk/overlay': 'dist/packages/cdk/overlay/index.js',
        '@ptsecurity/cdk/platform': 'dist/packages/cdk/platform/index.js',
        '@ptsecurity/cdk/portal': 'dist/packages/cdk/portal/index.js',
        '@ptsecurity/cdk/scrolling': 'dist/packages/cdk/scrolling/index.js',
        '@ptsecurity/cdk/testing': 'dist/packages/cdk/testing/index.js',
        '@ptsecurity/cdk/tree': 'dist/packages/cdk/tree/index.js',

        '@ptsecurity/mosaic-moment-adapter': 'dist/packages/mosaic-moment-adapter/index.js',
        '@ptsecurity/mosaic-moment-adapter/adapter': 'dist/packages/mosaic-moment-adapter/adapter/index.js',

        '@ptsecurity/mosaic/button': 'dist/packages/mosaic/button/index.js',
        '@ptsecurity/mosaic/core': 'dist/packages/mosaic/core/index.js',
        '@ptsecurity/mosaic/divider': 'dist/packages/mosaic/divider/index.js',
        '@ptsecurity/mosaic/dropdown': 'dist/packages/mosaic/dropdown/index.js',
        '@ptsecurity/mosaic/list': 'dist/packages/mosaic/list/index.js',
        '@ptsecurity/mosaic/progress-bar': 'dist/packages/mosaic/progress-bar/index.js',
        '@ptsecurity/mosaic/progress-spinner': 'dist/packages/mosaic/progress-spinner/index.js',
        '@ptsecurity/mosaic/icon': 'dist/packages/mosaic/icon/index.js',
        '@ptsecurity/mosaic/radio': 'dist/packages/mosaic/radio/index.js',
        '@ptsecurity/mosaic/checkbox': 'dist/packages/mosaic/checkbox/index.js',
        '@ptsecurity/mosaic/input': 'dist/packages/mosaic/input/index.js',
        '@ptsecurity/mosaic/form-field': 'dist/packages/mosaic/form-field/index.js',
        '@ptsecurity/mosaic/tree': 'dist/packages/mosaic/tree/index.js',
        '@ptsecurity/mosaic/modal': 'dist/packages/mosaic/modal/index.js',
        '@ptsecurity/mosaic/tag': 'dist/packages/mosaic/tag/index.js',
        '@ptsecurity/mosaic/tabs': 'dist/packages/mosaic/tabs/index.js',
        '@ptsecurity/mosaic/select': 'dist/packages/mosaic/select/index.js',
        '@ptsecurity/mosaic/sidepanel': 'dist/packages/mosaic/sidepanel/index.js',
        '@ptsecurity/mosaic/textarea': 'dist/packages/mosaic/textarea/index.js',
        '@ptsecurity/mosaic/tooltip': 'dist/packages/mosaic/tooltip/index.js',
        '@ptsucurity/mosaic/timepicker': 'dist/packages/mosaic/timepicker/index.js',
        '@ptsecurity/mosaic/splitter': 'dist/packages/mosaic/splitter/index.js'
    },
    packages: {
        // Thirdparty barrels.
        'rxjs': {main: 'index'},
        'rxjs/operators': {main: 'index'},

        // Set the default extension for the root package, because otherwise the demo-app can't
        // be built within the production mode. Due to missing file extensions.
        '.': {
            defaultExtension: 'js'
        }
    }
});
