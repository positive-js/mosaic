import { join } from 'path';

import { buildConfig, BuildPackage } from '../packages';


export const cdkPackage = new BuildPackage('cdk');
export const momentAdapterPackage = new BuildPackage('mosaic-moment-adapter', [cdkPackage]);
export const mosaicPackage = new BuildPackage('mosaic', [cdkPackage, momentAdapterPackage]);
export const examplesPackage = new BuildPackage('mosaic-examples', [mosaicPackage]);

mosaicPackage.exportsSecondaryEntryPointsAtRoot = true;
mosaicPackage.sourceDir = join(buildConfig.packagesDir, 'mosaic');
mosaicPackage.hasSchematics = true;

cdkPackage.copySecondaryEntryPointStylesToRoot = true;
cdkPackage.hasSchematics = true;
