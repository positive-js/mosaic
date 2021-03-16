import { green, red } from 'chalk';
import * as dotenv from 'dotenv';
import { join } from 'path';
import * as request from 'request';

import { extractReleaseNotes } from './extract-release-notes';
import { CHANGELOG_FILE_NAME } from './stage-release';


const HTTP_CODE_OK = 200;

export function notify(version) {
    if (!verifyNotificationPossibility()) {
        return;
    }

    const result = dotenv.config();

    const url = result.parsed.MATTERMOST_ENDPOINT_URL;
    const channel = result.parsed.MATTERMOST_CHANNEL;

    const headers = { 'Content-Type': 'application/json' };
    const body = {
        channel: `${channel}`,
        username: 'Wall-e',
        short: false,
        text: `#### [![Mosaic Logo](https://i.ibb.co/fQNPgv6/logo-png-200.png =32x32)osaic](https://github.com/positive-js/mosaic/tree/\${tag}) was published. \n ${prepareChangeLog(version)}`
    };

    request.post(
        { url, headers, body: JSON.stringify(body) },
        (error, response) => {
            if (error || response.statusCode !== HTTP_CODE_OK) {
                // tslint:disable-next-line:no-console
                console.error(red(`  ✘   Could not post notification in Mattermost.`));

                return;
            }

            console.info(green(`  ✓   Notification is posted in Mattermost.`));
        }
    );
}

export function verifyNotificationPossibility() {
    const result = dotenv.config();

    return !result.error && result.parsed.MATTERMOST_ENDPOINT_URL && result.parsed.MATTERMOST_CHANNEL;
}

function prepareChangeLog(version) {
    const changelogPath = join(join(__dirname, '../../'), CHANGELOG_FILE_NAME);
    const extractedReleaseNotes = extractReleaseNotes(changelogPath, version);

    return extractedReleaseNotes.releaseNotes.replace(/"/g, '');
}
