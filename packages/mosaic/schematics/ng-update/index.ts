import { Rule, SchematicContext } from '@angular-devkit/schematics';
import { createUpgradeRule, TargetVersion } from '@angular/cdk/schematics';
import { green, yellow } from 'chalk';

import { SecondaryEntryPointsRule } from './update-9.0.0/secondary-entry-points-rule';
import { mosaicUpgradeData } from './upgrade-data';


const mosaicMigrationRules = [
    SecondaryEntryPointsRule
];

export function updateToV9(): Rule {
    return createUpgradeRule(
        TargetVersion.V9, mosaicMigrationRules, mosaicUpgradeData, onMigrationComplete);
}


function onMigrationComplete(context: SchematicContext, targetVersion: TargetVersion, hasFailures: boolean): void {

    context.logger.info(green(`Updated Mosaic to ${targetVersion}`));

    if (hasFailures) {
        context.logger.warn(yellow(
            ' Some issues were detected but could not be fixed automatically. Please check the ' +
            'output above and fix these issues manually.'));
    }
}
