// tslint:disable:no-console
import { Octokit } from '@octokit/rest';
import { bold, cyan, green, italic, red } from 'chalk';
import { config as dotenvConfig } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

import { BaseReleaseTask } from './base-release-task';
import { CONFIG } from './config';
import { extractReleaseNotes } from './extract-release-notes';
import { GitClient } from './git/git-client';
import { notify } from './notify-release';
import { npmPublish } from './npm/npm-client';
import { checkReleasePackage } from './release-output/check-packages';
import { releasePackages } from './release-output/release-packages';
import { CHANGELOG_FILE_NAME } from './stage-release';
import { parseVersionName, Version } from './version-name/parse-version';


// tslint:disable-next-line:naming-convention
class PublishReleaseCITask extends BaseReleaseTask {

    /** Path to the project package JSON. */
    packageJsonPath: string;

    /** Serialized package.json of the specified project. */
    packageJson: any;

    /** Parsed current version of the project. */
    currentVersion: Version;

    /** Instance of a wrapper that can execute Git commands. */
    declare git: GitClient;

    /** Octokit API instance that can be used to make Github API calls. */
    githubApi: Octokit;

    /** Path to the release output of the project. */
    releaseOutputPath: string;

    constructor(
        public projectDir: string,
        public repositoryOwner: string,
        public repositoryName: string
    ) {
        super(new GitClient(projectDir, `https://github.com/${repositoryOwner}/${repositoryName}.git`));

        this.releaseOutputPath = join(projectDir, 'dist');
        this.packageJsonPath = join(projectDir, 'package.json');

        this.packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf-8'));
        this.currentVersion = parseVersionName(this.packageJson.version);

        if (!this.currentVersion) {

            console.error(red(`Cannot parse current version in ${italic('package.json')}. Please ` +
                `make sure "${this.packageJson.version}" is a valid Semver version.`));
            process.exit(1);
        }

        this.githubApi = new Octokit({
            type: 'token',
            token: CONFIG.github.token
        });
    }

    async run() {
        console.log();
        console.log(cyan('-----------------------------------------'));

        if (process.env.DEBUG) {
            console.log(red(' [DEBUG MODE] Mosaic CI release script'));
        } else {
            console.log(cyan('  Mosaic CI release script'));
        }
        console.log(cyan('-----------------------------------------'));
        console.log();

        this.checkReleaseOutput();

        const npmDistTag = 'latest';

        for (const packageName of releasePackages) {
            this.publishPackageToNpm(packageName, npmDistTag);
        }

        console.log();
        console.info(green(bold(`  ✓   Published all packages successfully`)));
        console.log();

        const newVersionName = this.currentVersion.format();

        const extractedReleaseNotes = extractReleaseNotes(
            join(this.projectDir, CHANGELOG_FILE_NAME), newVersionName);

        if (!extractedReleaseNotes) {
            console.error(red(`  ✘   Could not find release notes in the changelog.`));
            process.exit(1);
        }

        const { releaseNotes, releaseTitle } = extractedReleaseNotes;

        if (!process.env.DEBUG) {
            console.info(green(bold(`  ✓   Notification to Mattermost, version: ${newVersionName}`)));
            notify(newVersionName);
        }

        await this.githubApi.repos.createRelease({
            owner: this.repositoryOwner,
            repo: this.repositoryName,
            tag_name: newVersionName,
            body: releaseNotes,
            name: releaseTitle
        });

        console.info(green(`  ✓   Github release is posted.`));
    }

    /** Publishes the specified package within the given NPM dist tag. */
    private publishPackageToNpm(packageName: string, npmDistTag: string) {
        console.info(green(`  ⭮   Publishing "${packageName}"..`));

        const errorOutput = npmPublish(join(this.releaseOutputPath, packageName), npmDistTag);

        if (errorOutput) {
            console.error(red(`  ✘   An error occurred while publishing "${packageName}".`));
            console.error(red(`      Please check the terminal output and reach out to the team.`));
            console.error(red(`\n${errorOutput}`));
            process.exit(1);
        }

        console.info(green(`  ✓   Successfully published "${packageName}"`));
    }

    /** Checks the release output by running the release-output validations. */
    private checkReleaseOutput() {
        let hasFailed = false;

        releasePackages.forEach((packageName) => {
            if (!checkReleasePackage(this.releaseOutputPath, packageName)) {
                hasFailed = true;
            }
        });

        // In case any release validation did not pass, abort the publishing because
        // the issues need to be resolved before publishing.
        if (hasFailed) {
            console.error(red(`  ✘   Release output does not pass all release validations. Please fix ` +
                `all failures or reach out to the team.`));
            process.exit(1);
        }

        console.info(green(`  ✓   Release output passed validation checks.`));
    }
}

/** Entry-point for the create release script. */
if (require.main === module) {
    dotenvConfig();
    new PublishReleaseCITask(join(__dirname, '../../'), 'positive-js', 'mosaic').run();
}
