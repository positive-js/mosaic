const wallabyWebpack = require('wallaby-webpack');

const { TsConfigPathsPlugin } = require('awesome-typescript-loader');

const path = require('path');

const compilerOptions = Object.assign(
    require('./tsconfig.webpack.json').compilerOptions,
);

compilerOptions.module = 'CommonJs';


module.exports = function (wallaby) {

    const webpackPostprocessor = wallabyWebpack({
        entryPatterns: [
            'src/wallabyTest.js',
            'src/**/*spec.js'
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
                {test: /\.js$/, loader: 'angular2-template-loader', exclude: /node_modules/},
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                configFileName: './tsconfig.wallaby.json'
                            }

                        }
                    ],
                },
                {test: /\.scss$|\.sass$/, loaders: ['raw-loader', 'sass-loader']},
            ]
        },

        resolve: {
            extensions: ['.js', '.ts'],
            modules: [
                path.join(wallaby.projectCacheDir, 'src'),
                'node_modules'
            ],
            plugins: [
                new TsConfigPathsPlugin({
                    configFileName: './tsconfig.webpack.json'
                })
            ]
        }
    });

    return {
        files: [
            { pattern: 'src/**/*.+(ts|css|scss|sass|html|json|svg)', load: false },
            { pattern: 'src/**/*.d.ts', ignore: true },
            { pattern: 'src/**/*spec.ts', ignore: true }
        ],

        tests: [
            { pattern: 'src/**/*spec.ts', load: false }
        ],

        testFramework: 'jasmine',

        compilers: {
            '**/*.ts': wallaby.compilers.typeScript(compilerOptions),
        },

        env: {
            kind: 'chrome'
        },

        postprocessor: webpackPostprocessor,

        setup: function () {
            window.__moduleBundler.loadTests();
        },

        debug: true
    };
};
