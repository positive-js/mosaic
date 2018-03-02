/* tslint:disable:no-var-requires */
const gulpRunSequence = require('run-sequence');
/* tslint:enable:no-var-requires */


export function sequenceTask(...args: any[]) {
  return (done: any) => {
    gulpRunSequence(
      ...args,
      done
    );
  };
}
