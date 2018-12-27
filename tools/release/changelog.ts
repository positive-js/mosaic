// tslint:disable:no-console
import chalk from 'chalk';
import { createReadStream, createWriteStream, readFileSync } from 'fs';
import { prompt } from 'inquirer';
import { join } from 'path';
import { Readable } from 'stream';


// These imports lack type definitions.
// tslint:disable:no-var-requires
const conventionalChangelog = require('conventional-changelog');
const merge2 = require('merge2');

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
    const outputStream: Readable = conventionalChangelog(
        /* core options */ {preset: 'angular'},
        /* context options */ {title: releaseName},
        /* raw-commits options */ null,
        /* commit parser options */ null,
        /* writer options */ createDedupeWriterOptions(changelogPath));

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
    return (await prompt<{ releaseName: string }>({
        type: 'text',
        name: 'releaseName',
        message: 'What should be the name of the release?'
    })).releaseName;
}

/**
 * Creates changelog writer options which ensure that commits are not showing up multiple times.
 * Commits can show up multiple times if a changelog has been generated on a publish branch
 * and has been cherry-picked into "master". In that case, the changelog will already contain
 * commits from master which might be added to the changelog again. This is because usually
 * patch and minor releases are tagged from the publish branches and therefore
 * conventional-changelog tries to build the changelog from last major version to master's
 * HEAD when a new major version is being published from the "master" branch.
 */
function createDedupeWriterOptions(changelogPath: string) {
    const existingChangelogContent = readFileSync(changelogPath, 'utf8');

    return {
        // Specify a writer option that can be used to modify the content of a new changelog section.
        // See: conventional-changelog/tree/master/packages/conventional-changelog-writer
        finalizeContext: (context: any) => {
            context.commitGroups.forEach((group: any) => {
                group.commits = group.commits.filter((commit: any) => {
                    // NOTE: We cannot compare the SHA's because the commits will have a different SHA
                    // if they are being cherry-picked into a different branch.
                    if (existingChangelogContent.includes(commit.subject)) {
                        console.log(
                            chalk.yellow(`  ↺   Skipping duplicate: "${chalk.bold(commit.header)}"`)
                        );

                        return false;
                    }

                    return true;
                });
            });

            return context;
        }
    };
}

/** Entry-point for generating the changelog when called through the CLI. */
if (require.main === module) {
    promptAndGenerateChangelog(join(__dirname, '../../CHANGELOG.md')).then(() => {
        console.log(chalk.green('  ✓   Successfully updated the changelog.'));
    });
}


