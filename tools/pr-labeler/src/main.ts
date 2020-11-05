/* tslint:disable:no-console */
import { getInput } from '@actions/core';
import { context, GitHub } from '@actions/github';

import { getPullRequestDetails } from './get-pull-request-details';


async function execute() {

    const repoToken = getInput('repo-token', { required: true });

    const prNumber = getPrNumber();

    if (!prNumber) {
        console.log('Could not get pull request number from context, exiting');

        return;
    }

    const client = new GitHub(repoToken);

    const pullRequestDetails = await getPullRequestDetails(client, prNumber);

    console.log(pullRequestDetails);
}

function getPrNumber(): number | undefined {
    const pullRequest = context.payload.pull_request;

    if (!pullRequest) {
        return undefined;
    }

    return pullRequest.number;
}

execute();
