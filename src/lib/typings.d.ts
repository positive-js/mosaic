declare var ENV: string;
declare var HMR: boolean;

interface GlobalEnvironment {
    ENV: string;
    HMR: boolean;
}

interface ErrorStackTraceLimit {
    stackTraceLimit: number;
}

// Extend typings
interface ErrorConstructor extends ErrorStackTraceLimit {}
interface Global extends GlobalEnvironment {
}
