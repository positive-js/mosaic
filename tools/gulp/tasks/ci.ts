import { task } from 'gulp';


task('ci:lint', ['lint']);

// Travis sometimes does not exit the process and times out. This is to prevent that.
task('ci:test', ['test:single-run'], () => process.exit(0));

