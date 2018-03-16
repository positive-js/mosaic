const wallabyWebpack = require('wallaby-webpack');

const { TsConfigPathsPlugin } = require('awesome-typescript-loader');

const path = require('path');
const helpers = require('./tools/webpack/helpers');

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
                    test: /\.ts$/,
                    enforce: 'post',
                    use: [{ loader: path.resolve('./tools/webpack/ng2-sass-loader.js') }]
                },
                { test: /\.css$/, loader: 'raw-loader' },
                { test: /\.html$/, loader: 'raw-loader' },
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                configFileName: './tsconfig.webpack.json'
                            }

                        },
                        {
                            loader: 'angular2-template-loader'
                        }
                    ],
                },
                {
                    test: /\.scss$/,
                    use: [
                        'raw-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                                plugins: () => [
                                    require('autoprefixer')({
                                        browsers: ['last 2 versions']
                                    })
                                ]
                            }
                        },
                        'sass-loader?sourceMap'
                    ],
                    include: [ helpers.root('src') ]
                }
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
