/* tslint:disable:naming-convention */
// tslint:disable:no-console
import chalk from 'chalk';
import { createReadStream, createWriteStream, readFileSync } from 'fs';
import { prompt } from 'inquirer';
import { join } from 'path';
import { Readable } from 'stream';


// These imports lack type definitions.
// tslint:disable:no-var-requires
const conventionalChangelog = require('conventional-changelog');
const changelogCompare = require('conventional-changelog-writer/lib/util');
const merge2 = require('merge2');

/**
 * Maps a commit note to a string that will be used to match notes of the
 * given type in commit messages.
 */
const enum CommitNote {
    Deprecation = 'DEPRECATED',
    BreakingChange = 'BREAKING CHANGE'
}

/** Interface that describes a package in the changelog. */
interface ChangelogPackage {
    commits: any[];
    breakingChanges: any[];
    deprecations: any[];
}

/** Hardcoded order of packages shown in the changelog. */
const orderedChangelogPackages = [
    'cdk',
    'mosaic',
    'mosaic-moment-adapter',
    'docs'
];

/** List of packages which are excluded in the changelog. */
const excludedChangelogPackages: string[] = [];


/** Prompts for a changelog release name and prepends the new changelog. */
export async function promptAndGenerateChangelog(changelogPath: string) {
    const releaseName = await promptChangelogReleaseName();

    await prependChangelogFromLatestTag(changelogPath, releaseName);
}

/**
 * Writes the changelog from the latest Semver tag to the current HEAD.
 * @param changelogPath Path to the changelog file.
 * @param releaseName Name of the release that should show up in the changelog.
 */
export async function prependChangelogFromLatestTag(changelogPath: string, releaseName: string) {
    const angularPresetWriterOptions = await require('conventional-changelog-angular/writer-opts');

    const outputStream: Readable = conventionalChangelog(
        /* core options */ {preset: 'angular'},
        /* context options */ {title: releaseName},
        /* raw-commits options */ null,
        /* commit parser options */ {
            // Expansion of the convention-changelog-angular preset to extract the package
            // name from the commit message.
            headerPattern: /^(\w*)(?:\((?:([^/]+)\/)?(.*)\))?: (.*)$/,
            headerCorrespondence: ['type', 'package', 'scope', 'subject']
        },
        /* writer options */ createChangelogWriterOptions(changelogPath, angularPresetWriterOptions));

    // Stream for reading the existing changelog. This is necessary because we want to
    // actually prepend the new changelog to the existing one.
    const previousChangelogStream = createReadStream(changelogPath);

    // tslint:disable:no-inferred-empty-object-type
    return new Promise((resolve, reject) => {
        // Sequentially merge the changelog output and the previous changelog stream, so that
        // the new changelog section comes before the existing versions. Afterwards, pipe into the
        // changelog file, so that the changes are reflected on file system.
        const mergedCompleteChangelog = merge2(outputStream, previousChangelogStream);

        // Wait for the previous changelog to be completely read because otherwise we would
        // read and write from the same source which causes the content to be thrown off.
        previousChangelogStream.on('end', () => {
            mergedCompleteChangelog.pipe(createWriteStream(changelogPath))
                .once('error', reject)
                .once('finish', resolve);
        });

    });
}

/** Prompts the terminal for a changelog release name. */
export async function promptChangelogReleaseName(): Promise<string> {
    return (await prompt<{releaseName: string}>({
        type: 'text',
        name: 'releaseName',
        message: 'What should be the name of the release?'
    })).releaseName;
}

function createChangelogWriterOptions(changelogPath: string, presetWriterOptions: any) {
    const existingChangelogContent = readFileSync(changelogPath, 'utf8');
    const commitSortFunction = changelogCompare.functionify(['type', 'scope', 'subject']);
    const allPackages = [...orderedChangelogPackages, ...excludedChangelogPackages];

    return {
        // Overwrite the changelog templates so that we can render the commits grouped
        // by package names. Templates are based on the original templates of the
        // angular preset: "conventional-changelog-angular/templates".
        mainTemplate: readFileSync(join(__dirname, 'changelog-root-template.hbs'), 'utf8'),
        commitPartial: readFileSync(join(__dirname, 'changelog-commit-template.hbs'), 'utf8'),

        // Overwrites the conventional-changelog-angular preset transform function. This is necessary
        // because the Angular preset changes every commit note to a breaking change note. Since we
        // have a custom note type for deprecations, we need to keep track of the original type.
        transform: (commit, context) => {
            commit.notes.forEach((n) => n.type = n.title);

            return presetWriterOptions.transform(commit, context);
        },

        // Specify a writer option that can be used to modify the content of a new changelog section.
        // See: conventional-changelog/tree/master/packages/conventional-changelog-writer
        finalizeContext: (context: any) => {
            const packageGroups: {[packageName: string]: ChangelogPackage} = {};

            context.commitGroups.forEach((group: any) => {
                group.commits.forEach((commit: any) => {
                    // Filter out duplicate commits. Note that we cannot compare the SHA because the commits
                    // will have a different SHA if they are being cherry-picked into a different branch.
                    if (existingChangelogContent.includes(commit.subject)) {
                        console.log(chalk.yellow(`  ↺   Skipping duplicate: "${chalk.bold(commit.header)}"`));

                        return false;
                    }

                    if (!commit.package && commit.scope) {
                        const matchingPackage = allPackages.find((pkgName) => pkgName === commit.scope);
                        if (matchingPackage) {
                            commit.scope = null;
                            commit.package = matchingPackage;
                        }
                    }

                    const packageName = commit.package || 'mosaic';

                    // tslint:disable-next-line:no-reserved-keywords
                    const type = getTypeOfCommitGroupDescription(group.title);

                    if (!packageGroups[packageName]) {
                        packageGroups[packageName] = {commits: [], breakingChanges: [], deprecations: []};
                    }
                    const packageGroup = packageGroups[packageName];

                    // Collect all notes of the commit. Either breaking change or deprecation notes.
                    commit.notes.forEach((n) => {
                        if (n.type === CommitNote.Deprecation) {
                            packageGroup.deprecations.push(n);
                        } else if (n.type === CommitNote.BreakingChange) {
                            packageGroup.breakingChanges.push(n);
                        } else {
                            // tslint:disable-next-line:no-magic-numbers
                            throw Error(`Found commit note that is not known: ${JSON.stringify(n, null, 4)}`);
                        }
                    });

                    packageGroup.commits.push({...commit, type});
                });
            });

            const sortedPackageGroupNames =
                Object.keys(packageGroups)
                    .filter((pkgName) => !excludedChangelogPackages.includes(pkgName))
                    .sort(preferredOrderComparator);

            context.packageGroups = sortedPackageGroupNames.map((pkgName) => {
                const packageGroup = packageGroups[pkgName];

                return {
                    // @ts-ignore
                    title: pkgName.capitalize(),
                    commits: packageGroup.commits.sort(commitSortFunction),
                    breakingChanges: packageGroup.breakingChanges,
                    deprecations: packageGroup.deprecations
                };
            });

            return context;
        }
    };
}

/**
 * Comparator function that sorts a given array of strings based on the
 * hardcoded changelog package order. Entries which are not hardcoded are
 * sorted in alphabetical order after the hardcoded entries.
 */
function preferredOrderComparator(a: string, b: string): number {
    const aIndex = orderedChangelogPackages.indexOf(a);
    const bIndex = orderedChangelogPackages.indexOf(b);

    // If a package name could not be found in the hardcoded order, it should be
    // sorted after the hardcoded entries in alphabetical order.
    if (aIndex === -1) {
        return bIndex === -1 ? a.localeCompare(b) : 1;
    } else if (bIndex === -1) {
        return -1;
    }

    return aIndex - bIndex;
}

/** Gets the type of a commit group description. */
function getTypeOfCommitGroupDescription(description: string): string {
    if (description === 'Features') {
        return 'feature';
    } else if (description === 'Bug Fixes') {
        return 'bug fix';
    } else if (description === 'Performance Improvements') {
        return 'performance';
    } else if (description === 'Reverts') {
        return 'revert';
    } else if (description === 'Documentation') {
        return 'docs';
    } else if (description === 'Code Refactoring') {
        return 'refactor';
    }

    return description.toLowerCase();
}

// @ts-ignore
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

/** Entry-point for generating the changelog when called through the CLI. */
if (require.main === module) {
    promptAndGenerateChangelog(join(__dirname, '../../CHANGELOG.md')).then(() => {
        console.log(chalk.green('  ✓   Successfully updated the changelog.'));
    });
}


