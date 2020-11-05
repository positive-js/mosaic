import { context, GitHub } from '@actions/github';
import { PullsGetResponse, PullsGetResponseBase, PullsListReviewsResponse } from '@octokit/rest';


export async function getPullRequestDetails(client: GitHub, prNumber: number): Promise<PullsGetResponse> {
    const pullRequestTarget = await client.pulls.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: prNumber
    });

    return pullRequestTarget.data;
}

export async function getPullRequestReviews(client: GitHub, prNumber: number): Promise<PullsListReviewsResponse> {
    const pullRequestTarget = await client.pulls.listReviews({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: prNumber
    });

    return pullRequestTarget.data;
}

export function hasMergeReadyLabel(pullRequest: PullsGetResponse): boolean {
    return pullRequest.labels.some((label) => label.name === 'pr: merge-ready');
}

export function isMasterTarget(target: PullsGetResponseBase): boolean {
    return target.label === 'positive-js:master';
}
