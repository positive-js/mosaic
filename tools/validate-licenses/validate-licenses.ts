/* tslint:disable:no-var-requires */
const path = require('path');
const spdxSatisfies = require('spdx-satisfies');
const checker = require('license-checker');


/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:no-console */
const licensesWhitelist = [
    // Regular valid open source licenses.
    'MIT',
    'ISC',
    'Apache-2.0',

    'BSD-2-Clause',
    'BSD-3-Clause',
    'BSD-4-Clause',

    // All CC-BY licenses have a full copyright grant and attribution section.
    'CC-BY-3.0',
    'CC-BY-4.0',

    'GPL-3.0',

    // Have a full copyright grant. Validated by opensource team.
    'Unlicense',
    '0BSD',
    'CC0-1.0',

    // Have a full copyright grant. Validated by opensource team.
    'Unlicense',
    'Zlib',
    'WTFPL',

    // Combinations.
    '(AFL-2.1 OR BSD-2-Clause)',
    '(MIT OR CC-BY-3.0)',
    '(MIT OR Apache-2.0)',
    '(MIT OR BSD-3-Clause)'
];

// Licenses not included in SPDX but accepted will be converted to MIT.
const licenseReplacements: { [key: string]: string } = {
    // Just a longer string that our script catches. SPDX official name is the shorter one.
    'Apache License, Version 2.0': 'Apache-2.0',
    'Apache2': 'Apache-2.0',
    'Apache 2.0': 'Apache-2.0',
    'AFLv2.1': 'AFL-2.1',
    // BSD is BSD-2-clause by default.
    'BSD': 'BSD-2-Clause'
};

const ignoredPackages = [
    'spdx-license-ids@2.0.1',
    'bitsyntax@0.0.4',
    'pako@1.0.6', // (MIT AND Zlib)
    'jsonify@0.0.0',
    // Custom
    'cycle@1.0.3',
    'buffers@0.1.1',
    'deep-freeze@0.0.1',

    // Apache
    'didyoumean@1.2.1'
];


// Check if a license is accepted by an array of accepted licenses
function passesSpdx(licenses: string[], accepted: string[]) {
    try {
        return spdxSatisfies(licenses.join(' AND '), accepted.join(' OR '));
    } catch (_) {
        return false;
    }
}

const enum ReturnCode {
    Success     = 0,
    Error       = 1,
    INVALID_LIC = 2
}

export function validateLicense(): Promise<number> {

    return new Promise<number>((resolve) => {
        checker.init({start: path.join(__dirname, '../../'), excludePrivatePackages: true}, (err: Error, json: any) => {

            if (err) {
                console.error(`Something happened:\n${err.message}`);
                resolve(ReturnCode.Error);
                process.exit(ReturnCode.Error);
            } else {
                console.log(`Testing ${Object.keys(json).length} packages.\n`);

                const badLicensePackages = Object.keys(json)
                    .map((key) => ({
                        id: key,
                        licenses: ([] as string[])
                        /* tslint:disable:no-non-null-assertion */
                            .concat((json[key]).licenses as string[])
                            // `*` is used when the license is guessed.
                            .map((x) => x.replace(/\*$/, ''))
                            .map((x) => x in licenseReplacements ? licenseReplacements[x] : x)
                    }))
                    .filter((pkg) => !passesSpdx(pkg.licenses, licensesWhitelist))
                    .filter((pkg) => !ignoredPackages.find((ignored) => ignored === pkg.id));

                // Report packages with bad licenses
                if (badLicensePackages.length > 0) {
                    console.error('Invalid package licences found: \n');

                    badLicensePackages.forEach((pkg) => {
                        console.error(`▪ ${pkg.id}: ${JSON.stringify(pkg.licenses)}`);
                    });

                    console.error(`\n${badLicensePackages.length} total packages with invalid licenses.`);
                    resolve(ReturnCode.INVALID_LIC);
                    process.exit(ReturnCode.INVALID_LIC);
                } else {
                    console.log('All package licenses are valid.');
                    resolve(ReturnCode.Success);
                    process.exit(ReturnCode.Success);
                }
            }
        });
    });

}

if (require.main === module) {
    validateLicense();
}
