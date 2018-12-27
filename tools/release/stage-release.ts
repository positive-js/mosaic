// tslint:disable:no-console

import * as OctokitApi from '@octokit/rest';
import chalk from 'chalk';

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { prompt } from 'inquirer';
import { join } from 'path';

import { promptAndGenerateChangelog } from './changelog';
import { GitClient } from './git/git-client';
import { getGithubBranchCommitsUrl } from './git/github-urls';
import { promptForNewVersion } from './prompt/new-version-prompt';
import { parseVersionName, Version } from './version-name/parse-version';
import { getExpectedPublishBranch } from './version-name/publish-branch';


/** Default filename for the changelog. */
const CHANGELOG_FILE_NAME = 'CHANGELOG.md';

/**
 * Class that can be instantiated in order to stage a new release. The tasks requires user
 * interaction/input through command line prompts.
 *
 * Staging a release involves the following the steps:
 *
 *  1) Prompt for release type (with version suggestion)
 *  2) Prompt for version name if no suggestions has been selected
 *  3) Assert that there are no local changes which are uncommitted.
 *  4) Assert that the proper publish branch is checked out. (e.g. 6.4.x for patches)
 *     If a different branch is used, try switching to the publish branch automatically
 *  5) Assert that the Github status checks pass for the publish branch.
 *  6) Assert that the local branch is up to date with the remote branch.
 *  7) Creates a new branch for the release staging (release-stage/{VERSION})
 *  8) Switches to the staging branch and updates the package.json
 *  9) Prompt for release name and generate changelog
 *  10) Wait for the user to continue (users can customize generated changelog)
 *  11) Create a commit that includes all changes in the staging branch.
 */
class StageReleaseTask {

    /** Path to the project package JSON. */
    packageJsonPath: string;

    /** Serialized package.json of the specified project. */
    packageJson: any;

    /** Parsed current version of the project. */
    currentVersion: Version;

    /** Instance of a wrapper that can execute Git commands. */
    git: GitClient;

    /** Octokit API instance that can be used to make Github API calls. */
    githubApi: OctokitApi;

    constructor(public projectDir: string,
                public repositoryOwner: string,
                public repositoryName: string) {
        this.packageJsonPath = join(projectDir, 'package.json');

        console.log(this.projectDir);

        if (!existsSync(this.packageJsonPath)) {
            console.error(chalk.red(`The specified directory is not referring to a project directory. ` +
                `There must be a ${chalk.italic('package.json')} file in the project directory.`));
            process.exit(1);
        }

        this.packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf-8'));
        this.currentVersion = parseVersionName(this.packageJson.version);

        if (!this.currentVersion) {
            console.error(chalk.red(`Cannot parse current version in ${chalk.italic('package.json')}. Please ` +
                `make sure "${this.packageJson.version}" is a valid Semver version.`));
            process.exit(1);
        }

        this.githubApi = new OctokitApi();
        this.git = new GitClient(projectDir,
            `https://github.com/${repositoryOwner}/${repositoryName}.git`);
    }

    async run() {
        console.log();
        console.log(chalk.cyan('-----------------------------------------'));
        console.log(chalk.cyan('  Mosaic stage release script'));
        console.log(chalk.cyan('-----------------------------------------'));
        console.log();

        const newVersion = await promptForNewVersion(this.currentVersion);
        const expectedPublishBranch = getExpectedPublishBranch(newVersion);

        // After the prompt for the new version, we print a new line because we want the
        // new log messages to be more in the foreground.
        console.log();

        this.verifyNoUncommittedChanges();
        this.switchToPublishBranch(expectedPublishBranch);

        this.verifyLocalCommitsMatchUpstream(expectedPublishBranch);
        await this.verifyPassingGithubStatus(expectedPublishBranch);

        const newVersionName = newVersion.format();
        const stagingBranch = `release-stage/${newVersionName}`;

        if (!this.git.checkoutNewBranch(stagingBranch)) {
            console.error(chalk.red(`Could not create release staging branch: ${stagingBranch}. Aborting...`));
            process.exit(1);
        }

        this.updatePackageJsonVersion(newVersionName);

        console.log(chalk.green(`  ✓   Updated the version to "${chalk.bold(newVersionName)}" inside of the ` +
            `${chalk.italic('package.json')}`));
        console.log();

        await promptAndGenerateChangelog(join(this.projectDir, CHANGELOG_FILE_NAME));

        console.log();
        console.log(chalk.green(`  ✓   Updated the changelog in ` +
            `"${chalk.bold(CHANGELOG_FILE_NAME)}"`));
        console.log(chalk.yellow(`  ⚠   Please review CHANGELOG.md and ensure that the log contains only ` +
            `changes that apply to the public library release. When done, proceed to the prompt below.`));
        console.log();

        const {shouldContinue} = await prompt<{ shouldContinue: boolean }>({
            type: 'confirm',
            name: 'shouldContinue',
            message: 'Do you want to proceed and commit the changes?'
        });

        if (!shouldContinue) {
            console.log();
            console.log(chalk.yellow('Aborting release staging...'));
            process.exit(1);
        }

        this.git.stageAllChanges();
        this.git.createNewCommit(`chore: bump version to ${newVersionName} w/ changelog`);

        console.info();
        console.info(chalk.green(`  ✓   Created the staging commit for: "${newVersionName}".`));
        console.info(chalk.green(`  ✓   Please push the changes and submit a PR on GitHub.`));
        console.info();

        // TODO automatic push and PR open URL shortcut.
    }

    /**
     * Checks if the user is on the expected publish branch. If the user is on a different branch,
     * this function automatically tries to checkout the publish branch.
     */
    private switchToPublishBranch(expectedPublishBranch: string): boolean {
        const currentBranchName = this.git.getCurrentBranch();

        // If current branch already matches the expected publish branch, just continue
        // by exiting this function.
        if (expectedPublishBranch === currentBranchName) {
            return;
        }

        if (!this.git.checkoutBranch(expectedPublishBranch)) {
            console.error(chalk.red(`  ✘   Could not switch to the "${chalk.italic(expectedPublishBranch)}" ` +
                `branch.`));
            console.error(chalk.red(`      Please ensure that the branch exists or manually switch to the ` +
                `branch.`));
            process.exit(1);
        }

        console.log(chalk.green(`  ✓   Switched to the "${chalk.italic(expectedPublishBranch)}" branch.`));
    }

    /** Verifies that the local branch is up to date with the given publish branch. */
    private verifyLocalCommitsMatchUpstream(publishBranch: string) {
        const upstreamCommitSha = this.git.getRemoteCommitSha(publishBranch);
        const localCommitSha = this.git.getLocalCommitSha('HEAD');

        // Check if the current branch is in sync with the remote branch.
        if (upstreamCommitSha !== localCommitSha) {
            console.error(chalk.red(`  ✘ Cannot stage release. The current branch is not in sync with the ` +
                `remote branch. Please make sure your local branch "${chalk.italic(publishBranch)}" is up ` +
                `to date.`));

            process.exit(1);
        }
    }

    /** Verifies that there are no uncommitted changes in the project. */
    private verifyNoUncommittedChanges() {
        if (this.git.hasUncommittedChanges()) {
            console.error(chalk.red(`  ✘   Cannot stage release. There are changes which are not committed ` +
                `and should be discarded.`));
            process.exit(1);
        }
    }

    /** Updates the version of the project package.json and writes the changes to disk. */
    private updatePackageJsonVersion(newVersionName: string) {
        const newPackageJson = {...this.packageJson, version: newVersionName};
        writeFileSync(this.packageJsonPath, JSON.stringify(newPackageJson, null, 2) + '\n');
    }

    /** Verifies that the latest commit of the current branch is passing all Github statuses. */
    private async verifyPassingGithubStatus(expectedPublishBranch: string) {
        const commitRef = this.git.getLocalCommitSha('HEAD');
        const githubCommitsUrl = getGithubBranchCommitsUrl(this.repositoryOwner, this.repositoryName,
            expectedPublishBranch);
        const {state} = (await this.githubApi.repos.getCombinedStatusForRef({
            owner: this.repositoryOwner,
            repo: this.repositoryName,
            ref: commitRef
        })).data;

        if (state === 'failure') {
            console.error(chalk.red(`  ✘   Cannot stage release. Commit "${commitRef}" does not pass all ` +
                `github status checks. Please make sure this commit passes all checks before re-running.`));
            console.error(chalk.red(`      Please have a look at: ${githubCommitsUrl}`));
            process.exit(1);
        } else if (state === 'pending') {
            console.error(chalk.red(`  ✘   Cannot stage release yet. Commit "${commitRef}" still has ` +
                `pending github statuses that need to succeed before staging a release.`));
            console.error(chalk.red(`      Please have a look at: ${githubCommitsUrl}`));
            process.exit(0);
        }

        console.info(chalk.green(`  ✓   Upstream commit is passing all github status checks.`));
    }
}

/** Entry-point for the release staging script. */
if (require.main === module) {
    new StageReleaseTask(join(__dirname, '../../'), 'positive-js', 'mosaic').run();
}

