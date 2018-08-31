#!/bin/bash

set -e

# Go to the project root directory
cd $(dirname ${0})/../..

PACKAGES=(cdk mosaic)
REPOSITORIES=(cdk-builds mosaic-builds)

# Command line arguments.
COMMAND_ARGS=${*}

# Function to publish artifacts of a package to Github.
#   @param ${1} Name of the package
#   @param ${2} Repository name of the package.
publishPackage() {
    packageName=${1}
    packageRepo=${2}

    buildDir="$(pwd)/dist/releases/${packageName}"
    buildVersion=$(node -pe "require('./package.json').version")
    branchName=$(git branch | sed -n '/\* /s///p' | awk -F'/' '{print $2}')

    if [[ -z ${branchName} ]]; then
        branchName='master'
    fi

    commitSha=$(git rev-parse --short HEAD)
    commitAuthorName=$(git --no-pager show -s --format='%an' HEAD)
    commitAuthorEmail=$(git --no-pager show -s --format='%ae' HEAD)
    commitMessage=$(git log --oneline -n 1)

    buildVersionName="${buildVersion}-${commitSha}"
    buildTagName="${branchName}-${commitSha}"
    buildCommitMessage="${branchName} - ${commitMessage}"

    repoUrl="https://github.com/positive-js/${packageRepo}.git"
    repoDir="tmp/${packageRepo}"

    echo "Starting publish process of ${packageName} for ${buildVersionName} into ${branchName}.."

    # Prepare cloning the builds repository
    rm -rf ${repoDir}
    mkdir -p ${repoDir}

    echo "Starting cloning process of ${repoUrl} into ${repoDir}.."

    if [[ $(git ls-remote --heads ${repoUrl} ${branchName}) ]]; then
        echo "Branch ${branchName} already exists. Cloning that branch."
        git clone ${repoUrl} ${repoDir} --depth 1 --branch ${branchName}

        cd ${repoDir}
        echo "Cloned repository and switched into the repository directory (${repoDir})."
    else
        echo "Branch ${branchName} does not exist on ${packageRepo} yet."
        echo "Cloning default branch and creating branch '${branchName}' on top of it."

        git clone ${repoUrl} ${repoDir} --depth 1
        cd ${repoDir}

        echo "Cloned repository and switched into directory. Creating new branch now.."

        git checkout -b ${branchName}
    fi

    # Copy the build files to the repository
    rm -rf ./*
    cp -r ${buildDir}/* ./

    echo "Removed everything from ${packageRepo}#${branchName} and added the new build output."

    if [[ $(git ls-remote origin "refs/tags/${buildTagName}") ]]; then
        echo "Skipping publish because tag is already published"
        exit 0
    fi

    # Replace the version in every file recursively with a more specific version that also includes
    # the SHA of the current build job. Normally this "sed" call would just replace the version
    # placeholder, but the version placeholders have been replaced by the release task already.
    sed -i "s/${buildVersion}/${buildVersionName}/g" $(find . -type f -not -path '*\/.*' ! -iname '*.css' ! -iname '*.js')

    echo "Updated the build version in every file to include the SHA of the latest commit."

    # Prepare Git for pushing the artifacts to the repository.
    git config user.name "${commitAuthorName}"
    git config user.email "${commitAuthorEmail}"

    echo "Publish by user: ${commitAuthorName}"
    echo "Git configuration has been updated to match the last commit author. Publishing now.."

    echo "Commit message: ${buildCommitMessage}"
    echo "Build Tag: ${buildTagName}"

    git add -A
    git commit --allow-empty -m "${buildCommitMessage}"
    git tag "${buildTagName}"
    git push origin ${branchName} --tags

    echo "Published package artifacts for ${packageName}#${buildVersionName} into ${branchName}"
}

for ((i = 0; i < ${#PACKAGES[@]}; i++)); do
    packageName=${PACKAGES[${i}]}
    packageRepo=${REPOSITORIES[${i}]}

    # Publish artifacts of the current package. Run publishing in a sub-shell to avoid working
    # directory changes.
    (publishPackage ${packageName} ${packageRepo})
done
