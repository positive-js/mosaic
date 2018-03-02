import * as util from '../util';


export async function publishToRepo() {

    const SOURCE_DIR = `./dist/packages/cdk`;
    const REPO_URL = `git@github.com:positive-js/cdk-builds.git`;
    const REPO_DIR = `./tmp/cdk`;
    const SHA = await util.git([`rev-parse HEAD`]);
    const SHORT_SHA = await util.git([`rev-parse --short HEAD`]);

    const COMMITTER_USER_NAME = await util.git([
        `--no-pager show -s --format='%cN' HEAD`,
    ]);
    const COMMITTER_USER_EMAIL = await util.git([
        `--no-pager show -s --format='%cE' HEAD`,
    ]);

    await util.cmd('rm -rf', [`${REPO_DIR}`]);
    await util.cmd('mkdir ', [`-p ${REPO_DIR}`]);
    await process.chdir(`${REPO_DIR}`);
    await util.git([`init`]);
    await util.git([`remote add origin ${REPO_URL}`]);
    await util.git(['fetch origin master --depth=1']);
    await util.git(['checkout origin/master']);
    await util.git(['checkout -b master']);
    await process.chdir('../../');
    await util.cmd('rm -rf', [`${REPO_DIR}/*`]);
    await util.git([`log --format="%h %s" -n 1 > ${REPO_DIR}/commit_message`]);
    await util.cmd('cp', [`-R ${SOURCE_DIR}/* ${REPO_DIR}/`]);
    await process.chdir(`${REPO_DIR}`);
    await util.git([`config user.name "${COMMITTER_USER_NAME}"`]);
    await util.git([`config user.email "${COMMITTER_USER_EMAIL}"`]);
    await util.git(['add --all']);
    await util.git([`commit -F commit_message`]);
    await util.cmd('rm', ['commit_message']);
    await util.git(['push origin master --force']);
    await process.chdir('../../');
}

publishToRepo();
