import { BuildPackage } from './build-package';


/**
 * Gets secondary entry-points for a given package in the order they should be built.
 *
 * This currently assumes that every directory under a package should be an entry-point except for
 * specifically black-listed directories.
 */
export function getSecondaryEntryPointsForPackage(pkg: BuildPackage) {

    const packageName = pkg.name;
    const packageDir = pkg.sourceDir;

}
