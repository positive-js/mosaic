import { ListChoiceOptions, prompt, Separator, SeparatorOptions } from 'inquirer';

import { createNewVersion, ReleaseType } from '../version-name/create-version';
import { parseVersionName, Version } from '../version-name/parse-version';

import { determineAllowedPrereleaseLabels } from './prerelease-labels';


/** Answers that will be prompted for. */
interface IVersionPromptAnswers {
    proposedVersion: string;
    isPrerelease: boolean;
    prereleaseLabel: string;
}

/**
 * Prompts the current user-input interface for a new version name. The new version will be
 * validated to be a proper increment of the specified current version.
 */
export async function promptForNewVersion(currentVersion: Version): Promise<Version> {
    const allowedPrereleaseChoices = determineAllowedPrereleaseLabels(currentVersion);
    const versionChoices: (ListChoiceOptions | SeparatorOptions)[] = [];
    const currentVersionName = currentVersion.format();

    if (currentVersion.prereleaseLabel) {
        versionChoices.push(
            createVersionChoice(currentVersion, 'stable-release', 'Stable release'),
            createVersionChoice(currentVersion, 'bump-prerelease', 'Bump pre-release number'));

        // Only add the option to change the prerelease label if the current version can be
        // changed to a new label. e.g. a version that is already marked as release candidate
        // shouldn't be changed to a beta or alpha version.
        if (allowedPrereleaseChoices) {
            versionChoices.push({
                value: 'new-prerelease-label',
                name: `New pre-release (${allowedPrereleaseChoices.map((c) => c.value).join(', ')})`
            });
        }
    } else {
        versionChoices.push(
            createVersionChoice(currentVersion, 'major', 'Major release'),
            createVersionChoice(currentVersion, 'minor', 'Minor release'),
            createVersionChoice(currentVersion, 'patch', 'Patch release'));
    }

    versionChoices.push(
        new Separator(),
        { name: `Use current version (${currentVersionName})`, value: currentVersionName }
    );

    const answers = await prompt<IVersionPromptAnswers>([{
        type: 'list',
        name: 'proposedVersion',
        message: `What's the type of the new release?`,
        choices: versionChoices
    }]);

    const newVersion = answers.proposedVersion === 'new-prerelease-label' ?
        currentVersion.clone() :
        parseVersionName(answers.proposedVersion)!;

    if (answers.prereleaseLabel) {
        newVersion.prereleaseLabel = answers.prereleaseLabel;
        newVersion.prereleaseNumber = 0;
    }

    return newVersion;
}

/** Creates a new choice for selecting a version inside of an Inquirer list prompt. */
function createVersionChoice(currentVersion: Version, releaseType: ReleaseType, message: string) {
    const versionName = createNewVersion(currentVersion, releaseType).format();

    return {
        value: versionName,
        name: `${message} (${versionName})`
    };
}
