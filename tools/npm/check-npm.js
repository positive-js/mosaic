if (process.env.npm_execpath.indexOf('yarn') === -1) {
    console.error('Please use Yarn instead of NPM to install dependencies. ' +
                  'See: https://yarnpkg.com/lang/en/docs/install/');
    process.exit(1);
}
