
/** Type declaration for ambient System. */
declare const System: any;

System.config({
    paths: {
        'node:*': 'node_modules/*'
    },
    map: {
        'rxjs': 'node:rxjs',
        'main': 'main.js',
        'tslib': 'node:tslib/tslib.js',

        // Angular mappings.
        '@angular/core': 'node:@angular/core/bundles/core.umd.js',
        '@angular/common': 'node:@angular/common/bundles/common.umd.js',
        '@angular/common/http': 'node:@angular/common/bundles/common-http.umd.js',
        '@angular/compiler': 'node:@angular/compiler/bundles/compiler.umd.js',
        '@angular/forms': 'node:@angular/forms/bundles/forms.umd.js',
        '@angular/animations': 'node:@angular/animations/bundles/animations.umd.js',
        '@angular/router': 'node:@angular/router/bundles/router.umd.js',
        '@angular/animations/browser': 'node:@angular/animations/bundles/animations-browser.umd.js',
        '@angular/platform-browser/animations':
            'node:@angular/platform-browser/bundles/platform-browser-animations.umd',
        '@angular/platform-browser':
            'node:@angular/platform-browser/bundles/platform-browser.umd.js',
        '@angular/platform-browser-dynamic':
            'node:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js'
    },
    packages: {
        // RxJS barrel
        'rxjs': {main: 'index'},

        '.': {
            defaultExtension: 'js'
        }
    }
});
