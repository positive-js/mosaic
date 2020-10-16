import { InputNameUpgradeData, TargetVersion, VersionChanges } from '@angular/cdk/schematics';


export const inputNames: VersionChanges<InputNameUpgradeData> = {
    [TargetVersion.V9]: [
        {
            pr: '',
            changes: [
                {
                    replace: 'min-time',
                    replaceWith: 'min',
                    limitedTo:
                        {
                            attributes: ['mcTimepicker']
                        }
                },
                {
                    replace: 'max-time',
                    replaceWith: 'max',
                    limitedTo:
                        {
                            attributes: ['mcTimepicker']
                        }
                },
                {
                    replace: 'time-format',
                    replaceWith: 'format',
                    limitedTo:
                        {
                            attributes: ['mcTimepicker']
                        }
                }
            ]
        }
    ]
};
