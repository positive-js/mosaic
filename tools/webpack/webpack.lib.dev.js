const webpackMerge = require('webpack-merge');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');

const path = require('path');
const helpers = require('./helpers');
const commonConfig = require('./webpack.common.js');

const ENV = 'development';
const HOST = 'localhost';
const PORT = 3000;
const METADATA = {
    host: HOST,
    port: PORT,
    ENV: ENV
};

module.exports = function (options) {

    return webpackMerge(commonConfig(options), {

        devtool: 'source-map',

        output: {
            path: helpers.root('dist'),
            filename: '[name].bundle.js',
            sourceMapFilename: '[name].map',
            chunkFilename: '[id].chunk.js',
            library: 'ac_[name]',
            libraryTarget: 'var'
        },

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: path.resolve('./tools/webpack/ng2-sass-loader.js')
                        }
                    ]
                },
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                configFileName: 'src/lib-dev/tsconfig.json'
                            }
                        },
                        {
                            loader: 'angular2-template-loader'
                        }
                    ],

                    exclude: [
                        helpers.root('node_modules')
                    ]
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

        plugins: [
            new CleanWebpackPlugin(
                ['dist'],
                {
                    root: helpers.root(),
                    verbose: true,
                    dry: false
                }
            ),

            new HotModuleReplacementPlugin(),

            new DefinePlugin({
                'ENV': JSON.stringify(METADATA.ENV),
                'process.env': {
                    'ENV': JSON.stringify(METADATA.ENV),
                    'NODE_ENV': JSON.stringify(METADATA.ENV)
                }
            }),

            new LoaderOptionsPlugin({
                debug: true
            })
        ],

        devServer: {
            hot: true,
            inline: true,
            contentBase: './src',
            port: METADATA.port,
            host: METADATA.host,
            historyApiFallback: true,
            watchOptions: {
                ignored: /node_modules/
            },
            stats: {
                colors: true,
                hash: true,
                timings: true,
                chunks: true,
                chunkModules: false,
                children: false, // listing all children is very noisy in AOT and hides warnings/errors
                modules: false,
                reasons: false,
                warnings: true,
                assets: false, // listing all assets is very noisy when using assets directories
                version: false
            }
        }
    })
};
