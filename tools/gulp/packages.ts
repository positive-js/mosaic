import { join } from 'path';

import { buildConfig, BuildPackage } from '../packages';


export const cdkPackage = new BuildPackage('cdk');
export const mosaicDateAdapterPackage = new BuildPackage('mosaic-moment-adapter', [cdkPackage]);
export const mosaicPackage = new BuildPackage('mosaic', [cdkPackage, mosaicDateAdapterPackage]);
export const examplesPackage = new BuildPackage('mosaic-examples', [mosaicPackage]);

mosaicPackage.exportsSecondaryEntryPointsAtRoot = true;
mosaicPackage.sourceDir = join(buildConfig.packagesDir, 'lib');

cdkPackage.copySecondaryEntryPointStylesToRoot = true;
cdkPackage.hasSchematics = true;

mosaicDateAdapterPackage.exportsSecondaryEntryPointsAtRoot = true;
mosaicDateAdapterPackage.sourceDir = join(buildConfig.packagesDir, 'mosaic-moment-adapter');
