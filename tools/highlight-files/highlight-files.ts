import { readFileSync, writeFileSync, ensureDirSync } from 'fs-extra';
import { glob } from 'glob';
import { dirname, extname, join, relative } from 'path';

import { regionParser } from '../region-parser/region-parser';

import { highlightCodeBlock } from './highlight-code-block';


function detectAndHighlightRegionBlocks(parsed:
                                            { contents: string; regions: { [p: string]: string } },
                                        basePath: string,
                                        outDir: string) {
    const fileExtension = extname(basePath).substring(1);

    for (const [regionName, regionSnippet] of Object.entries(parsed.regions)) {
        // Create files for each found region
        if (!regionName) {
            continue;
        }

        const highlightedRegion = highlightCodeBlock(regionSnippet, fileExtension);
        // Convert "my-component-example.ts" into "my-component-example_region-ts.html"
        const regionBaseOutputPath = basePath.replace(
            `.${fileExtension}`,
            `_${regionName}-${fileExtension}.html`
        );
        const regionOutputPath = join(outDir, regionBaseOutputPath);

        ensureDirSync(dirname(regionOutputPath));
        writeFileSync(regionOutputPath, highlightedRegion);
    }
}

if (require.main === module) {

    const outDir = 'dist/docs-content/examples-highlighted';
    const packageName = 'packages/mosaic-examples';
    const inputFiles = glob.sync('packages/mosaic-examples/**/*.{html,css,ts}', {
        ignore: ['**/index.ts', '**/modules.ts']
    });

    // Walk through each input file and write transformed markdown output
    // to the specified output directory.
    for (const execPath of inputFiles) {
        // Compute a relative path from the package to the actual input file.
        // e.g `src/components-examples/cdk/<..>/example.ts` becomes `cdk/<..>/example.ts`.
        const basePath = relative(packageName, execPath);
        const fileExtension = extname(basePath).substring(1);
        const parsed = regionParser(readFileSync(execPath, 'utf8'), fileExtension);
        detectAndHighlightRegionBlocks(parsed, basePath, outDir);
        // Convert "my-component-example.ts" into "my-component-example-ts.html"
        const baseOutputPath = basePath.replace(`.${fileExtension}`, `-${fileExtension}.html`);
        const outputPath = join(outDir, baseOutputPath);
        const htmlOutput = highlightCodeBlock(parsed.contents, fileExtension);

        ensureDirSync(dirname(outputPath));
        writeFileSync(outputPath, htmlOutput);
    }

}
