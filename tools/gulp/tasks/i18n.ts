import { task, src, dest } from 'gulp';
import { join } from 'path';


const releasesDir = 'dist';
const sourceDirProductComponents = 'packages/mosaic-common-components';


const themingEntryPointPathProductComponents = join(sourceDirProductComponents, 'i18n', '*.json');
const releasePathProductComponents = join(releasesDir, 'mosaic-common-components');

task('mosaic-common-components:bundle-i18n', () => {
    return src(themingEntryPointPathProductComponents)
        .pipe(dest(releasePathProductComponents));
});
