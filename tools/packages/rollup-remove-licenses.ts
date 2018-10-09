// tslint:disable-next-line
import MagicString from 'magic-string';

import { buildConfig } from './build-config';


const licenseBanner = buildConfig.licenseBanner;

/**
 * Rollup plugin that removes all license banners of source files.
 * This is necessary to avoid having the license comment repeated in the output.
 */
export const rollupRemoveLicensesPlugin = {
    name: 'rollup-clean-duplicate-licenses',
    transform: (code: string) => {
        const newContent = new MagicString(code);

        // Walks through every occurrence of a license comment and overwrites it with an empty string.
        // tslint:disable-next-line
        for (let pos = -1; (pos = code.indexOf(licenseBanner, pos + 1)) !== -1; null) {
            newContent.overwrite(pos, pos + licenseBanner.length, '');
        }

        return {
            code: newContent.toString(),
            map: newContent.generateMap({hires: true})
        };
    }
};
