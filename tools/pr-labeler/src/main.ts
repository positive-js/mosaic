/* tslint:disable:no-console */
import { getInput } from '@actions/core';
import { context, GitHub } from '@actions/github';

import { getPullRequestDetails, getPullRequestReviews, hasMergeReadyLabel, isMasterTarget } from './helpers';


async function execute() {

    const repoToken = getInput('repo-token', { required: true });

    const prNumber = getPrNumber();

    if (!prNumber) {
        console.log('Could not get pull request number from context, exiting');

        return;
    }

    const client = new GitHub(repoToken);

    const pullRequestDetails = await getPullRequestDetails(client, prNumber);

    if (!hasMergeReadyLabel(pullRequestDetails)) {
        console.log(
            'Not ready to label just yet, add pr: merge-ready label to it to start the process.'
        );
        process.exit(1);

        return;
    }

    if (!isMasterTarget(pullRequestDetails.base)) {
        console.log('Target branch is not master, exiting');

        return;
    }

    // If it has a merge ready label, but no approvals remove
    // the merge ready label and all targets again.
    const reviews = await getPullRequestReviews(client, prNumber);
}

function getPrNumber(): number | undefined {
    const pullRequest = context.payload.pull_request;

    if (!pullRequest) {
        return undefined;
    }

    return pullRequest.number;
}

execute();
