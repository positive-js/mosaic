import { join } from 'path';

import { buildConfig, BuildPackage } from '../packages';


export const cdkPackage = new BuildPackage('cdk');
export const mosaicPackage = new BuildPackage('mosaic', [cdkPackage]);

mosaicPackage.exportsSecondaryEntryPointsAtRoot = true;
mosaicPackage.sourceDir = join(buildConfig.packagesDir, 'lib');

cdkPackage.copySecondaryEntryPointStylesToRoot = true;
