#!/bin/bash

set -e

cd "$(dirname $0)/../../"

$(npm bin)/gulp mosaic-examples:build-release:clean
$(npm bin)/gulp docs

# Path to the project directory.
projectPath="$(pwd)"

# Path to the directory that contains the generated docs output.
docsDistPath="${projectPath}/dist/docs"

# Path to the cloned docs-content repository.
docsContentPath="${projectPath}/tmp/mosaic-docs-builds"

examplesPackagePath="${projectPath}/dist/releases/mosaic-examples"

# Git clone URL for the repository.
docsContentRepoUrl="https://github.com/positive-js/mosaic-docs-builds"

# Current version of Mosaic from the package.json file
buildVersion=$(node -pe "require('./package.json').version")

# Name of the branch that is currently being deployed.
branchName=${CIRCLE_BRANCH:-'master'}

# Additional information about the last commit for docs-content commits.
commitSha=$(git rev-parse --short HEAD)
commitAuthorName=$(git --no-pager show -s --format='%an' HEAD)
commitAuthorEmail=$(git --no-pager show -s --format='%ae' HEAD)
commitMessage=$(git log --oneline -n 1)
commitTag="${buildVersion}-${commitSha}"

buildVersionName="${buildVersion}-${commitSha}"
buildTagName="${branchName}-${commitSha}"
buildCommitMessage="${branchName} - ${commitMessage}"

echo "Starting deployment of the docs-build for ${buildVersionName} in ${branchName}"

# Remove the docs-content repository if the directory exists
rm -Rf ${docsContentPath}

# Clone the docs-content repository.
git clone ${docsContentRepoUrl} ${docsContentPath} --depth 1

echo "Successfully cloned docs-content repository."

# Go into the repository directory.
cd ${docsContentPath}

echo "Switched into the repository directory."

if [[ $(git ls-remote --heads origin ${branchName}) ]]; then
    git checkout ${branchName}
    echo "Switched to ${branchName} branch."
else
    echo "Branch ${branchName} does not exist on the docs-content repo yet. Creating ${branchName}.."
    git checkout -b ${branchName}
    echo "Branch created and checked out."
fi

# Remove everything inside of the docs-content repository.
rm -Rf ${docsContentPath}/*

echo "Removed everything from the docs-content repository. Copying all files into repository.."

# Create all folders that need to exist in the docs-content repository.
mkdir ${docsContentPath}/{api,examples,stackblitz,examples-package}

# Copy API and example files to the docs-content repository.
cp -R ${docsDistPath}/api/* ${docsContentPath}/api
cp -r ${docsDistPath}/examples/* ${docsContentPath}/examples
cp -r ${docsDistPath}/stackblitz/* ${docsContentPath}/stackblitz

# Copy the mosaic-examples package to the docs-content repository.
cp -r ${examplesPackagePath}/* ${docsContentPath}/examples-package

# Copy the license file to the docs-content repository.
cp ${projectPath}/LICENSE ${docsContentPath}

# Copy all immediate children of the markdown output the guides/ directory.
for guidePath in $(find ${docsDistPath}/markdown/ -maxdepth 1 -type f); do
    cp ${guidePath} ${docsContentPath}/guides
done

# All files that aren't immediate children of the markdown output are overview documents.
for overviewPath in $(find ${docsDistPath}/markdown/ -mindepth 2 -type f); do
    cp ${overviewPath} ${docsContentPath}/overview
done

echo "Successfully copied all content into the docs-content repository."

if [[ $(git ls-remote origin "refs/tags/${buildTagName}") ]]; then
    echo "Skipping publish of docs-content because tag is already published. Exiting.."
    exit 0
fi

# Setup the Git configuration
git config user.name "$commitAuthorName"
git config user.email "$commitAuthorEmail"

echo "Git configuration has been updated to match the last commit author. Publishing now.."

git add -A
git commit --allow-empty -m "${buildCommitMessage}"
git tag "${buildTagName}"
git push origin master --tags

echo "Published docs-content for ${buildVersionName} into ${branchName} successfully"
