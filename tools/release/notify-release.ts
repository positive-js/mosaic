import * as request from 'request';
import * as dotenv from 'dotenv';
import { extractReleaseNotes } from './extract-release-notes';
import { join } from "path";
import { CHANGELOG_FILE_NAME } from './stage-release';
import chalk from 'chalk';


export function notify(releasePackages, tag, version) {
    const result = dotenv.config();

    if (result.error) {
        throw result.error;
    }


    const url = result.parsed.MATTERMOST_ENDPOINT_URL;
    const channel = result.parsed.MATTERMOST_CHANNEL;

    if (!url || !channel) {
        return;
    }

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    const body = `payload={
        "channel": "${channel}",
        "username": "Wall-e",
        "short": false,
        "text": " #### [![Mosaic Logo](https://i.ibb.co/fQNPgv6/logo-png-200.png =32x32)osaic](https://github.com/positive-js/mosaic/tree/${tag}) was published.
${formatPackagesLinks(releasePackages, tag)}
${prepareChangeLog(version)}"
}`;

    request.post({
        url,
        headers,
        body
    }, (error, response) => {
        if (error || response.statusCode !== 200) {
            console.error(chalk.red(`  ✘   Could not post notification in Mattermost.`));
            return;
        }

        console.info(chalk.green(`  ✓   Notification is posted in Mattermost.`));
    });
}


function formatPackagesLinks(releasePackages = [], tag) {
    const npmLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/d/db/Npm-logo.svg';

    return releasePackages.reduce((value, releaseName, i) => {
        const lastSymbol = i !== releasePackages.length - 1 ? '\n': '';
        return `${value} #### [![NPM](${npmLogoUrl} =48x) ${releaseName}](https://www.npmjs.com/package/@ptsecurity/${releaseName}/v/${tag})${lastSymbol} `
    }, '');
}

function prepareChangeLog(version) {
    const changelogPath = join(join(__dirname, '../../'), CHANGELOG_FILE_NAME);
    const extractedReleaseNotes = extractReleaseNotes(changelogPath, version);

    return extractedReleaseNotes.releaseNotes.replace(/"/g, '')
}
