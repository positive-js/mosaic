/** Type declaration for ambient System. */
declare const System: any;

// Configure the base path and map the different node packages.
System.config({
    paths: {
        'node:*': 'node_modules/*'
    },
    map: {
        'main': 'main.js',
        'tslib': 'node:tslib/tslib.js',
        'moment': 'node:moment/min/moment-with-locales.min.js',
        'messageformat': 'node:messageformat/messageformat.js',

        'rxjs': 'node_modules/rxjs/bundles/rxjs.umd.min.js',
        'rxjs/operators': 'system-rxjs-operators.js',

        // Angular CDK specific mappings.
        '@angular/cdk/a11y': 'node:@angular/cdk/bundles/cdk-a11y.umd.js',
        '@angular/cdk/bidi': 'node:@angular/cdk/bundles/cdk-bidi.umd.js',
        '@angular/cdk/coercion': 'node:@angular/cdk/bundles/cdk-coercion.umd.js',
        '@angular/cdk/collections': 'node:@angular/cdk/bundles/cdk-collections.umd.js',
        '@angular/cdk/keycodes': 'node:@angular/cdk/bundles/cdk-keycodes.umd.js',
        '@angular/cdk/platform': 'node:@angular/cdk/bundles/cdk-platform.umd.js',
        '@angular/cdk/portal': 'node:@angular/cdk/bundles/cdk-portal.umd.js',
        '@angular/cdk/overlay': 'node:@angular/cdk/bundles/cdk-overlay.umd.js',
        '@angular/cdk/observers': 'node:@angular/cdk/bundles/cdk-observers.umd.js',
        '@angular/cdk/scrolling': 'node:@angular/cdk/bundles/cdk-scrolling.umd.js',

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
        '@angular/router': 'node:@angular/router/bundles/router.umd.js',
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

        '@ptsecurity/cdk': 'dist/packages/cdk/index.js',
        '@ptsecurity/cdk/a11y': 'dist/packages/cdk/a11y/index.js',
        '@ptsecurity/cdk/datetime': 'dist/packages/cdk/datetime/index.js',
        '@ptsecurity/cdk/keycodes': 'dist/packages/cdk/keycodes/index.js',
        '@ptsecurity/cdk/testing': 'dist/packages/cdk/testing/index.js',
        '@ptsecurity/cdk/tree': 'dist/packages/cdk/tree/index.js',

        '@ptsecurity/mosaic-moment-adapter': 'dist/packages/mosaic-moment-adapter/index.js',
        '@ptsecurity/mosaic-moment-adapter/adapter': 'dist/packages/mosaic-moment-adapter/adapter/index.js',

        '@ptsecurity/mosaic': 'dist/packages/mosaic/index.js',

        '@ptsecurity/mosaic/autocomplete': 'dist/packages/mosaic/autocomplete/index.js',
        '@ptsecurity/mosaic/button': 'dist/packages/mosaic/button/index.js',
        '@ptsecurity/mosaic/button-toggle': 'dist/packages/mosaic/button-toggle/index.js',
        '@ptsecurity/mosaic/core': 'dist/packages/mosaic/core/index.js',
        '@ptsecurity/mosaic/card': 'dist/packages/mosaic/card/index.js',
        '@ptsecurity/mosaic/datepicker': 'dist/packages/mosaic/datepicker/index.js',
        '@ptsecurity/mosaic/divider': 'dist/packages/mosaic/divider/index.js',
        '@ptsecurity/mosaic/dropdown': 'dist/packages/mosaic/dropdown/index.js',
        '@ptsecurity/mosaic/list': 'dist/packages/mosaic/list/index.js',
        '@ptsecurity/mosaic/navbar': 'dist/packages/mosaic/navbar/index.js',
        '@ptsecurity/mosaic/popover': 'dist/packages/mosaic/popover/index.js',
        '@ptsecurity/mosaic/progress-bar': 'dist/packages/mosaic/progress-bar/index.js',
        '@ptsecurity/mosaic/progress-spinner': 'dist/packages/mosaic/progress-spinner/index.js',
        '@ptsecurity/mosaic/icon': 'dist/packages/mosaic/icon/index.js',
        '@ptsecurity/mosaic/link': 'dist/packages/mosaic/link/index.js',
        '@ptsecurity/mosaic/radio': 'dist/packages/mosaic/radio/index.js',
        '@ptsecurity/mosaic/checkbox': 'dist/packages/mosaic/checkbox/index.js',
        '@ptsecurity/mosaic/input': 'dist/packages/mosaic/input/index.js',
        '@ptsecurity/mosaic/form-field': 'dist/packages/mosaic/form-field/index.js',
        '@ptsecurity/mosaic/tree': 'dist/packages/mosaic/tree/index.js',
        '@ptsecurity/mosaic/modal': 'dist/packages/mosaic/modal/index.js',
        '@ptsecurity/mosaic/tags': 'dist/packages/mosaic/tags/index.js',
        '@ptsecurity/mosaic/tabs': 'dist/packages/mosaic/tabs/index.js',
        '@ptsecurity/mosaic/select': 'dist/packages/mosaic/select/index.js',
        '@ptsecurity/mosaic/sidepanel': 'dist/packages/mosaic/sidepanel/index.js',
        '@ptsecurity/mosaic/textarea': 'dist/packages/mosaic/textarea/index.js',
        '@ptsecurity/mosaic/toggle': 'dist/packages/mosaic/toggle/index.js',
        '@ptsecurity/mosaic/tooltip': 'dist/packages/mosaic/tooltip/index.js',
        '@ptsecurity/mosaic/timepicker': 'dist/packages/mosaic/timepicker/index.js',
        '@ptsecurity/mosaic/tree-select': 'dist/packages/mosaic/tree-select/index.js',
        '@ptsecurity/mosaic/splitter': 'dist/packages/mosaic/splitter/index.js',
        '@ptsecurity/mosaic/vertical-navbar': 'dist/packages/mosaic/vertical-navbar/index.js'
    },
    packages: {
        // Set the default extension for the root package, because otherwise the dev-app can't
        // be built within the production mode. Due to missing file extensions.
        '.': {
            defaultExtension: 'js'
        }
    }
});
