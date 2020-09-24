# Contributing to Mosaic

## Found a bug?

If you find a bug/issue in the source code or a mistake in the documentation,
you can help us by
[creating an issue](https://github.com/positive-js/mosaic/issues/new)
here on GitHub. 

Please provide an issue reproduction. Screenshots are also
helpful.

## Submitting a pull request

Before you submit your pull request (PR) consider the following guidelines:

- Fork Mosaic into your namespace by using the fork button on github.
- Make your changes in a new git branch: `git checkout -b my-fix-branch master`
- Create your bugfix/feature including appropriate tests.
- Test your changes with our supported browsers.
- Run unit tests and ensure that all tests pass.
- Push your branch to GitHub.
- Create a new pull request from your branch against the positive-js:master
  branch.

## Commit message guidelines

Each commit message consists of a `type`, `scope` and `subject` (message).  
The `type` and `subject` are mandatory, the `scope` is optional in some specific
cases. Format: `<type>(<scope>): <subject>`

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space,
  formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests
- **ci**: Changes that affect the CI
- **build**: Changes that affect the build system like npm scripts or
  angular-cli related changes
- **chore**: Other changes that don't modify src or test files

### Scope

The scope could be anything specifying the place of the commit change, in most
cases this would be the component name. For example select, button, etc.

### Message

**Subject**  
The commit message should describe the problem it solves or the feature it
introduces. Not the changes you have done. Further more the commit message has to
start with an uppercase letter and ends with a stop.

**Body**  
The body should include the motivation for the change and contrast this with
previous behavior.

**Footer**  
The footer should contain any information about Breaking Changes and is also the
place to reference GitHub issues that this commit closes.

Breaking Changes should start with the word BREAKING CHANGE: with a space or two
newlines. The rest of the commit message is then used for this.

### Examples

```
feat(button): added new type of button
```

```
fix(button): fixes an issue of theming.

Closes #33
```

```
refactor(button): removed deprecated method.

BREAKING CHANGE: The method has been removed.
Describe reasons.
```

##  Code reviews and PRs

### Open PR

A developer opens a PR in one of two ways:

1. The PR is already finished and can directly be reviewed.
2. The PR is still wip and is opened for others to be tracked. In this case the
   PR has to have the `pr: wip` and/or has to be opened as a
   [Draft](https://github.blog/2019-02-14-introducing-draft-pull-requests/).

### Draft/WIP

After the work on this draft/wip PR has been finished, remove the label
`pr: wip` and click the button `Ready for review` if it was opened as a Draft to
flag it for the codeowners/admins to review.

### Review

Now the review process kicks in. Depending on the scope of the PR one or more
[codeowners](https://github.com/positive-js/mosaic/blob/master/.github/CODEOWNERS)
must review this PR before the process can be continued (in most cases at least
2 codeowners will review and approve).

### Merge-ready

