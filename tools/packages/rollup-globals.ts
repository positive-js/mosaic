import { join } from 'path';

import { buildConfig } from './build-config';
import { getSubdirectoryNames } from './secondary-entry-points';
import { dashCaseToCamelCase } from './utils';


/** Generates rollup entry point mappings for the given package and entry points. */
function generateRollupEntryPoints(packageName: string, entryPoints: string[]):
    {[k: string]: string} {
    return entryPoints.reduce((globals: {[k: string]: string}, entryPoint: string) => {
        globals[`@ptsecurity/${packageName}/${entryPoint}`] =
            `ng.${dashCaseToCamelCase(packageName)}.${dashCaseToCamelCase(entryPoint)}`;

        return globals;
    }, {});
}

/** List of potential secondary entry-points for the cdk package. */
const cdkSecondaryEntryPoints = getSubdirectoryNames(join(buildConfig.packagesDir, 'cdk'));

/** List of potential secondary entry-points for the mosaic-date-adapters package. */
const mosaicDateAdaptersSecondaryEntryPoints =
    getSubdirectoryNames(join(buildConfig.packagesDir, 'mosaic-date-adapters'));

/** List of potential secondary entry-points for the package. */
const mcSecondaryEntryPoints = getSubdirectoryNames(join(buildConfig.packagesDir, 'lib'));


/** Object with all cdk entry points in the format of Rollup globals. */
const rollupCdkEntryPoints = generateRollupEntryPoints('cdk', cdkSecondaryEntryPoints);

/** Object with all mosaic-date-adapters entry points in the format of Rollup globals. */
const rollupMcDatAdaptersEntryPoints =
    generateRollupEntryPoints('mosaic-date-adapters', mosaicDateAdaptersSecondaryEntryPoints);

/** Object with all mosaic entry points in the format of Rollup globals. */
const rollupMcEntryPoints = generateRollupEntryPoints('mosaic', mcSecondaryEntryPoints);


/** Map of globals that are used inside of the different packages. */
export const rollupGlobals = {
    /* tslint:disable-next-line:object-literal-key-quotes */
    'tslib': 'tslib',
    /* tslint:disable-next-line:object-literal-key-quotes */
    'moment': 'moment.moment',

    '@angular/animations': 'ng.animations',
    '@angular/common': 'ng.common',
    '@angular/common/http': 'ng.common.http',
    '@angular/common/http/testing': 'ng.common.http.testing',
    '@angular/common/testing': 'ng.common.testing',
    '@angular/core': 'ng.core',
    '@angular/core/testing': 'ng.core.testing',
    '@angular/forms': 'ng.forms',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
    '@angular/platform-browser-dynamic/testing': 'ng.platformBrowserDynamic.testing',
    '@angular/platform-browser/animations': 'ng.platformBrowser.animations',
    '@angular/platform-server': 'ng.platformServer',
    '@angular/router': 'ng.router',

    '@ptsecurity/cdk': 'ng.cdk',
    '@ptsecurity/mosaic-date-adapters': 'ng.mosaicDateAdapters',
    '@ptsecurity/mosaic': 'ng.mosaic',
    '@ptsecurity/mosaic-examples': 'ng.mosaicExamples',

    ...rollupCdkEntryPoints,
    ...rollupMcDatAdaptersEntryPoints,
    ...rollupMcEntryPoints,
    /* tslint:disable-next-line:object-literal-key-quotes */
    'rxjs': 'rxjs',
    'rxjs/operators': 'rxjs.operators'
};
