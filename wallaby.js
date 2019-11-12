const wallabyWebpack = require('wallaby-webpack');

const path = require('path');

const compilerOptions = Object.assign(
    require('./tsconfig.webpack.json').compilerOptions
);

compilerOptions.module = 'CommonJs';


module.exports = function (wallaby) {

    const webpackPostprocessor = wallabyWebpack({
        entryPatterns: [
            'packages/wallabyTest.js',
            'packages/**/*spec.js'
        ],

        module: {
            rules: [
                {
                    test: /\.js$/,
                    enforce: 'post',
                    use: [{ loader: path.resolve('./tools/webpack/ng2-sass-loader.js') }]
                },

                { test: /\.css$/, loader: 'raw-loader' },
                { test: /\.html$/, loader: 'raw-loader' },
                { test: /\.js$/, loader: 'angular2-template-loader', exclude: /node_modules/ },
                { test: /\.scss$|\.sass$/, loaders: ['raw-loader', 'sass-loader'] }
            ]
        },

        resolve: {
            extensions: ['.js', '.ts'],
            modules: [
                path.join(wallaby.projectCacheDir, 'packages'),
                'node_modules'
            ],
            alias: {
                '@ptsecurity/cdk': path.join(wallaby.projectCacheDir, 'packages/cdk'),
                '@ptsecurity/mosaic-moment-adapter': path.join(wallaby.projectCacheDir, 'packages/mosaic-moment-adapter'),
                '@ptsecurity/mosaic': path.join(wallaby.projectCacheDir, 'packages/mosaic')
            }
        },
        node: {
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            dns: 'empty'
        }
    });

    return {
        files: [
            { pattern: 'packages/wallabyTest.ts', load: false },
            { pattern: 'packages/cdk/**/*.+(ts|css|scss|sass|html|json|svg)', load: false },
            { pattern: 'packages/mosaic/**/*.+(ts|css|scss|sass|html|json|svg)', load: false },
            { pattern: 'packages/mosaic-moment-adapter/**/*.+(ts|css|scss|sass|html|json|svg)', load: false },
            { pattern: 'packages/cdk/**/*.d.ts', ignore: true },
            { pattern: 'packages/mosaic/**/*.d.ts', ignore: true },
            { pattern: 'packages/mosaic-moment-adapter/**/*.d.ts', ignore: true },
            { pattern: 'packages/cdk/**/*spec.ts', ignore: true },
            { pattern: 'packages/mosaic/**/*spec.ts', ignore: true },
            { pattern: 'packages/mosaic-moment-adapter/**/*spec.ts', ignore: true }
        ],

        tests: [
            { pattern: 'packages/cdk/**/*.spec.ts', load: false },
            { pattern: 'packages/mosaic/**/*.spec.ts', load: false },
            { pattern: 'packages/mosaic-moment-adapter/**/*.spec.ts', load: false },
            { pattern: '!packages/cdk/schematics/**/*.spec.ts', load: false }
        ],

        testFramework: 'jasmine',

        compilers: {
            '**/*.ts': wallaby.compilers.typeScript(compilerOptions)
        },

        env: {
            kind: 'chrome',
            params: {
                runner: '--headless --disable-gpu'
            }
        },

        postprocessor: webpackPostprocessor,

        setup: function () {
            window.__moduleBundler.loadTests();
        },

        debug: true
    };
};
