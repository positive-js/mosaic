import { spawnSync, SpawnSyncReturns } from 'child_process';


/**
 * Class that can be used to execute Git commands within a given project directory.
 *
 * Relying on the working directory of the current process is not good because it's not
 * guaranteed that the working directory is always the target project directory.
 */
export class GitClient {

    constructor(public projectDir: string, public remoteGitUrl: string) {}

    /** Gets the currently checked out branch for the project directory. */
    getCurrentBranch() {
        return this.spawnGitProcess(['symbolic-ref', '--short', 'HEAD']).stdout.trim();
    }

    /** Gets the commit SHA for the specified remote repository branch. */
    getRemoteCommitSha(branchName: string): string {
        return this.spawnGitProcess(['ls-remote', this.remoteGitUrl, '-h',
            `refs/heads/${branchName}`])
            .stdout.split('\t')[0].trim();
    }

    /** Gets the latest commit SHA for the specified git reference. */
    getLocalCommitSha(refName: string) {
        return this.spawnGitProcess(['rev-parse', refName]).stdout.trim();
    }

    /** Gets whether the current Git repository has uncommitted changes. */
    hasUncommittedChanges(): boolean {
        return this.spawnGitProcess(['diff-index', '--quiet', 'HEAD']).status !== 0;
    }

    /** Checks out an existing branch with the specified name. */
    checkoutBranch(branchName: string): boolean {
        return this.spawnGitProcess(['checkout', branchName]).status === 0;
    }

    /** Creates a new branch which is based on the previous active branch. */
    checkoutNewBranch(branchName: string): boolean {
        return this.spawnGitProcess(['checkout', '-b', branchName]).status === 0;
    }

    /** Stages all changes by running `git add -A`. */
    stageAllChanges(): boolean {
        return this.spawnGitProcess(['add', '-A']).status === 0;
    }

    /** Gets the title of a specified commit reference. */
    getCommitTitle(commitRef: string): string {
        return this.spawnGitProcess(['log', '-n1', '--format="%s"', commitRef]).stdout.trim();
    }

    /** Creates a new commit within the current branch with the given commit message. */
    createNewCommit(message: string): boolean {
        return this.spawnGitProcess(['commit', '-m', message]).status === 0;
    }

    /** Creates a tag for the specified commit reference. */
    createTag(commitRef: string, tagName: string, message: string): boolean {
        return this.spawnGitProcess(['tag', tagName, '-m', message]).status === 0;
    }

    /** Checks whether the specified tag exists locally. */
    hasLocalTag(tagName: string) {
        return this.spawnGitProcess(['rev-parse', `refs/tags/${tagName}`]).status === 0;
    }

    /** Gets the Git SHA of the specified local tag. */
    getShaOfLocalTag(tagName: string) {
        return this.spawnGitProcess(['rev-parse', `refs/tags/${tagName}`]).stdout.trim();
    }

    /** Gets the Git SHA of the specified remote tag. */
    getShaOfRemoteTag(tagName: string): string {
        return this.spawnGitProcess(['ls-remote', this.remoteGitUrl, '-t', `refs/tags/${tagName}`])
            .stdout.split('\t')[0].trim();
    }

    /** Pushes the specified tag to the remote git repository. */
    pushTagToRemote(tagName: string): boolean {
        return this.spawnGitProcess(['push', this.remoteGitUrl, `refs/tags/${tagName}`]).status === 0;
    }

    /**
     * Spawns a child process running Git. The "stderr" output is inherited and will be printed
     * in case of errors. This makes it easier to debug failed commands.
     */
    private spawnGitProcess(args: string[]): SpawnSyncReturns<string> {
        return spawnSync('git', args, {
            cwd: this.projectDir,
            stdio: ['pipe', 'pipe', 'inherit'],
            encoding: 'utf8',
        });
    }
}

