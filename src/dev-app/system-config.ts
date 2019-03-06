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

    'rxjs': 'node_modules/rxjs/bundles/rxjs.umd.min.js',
    'rxjs/operators': 'system-rxjs-operators.js',

    // Angular specific mappings.
    '@angular/core': 'node:@angular/core/bundles/core.umd.js',
    '@angular/common': 'node:@angular/common/bundles/common.umd.js',
    '@angular/common/http': 'node:@angular/common/bundles/common-http.umd.js',
    '@angular/compiler': 'node:@angular/compiler/bundles/compiler.umd.js',
    '@angular/forms': 'node:@angular/forms/bundles/forms.umd.js',
    '@angular/animations': 'node:@angular/animations/bundles/animations.umd.js',
    '@angular/elements': 'node:@angular/elements/bundles/elements.umd.js',
    '@angular/router': 'node:@angular/router/bundles/router.umd.js',
    '@angular/animations/browser': 'node:@angular/animations/bundles/animations-browser.umd.js',
    '@angular/platform-browser/animations':
      'node:@angular/platform-browser/bundles/platform-browser-animations.umd',
    '@angular/platform-browser':
      'node:@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser-dynamic':
      'node:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',

    '@ptsecurity/mosaic': 'dist/packages/mosaic/index.js',
    '@ptsecurity/mosaic-examples': 'dist/packages/mosaic-examples/index.js',
    '@ptsecurity/mosaic-moment-adapter': 'dist/packages/mosaic-moment-adapter/index.js',
    '@ptsecurity/cdk': 'dist/packages/cdk/index.js',

    '@ptsecurity/cdk/a11y': 'dist/packages/cdk/a11y/index.js',
    '@ptsecurity/cdk/bidi': 'dist/packages/cdk/bidi/index.js',

    '@ptsecurity/mosaic/button': 'dist/packages/mosaic/button/index.js'
  },
  packages: {
    // Set the default extension for the root package, because otherwise the dev-app can't
    // be built within the production mode. Due to missing file extensions.
    '.': {
      defaultExtension: 'js'
    }
  }
});
