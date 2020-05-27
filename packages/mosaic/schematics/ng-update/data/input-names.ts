import { InputNameUpgradeData, TargetVersion, VersionChanges } from '@angular/cdk/schematics';


export const inputNames: VersionChanges<InputNameUpgradeData> = {
    [TargetVersion.V9]: [
        {
            pr: '',
            changes: [
                {
                    replace: 'min-time',
                    replaceWith: 'min',
                    whitelist:
                        {
                            attributes: ['mcTimepicker']
                        }
                },
                {
                    replace: 'max-time',
                    replaceWith: 'max',
                    whitelist:
                        {
                            attributes: ['mcTimepicker']
                        }
                },
                {
                    replace: 'time-format',
                    replaceWith: 'format',
                    whitelist:
                        {
                            attributes: ['mcTimepicker']
                        }
                }
            ]
        }
    ]
};
