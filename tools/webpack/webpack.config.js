const path = require('path');

const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');

const { TsConfigPathsPlugin } = require('awesome-typescript-loader');
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const helpers = require('./helpers');


module.exports = function (options) {

    const COMPONENT_NAME = options.component;

    const entryObj = {
        polyfills: [
            'core-js/es5',
            'core-js/es6',
            'core-js/es7/reflect',
            'core-js/es7/object',
            'zone.js/dist/zone',
            'zone.js/dist/long-stack-trace-zone'
        ],
        vendors: [
            '@angular/animations',
            '@angular/common',
            '@angular/compiler',
            '@angular/core',
            '@angular/platform-browser',
            '@angular/platform-browser-dynamic',
            'rxjs',
            'moment',
            'messageformat'
        ],
    };

    entryObj[COMPONENT_NAME] = [
        'lib-dev',
        COMPONENT_NAME,
        'module.ts'
    ].join('/');

    return {
        entry: entryObj,

        mode: 'development',

        devtool: 'source-map',

        resolve: {
            extensions: [ '.ts', '.js' ],
            modules: [ helpers.root('node_modules'), helpers.root('src') ],
            plugins: [
                new TsConfigPathsPlugin({
                    configFileName: './tsconfig.webpack.json'
                })
            ]
        },

        output: {
            path: helpers.root('dist'),
            filename: '[name].js',
            chunkFilename: '[id].chunk.js'
        },

        module: {
            rules: [
                {
                    test: /\.(html)$/,
                    loader: 'raw-loader',
                    exclude: /\.async\.(html)$/
                },

                { test: /\.(otf|ttf|woff|woff2)$/, use: 'url-loader?limit=10000' },

                {
                    test: /\.ts$/,
                    enforce: 'post',
                    use: [{ loader: path.resolve('./tools/webpack/ng2-sass-loader.js') }]
                },
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'awesome-typescript-loader',
                            options: { configFileName: './tsconfig.webpack.json' }
                        },
                        { loader: 'angular2-template-loader' }
                    ],

                    exclude: [ helpers.root('node_modules') ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        'raw-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                                plugins: () => [require('autoprefixer')({ browsers: ['last 2 versions'] })]
                            }
                        },
                        'resolve-url-loader',
                        'sass-loader?sourceMap'
                    ],
                    include: [ helpers.root('src') ]
                },

                {
                    // Just removing a deprecation warning, nothing to see here
                    // https://github.com/angular/angular/issues/21560
                    test: /@angular(\\|\/)core(\\|\/)fesm5/,
                    parser: { system: true }
                }
            ]
        },

        optimization: {
            runtimeChunk: "single",
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendor",
                        chunks: "all"
                    }
                }
            }
        },

        plugins: [

            new HotModuleReplacementPlugin(),

            new HtmlWebpackPlugin({
                template: 'tools/webpack/default_index.ejs',
                filename: 'index.html',
                chunksSortMode: 'dependency',
                inject: 'body'
            }),

            new ScriptExtHtmlWebpackPlugin({
                defaultAttribute: 'defer'
            }),

            /**
             * Plugin: ContextReplacementPlugin
             * Description: Provides context to Angular's use of System.import
             *
             * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
             * See: https://github.com/angular/angular/issues/11580
             *
             * for Angular 5
             * See: https://github.com/angular/angular/issues/14898
             */
            new ContextReplacementPlugin(
                // The (\\|\/) piece accounts for path separators in *nix and Windows
                /@angular(\\|\/)core(\\|\/)fesm5/,
                helpers.root('src')
            )
        ],

        devServer: {
            hotOnly: true,
            inline: false,
            host: 'localhost',
            port: 3003,
            historyApiFallback: true,
            watchOptions: { ignored: /node_modules/ },
            stats: {
                colors: true,
                hash: true, // required by custom stat output
                timings: true, // required by custom stat output
                chunks: false, // required by custom stat output
                chunkModules: false,
                children: false, // listing all children is very noisy in AOT and hides warnings/errors
                modules: false,
                reasons: false,
                warnings: true,
                errors: true,
            },
            overlay: {
                warnings: true,
                errors: true,
            }
        },

        node: {
            global: true,
            crypto: 'empty',
            process: true,
            module: false,
            clearImmediate: false,
            setImmediate: false
        }
    }
};
