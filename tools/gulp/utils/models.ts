
// Options that can be passed to execTask or execNodeTask.
export interface IExecTaskOptions {

    // Whether STDOUT and STDERR messages should be printed.
    silent?: boolean;

    // Whether STDOUT messages should be printed.
    silentStdout?: boolean;

    // If an error happens, this will replace the standard error.
    errMessage?: string;

    // Environment variables being passed to the child process.
    env?: any;

    // Whether the task should fail if the process writes to STDERR.
    failOnStderr?: boolean;
}
