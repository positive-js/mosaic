import { task, parallel, series } from 'gulp';


task('ci:lint', parallel('lint'));

// Travis sometimes does not exit the process and times out. This is to prevent that.
task('ci:test', series('test:single-run', (done) => {
    done();
    process.exit(0);
}));

