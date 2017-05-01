const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const helpers = require('../helpers');

const ENV = process.env.ENV = process.env.NODE_ENV = 'test';

module.exports = {

    devtool: 'inline-source-map',

    resolve: {
        extensions: ['.ts', '.js'],
        modules: [helpers.root('src'), 'node_modules']
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: [
                    // these packages have problems with their sourcemaps
                    /(node_modules)/
                ]
            },
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        query: {
                            configFileName: 'tsconfig.test.json',
                            // use inline sourcemaps for "karma-remap-coverage" reporter
                            sourceMap: false,
                            inlineSourceMap: true,
                            compilerOptions: {
                                // Remove TypeScript helpers to be injected
                                // below by DefinePlugin
                                removeComments: true

                            }
                        },
                    },
                    'angular2-template-loader'
                ],
                exclude: [/\.e2e\.ts$/, /(node_modules)/]
            },
            {
                enforce: 'post',
                test: /\.(js|ts)$/,
                loader: 'istanbul-instrumenter-loader',
                include: helpers.root('src'),
                exclude: [
                    /\.(e2e|spec)\.ts$/,
                    /node_modules/
                ]
            }

        ]
    },
    plugins: [
        new CleanWebpackPlugin(
            ['coverage'],
            {
                root: helpers.root(),
                verbose: true,
                dry: false
            }
        ),

        new DefinePlugin({
            'ENV': JSON.stringify(ENV),
            'process.env': {
                'ENV': JSON.stringify(ENV)
            }
        }),
        new ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)@angular/,
            helpers.root('src'), // location of your src
            {
                // your Angular Async Route paths relative to this root directory
            }
        ),
        new LoaderOptionsPlugin({
            debug: false
        })
    ]
};
