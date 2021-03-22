import { task, src, dest } from 'gulp';
import { join } from 'path';


const releasesDir = 'dist';
const sourceDirProductComponents = 'packages/product-components';


const themingEntryPointPathProductComponents = join(sourceDirProductComponents, 'i18n', '*.json');
const releasePathProductComponents = join(releasesDir, 'product-components');

task('product-components:bundle-i18n', () => {
    return src(themingEntryPointPathProductComponents)
        .pipe(dest(releasePathProductComponents));
});
