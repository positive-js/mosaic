import { join } from 'path';

import { buildConfig } from './build-config';
import { getSubdirectoryNames } from './secondary-entry-points';
import { dashCaseToCamelCase } from './utils';

/** List of potential secondary entry-points for the cdk package. */
const cdkSecondaryEntryPoints = getSubdirectoryNames(join(buildConfig.packagesDir, 'cdk'));

/** Object with all cdk entry points in the format of Rollup globals. */
const rollupCdkEntryPoints = cdkSecondaryEntryPoints.reduce((globals: any, entryPoint: string) => {
    globals[`@ptsecurity/cdk/${entryPoint}`] = `ng.cdk.${dashCaseToCamelCase(entryPoint)}`;

    return globals;
}, {});

/** List of potential secondary entry-points for the material package. */
const mcSecondaryEntryPoints = getSubdirectoryNames(join(buildConfig.packagesDir, 'lib'));

const rollupMcEntryPoints = mcSecondaryEntryPoints.reduce((globals: any, entryPoint: string) => {
    globals[`@ptsecurity/mosaic/${entryPoint}`] = `ng.mosaic.${dashCaseToCamelCase(entryPoint)}`;

    return globals;
}, {});

/** Map of globals that are used inside of the different packages. */
export const rollupGlobals = {
    tslib: 'tslib',

    '@angular/animations': 'ng.animations',
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/forms': 'ng.forms',
    '@angular/common/http': 'ng.common.http',
    '@angular/router': 'ng.router',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-server': 'ng.platformServer',
    '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
    '@angular/platform-browser/animations': 'ng.platformBrowser.animations',
    '@angular/core/testing': 'ng.core.testing',
    '@angular/common/testing': 'ng.common.testing',
    '@angular/common/http/testing': 'ng.common.http.testing',

    '@ptsecurity/mosaic': 'ng.mosaic',
    '@ptsecurity/cdk': 'ng.cdk',

    ...rollupCdkEntryPoints,
    ...rollupMcEntryPoints,

    rxjs: 'Rx',
    'rxjs/operators': 'Rx.operators'
};
