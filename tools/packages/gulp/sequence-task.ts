/* tslint:disable-next-line:no-var-requires */
const gulpRunSequence = require('run-sequence');


export function sequenceTask(...args: any[]) {
    return (done: any) => {
        gulpRunSequence(
            ...args,
            done
        );
    };
}
