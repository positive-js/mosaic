import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';

import { CONFIG } from '../../tools/release/config';


async function cleanupDocsPreviews() {

    const repoUrl = 'git@github.com:positive-js/mosaic-previews.git';
    const repoDir = `./tmp/docs-preview-cleanup`;

    // @ts-ignore
    const octokit = new Octokit({
        type: 'token',
        token: CONFIG.github.token
    });

    const q = 'repo:positive-js/mosaic is:pr is:closed';

    // tslint:disable-next-line
    const { data }: { data: { items: any[] } } = await octokit.search.issuesAndPullRequests({
        q,
        per_page: 100
    });

    const prsToRemove = data.items.reduce(
        // tslint:disable-next-line:no-reserved-keywords
        (prev: string[], curr: { number: number }) => {
            prev.push(`pr${curr.number}*`);

            return prev;
        },
        []
    );

    // tslint:disable-next-line:no-console
    console.log('PRs to remove: ', prsToRemove);

    execSync(`rm -rf "${repoDir}"`);
    execSync(`mkdir -p "${repoDir}"`);
    // tslint:disable-next-line
    await process.chdir(`${repoDir}`);

    execSync(`git init`);
    execSync(`git remote add origin ${repoUrl}`);
    execSync(`git fetch origin master --depth=1`);
    execSync(`git checkout origin/master -b master`);

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
