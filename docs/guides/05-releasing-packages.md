# Releasing packages

**Note: Releasing should only be done by the maintainers.**

Stable packages releasing only from `release branches`.

## Release Major version

1. Create 1.0.x branch from `master`;
2. Run

   `npm run release:stage:commit`

This command create and push a release commit and tag with changelog and bumped `package.json`;

CLI steps:
 - (**need validation**) choose bump version
 - (**need validation**) create ```release name```
   - you can use [angular-release-name-generator](https://www.npmjs.com/package/angular-release-name-generator)
 - (**need validation**) create changelog
 - create a commit with changelog
 - create a git tag
 - pushed changes to current branch
3. Just wait CircleCI job.

## Release Minor version

1. Create a new branch from existing release branch;

For example:

   current branch `3.0.x` and new branch `3.1.x`;
2. Repeat ```2``` and ```3``` from previous steps.

## Release Patch version

1. No need it creates a new branch. Use existing release branch.;

2. Repeat ```2``` and ```3``` from previous steps, bump as patch.
