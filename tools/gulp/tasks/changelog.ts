import * as chalk from 'chalk';
import { task, src, dest } from 'gulp';
import { join } from 'path';

import { buildConfig } from '../../packages';


/* tslint:disable:no-var-requires */
/* tslint:disable:no-magic-numbers */
// This imports lack of type definitions.
const gulpChangelog = require('gulp-conventional-changelog');
const gitSemverTags = require('git-semver-tags');

/** Path to the changelog markdown file of the project. */
const changelogFile = join(buildConfig.projectDir, 'CHANGELOG.md');

/** Default changelog options that are passed to gulp-conventional-changelog. */
const changelogOptions = {
    preset: 'angular'
};

const writerOpts = {
    transform: (commit, context) => {

        const allowTypes = {
            feat: 'Features',
            fix: 'Bug Fixes',
            build: 'Build',
            perf: 'Performance Improvements',
            revert: 'Reverts',
            docs: 'Documentation',
            style: 'Styles',
            refactor: 'Code Refactoring',
            test: 'Tests',
            chore: 'Chores'
        };

        const modifiedType = allowTypes[commit.type];

        if (modifiedType === undefined) { return; }

        commit.type = modifiedType;

        commit.notes.forEach((note) => {
                note.title = 'BREAKING CHANGES';
            });

        if (commit.scope === '*') {
                commit.scope = '';
            }

        if (typeof commit.hash === 'string') {
                commit.hash = commit.hash.substring(0, 7);
            }

        if (typeof commit.subject === 'string') {
                commit.subject = commit.subject.substring(0, 120);

                if (context.host) {
                    // User URLs.
                    commit.subject = commit.subject.replace(
                        /\B@([a-z0-9](?:-?[a-z0-9]){0,38})/g,
                        '[@$1](' + context.host + '/$1)'
                    );
                }
            }

        commit.references = null;

        return commit;
    }
};

/** Task that generates a new changelog section from the latest tag to HEAD. */
task('changelog', async () => {
    // TODO: Show the instructions for the changelog generation.
    showChangelogInstructions();

    // Cancel the generation when the latest tag is the same as the version from the "package.json".
    if (await getLatestSemverTag() === buildConfig.projectVersion) {
        // tslint:disable-next-line
        console.error(chalk.default.red(`Warning: Changelog won\'t change because the "package.json"
                                         version is equal to the latest Git tag.\n`));

        return;
    }

    return src(changelogFile)
        .pipe(gulpChangelog(
            changelogOptions,
            {/*context*/},
            {/*git-raw-commits*/},
            {/*conventional-commits-parser / parserOpts*/},
            /*conventional-changelog-writer / writerOpts*/
            writerOpts
         ))
        .pipe(dest('./'));
});

/** Prints a message that gives instructions about generating a changelog section. */
function showChangelogInstructions() {
    console.info(`
    ${chalk.default.yellow('Changelog Instructions')}

    When running this command, the changelog from the latest tag to HEAD will be generated.
    The name of the new changelog section will be taken from the "package.json" version.
  `);
}

/** Returns the latest Semver Tag from the project Git repository */
function getLatestSemverTag(): Promise<string> {
    return new Promise((resolve, reject) => {
        return gitSemverTags((err: Error, tags: string[]) => err ? reject(err) : resolve(tags[0]));
    });
}
