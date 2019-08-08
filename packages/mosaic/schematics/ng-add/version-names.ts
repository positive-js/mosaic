/** Name of the Mosaic version that is shipped together with the schematics. */
export const mosaicVersion =
    loadPackageVersionGracefully('@ptsecurity/cdk') ||
    loadPackageVersionGracefully('@ptsecurity/mosaic');

/**
 * Range of Angular versions that can be used together with the Mosaic version
 * that provides these schematics.
 */
export const requiredAngularVersionRange = '0.0.0-NG';

export const angularCDKVersion = '^8.0.0';


/** Loads the full version from the given Angular package gracefully. */
function loadPackageVersionGracefully(packageName: string): string | null {
    try {
        // tslint:disable-next-line:non-literal-require
        return require(`${packageName}/package.json`).version;
    } catch {
        return null;
    }
}
