import { context, GitHub } from '@actions/github';
import { PullsGetResponse } from '@octokit/rest';


export async function getPullRequestDetails(client: GitHub, prNumber: number): Promise<PullsGetResponse> {
    const pullRequestTarget = await client.pulls.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: prNumber
    });

    return pullRequestTarget.data;
}
