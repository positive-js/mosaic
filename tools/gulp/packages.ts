import { join } from 'path';

import {buildConfig, BuildPackage} from '../packages';


export const mosaicPackage = new BuildPackage('mosaic');

mosaicPackage.exportsSecondaryEntryPointsAtRoot = true;
mosaicPackage.sourceDir = join(buildConfig.packagesDir, 'lib');
