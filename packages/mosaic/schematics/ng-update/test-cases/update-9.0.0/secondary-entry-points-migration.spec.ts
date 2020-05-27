import { readFileSync } from 'fs';

import { createTestCaseSetup } from '../../../testing';


/** Path to the schematic collection that includes the migrations. */
// tslint:disable-next-line:mocha-no-side-effect-code
const migrationCollection = require.resolve('../../../migration.json');

describe('v9 Mosaic imports', () => {

    it('should re-map top-level Mosaic imports to the proper entry points when top-level ' +
        '@ptsecurity/mosaic package does not exist', async () => {

        const {
            runFixers,
            appTree,
            removeTempDir
        } = await createTestCaseSetup(
            'update-9.0.0',
            migrationCollection,
            [require.resolve('./secondary-entry-points-migration_input.fixture')]
        );

        if (runFixers) {
            await runFixers();
        }

        expect(appTree.readContent('projects/lib-testing/src/tests/secondary-entry-points-migration_input.ts'))
            .toBe(readFileContent(require.resolve('./secondary-entry-points-migration_expected_output.fixture')));

        removeTempDir();
    });
});

export function readFileContent(filePath: string): string {
    return readFileSync(filePath, 'utf8');
}
