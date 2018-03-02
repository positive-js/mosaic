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
    'tslib': 'tslib',

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

    'rxjs/BehaviorSubject': 'Rx',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx',
    'rxjs/Subscription': 'Rx',
    'rxjs/Observer': 'Rx',
    'rxjs/Subscriber': 'Rx',
    'rxjs/Scheduler': 'Rx',

    'rxjs/observable/combineLatest': 'Rx.Observable',
    'rxjs/observable/forkJoin': 'Rx.Observable',
    'rxjs/observable/fromEvent': 'Rx.Observable',
    'rxjs/observable/merge': 'Rx.Observable',
    'rxjs/observable/of': 'Rx.Observable',
    'rxjs/observable/throw': 'Rx.Observable',
    'rxjs/observable/defer': 'Rx.Observable',
    'rxjs/observable/fromEventPattern': 'Rx.Observable',
    'rxjs/observable/empty': 'Rx.Observable',

    'rxjs/operators/debounceTime': 'Rx.operators',
    'rxjs/operators/takeUntil': 'Rx.operators',
    'rxjs/operators/take': 'Rx.operators',
    'rxjs/operators/first': 'Rx.operators',
    'rxjs/operators/filter': 'Rx.operators',
    'rxjs/operators/map': 'Rx.operators',
    'rxjs/operators/tap': 'Rx.operators',
    'rxjs/operators/startWith': 'Rx.operators',
    'rxjs/operators/auditTime': 'Rx.operators',
    'rxjs/operators/switchMap': 'Rx.operators',
    'rxjs/operators/finalize': 'Rx.operators',
    'rxjs/operators/catchError': 'Rx.operators',
    'rxjs/operators/share': 'Rx.operators',
    'rxjs/operators/delay': 'Rx.operators',
    'rxjs/operators/combineLatest': 'Rx.operators'
};
