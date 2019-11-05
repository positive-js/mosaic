import { execSync } from 'child_process';


async function cleanupDocsPreviews() {

    const repoUrl = 'git@github.com:positive-js/mosaic-previews.git';
    const repoDir = `./tmp/docs-preview-cleanup`;
    const token = process.env.GITHUB_API_KEY;
    const octokit = require('@octokit/rest')();

    octokit.authenticate({ type: 'token', token });

    const q = 'repo:positive-js/mosaic is:pr is:closed';

    const { data }: { data: { items: any[] } } = await octokit.search.issues({
        q,
        per_page: 100
    });

    execSync(`rm -rf "${repoDir}"`);
    execSync(`mkdir -p "${repoDir}"`);
    await process.chdir(`${repoDir}`);

    execSync(`git init`);
    execSync(`git remote add origin ${repoUrl}`);
    execSync(`git fetch origin master --depth=1`);
    execSync(`git checkout origin/master -b master`);

    const prsToRemove = data.items.reduce(
        // tslint:disable-next-line:no-reserved-keywords
        (prev: string[], curr: { number: number }) => {
            prev.push(`pr${curr.number}*`);

            return prev;
        },
        []
    );

    execSync(`rm -rf ${prsToRemove.join(' ')}`);
    execSync(`git config user.name "mosaicBigBoss"`);
    execSync(`git config user.email "positivejs@ptsecurity.com"`);
    execSync(`git add --all`);

    try {
        execSync(
            `git commit -m "chore: cleanup doc preview for closed pull requests"`
        );
        // tslint:disable-next-line:no-empty
    } catch (e) {}

    execSync(`git push origin master --force-with-lease`);
}

cleanupDocsPreviews();
