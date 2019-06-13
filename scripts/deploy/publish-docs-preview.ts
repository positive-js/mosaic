/* tslint:disable:no-console */
import { execSync } from 'child_process';
import { join } from 'path';

import { GitClient } from '../../tools/release/git/git-client';


function getPrNumber(prNumber: string, circlePR: string): string {
    const PR_NUMBER = prNumber;

    if (!PR_NUMBER && circlePR) {
        return circlePR;
    }

    return PR_NUMBER;
}

function publishDocsPreview() {
    const SOURCE_DIR = './dist/releases/mosaic-docs';
    const REPO_URL = 'git@github.com:positive-js/mosaic-previews.git';
    const REPO_DIR = `./tmp/mosaic-docs-preview`;

    const PR_NUMBER = getPrNumber(
        process.env.CIRCLE_PR_NUMBER,
        process.env.CIRCLE_PULL_REQUEST_NUMBER
    );

    const SHORT_SHA = process.env.SHORT_GIT_HASH;
    const owner = process.env.CIRCLE_PROJECT_USERNAME;


    console.log('PR_NUMBER: ', PR_NUMBER);
    console.log('SHORT_SHA: ', SHORT_SHA);

    if (PR_NUMBER) {
        console.log(
            `Preparing and deploying docs preview for pr${PR_NUMBER}-${SHORT_SHA} to ${REPO_URL}`
        );
        prepareAndPublish(SOURCE_DIR, REPO_URL, REPO_DIR, false, 0);
    } else {
        console.log('No PR number found, skipping preview deployment');
    }
}

function prepareAndPublish(
    sourceDir: string,
    repoUrl: string,
    repoDir: string,
    clean = true,
    depth = 1
) {

    const gitClient = new GitClient(
        join(__dirname, '../../'),
        `https://github.com/positive-js/mosaic.git`
    );

    const COMMITTER_USER_NAME = gitClient.getCommitterUserName();
    const COMMITTER_USER_EMAIL = gitClient.getCommitterUserEmail();

    execSync(`rm -rf ${repoDir}`);
    execSync(`mkdir -p ${repoDir}`);

    process.chdir(`${repoDir}`);

    execSync('git init');
    execSync(`git remote add origin ${repoUrl}`);
    execSync(`git fetch origin master${depth ? ` --depth=${depth}` : ''}`);
    execSync('git checkout origin/master');
    execSync('git checkout -b master');

    process.chdir('../../');

    if (clean) {
        execSync('rm -rf', [`${repoDir}/*`]);
    }

    execSync(`git log --format="%h %s" -n 1 > ${repoDir}/commit_message`);
    execSync(`cp -R ${sourceDir}/* ${repoDir}/`);
    process.chdir(`${repoDir}`);

    execSync(`git config user.name "${COMMITTER_USER_NAME}"`);
    execSync(`git config user.email "${COMMITTER_USER_EMAIL}"`);
    execSync('git add --all');
    execSync(`git commit -F commit_message`);

    execSync('rm commit_message');

    execSync('git push origin master --force');
    process.chdir('../../');
}

publishDocsPreview();
