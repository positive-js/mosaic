import { Rule, SchematicContext } from '@angular-devkit/schematics';
import { createMigrationSchematicRule, NullableDevkitMigration, TargetVersion } from '@angular/cdk/schematics';
import { green, yellow } from 'chalk';

import { SecondaryEntryPointsMigration } from './update-9.0.0/secondary-entry-points-migration';
import { mosaicUpgradeData } from './upgrade-data';


const mosaicMigrations: NullableDevkitMigration[]  = [
    // @ts-ignore
    SecondaryEntryPointsMigration
];

export function updateToV9(): Rule {
    return createMigrationSchematicRule(
        TargetVersion.V9, mosaicMigrations, mosaicUpgradeData, onMigrationComplete);
}

function onMigrationComplete(context: SchematicContext, targetVersion: TargetVersion, hasFailures: boolean): void {

    context.logger.info(green(`Updated Mosaic to ${targetVersion}`));

    if (hasFailures) {
        context.logger.warn(yellow(
            ' Some issues were detected but could not be fixed automatically. Please check the ' +
            'output above and fix these issues manually.'));
    }
}
