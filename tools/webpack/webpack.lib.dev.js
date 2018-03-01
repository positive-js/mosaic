const webpackMerge = require('webpack-merge');

const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');

const path = require('path');
const helpers = require('./helpers');
const commonConfig = require('./webpack.common.js');

const ENV = 'development';
const HOST = 'localhost';
const PORT = 3003;
const METADATA = {
    host: HOST,
    port: PORT,
    ENV: ENV
};

module.exports = function (options) {

    return webpackMerge(commonConfig(options), {

        mode: 'development',

        cache: true,

        devtool: 'source-map',

        resolve: {
            plugins: [
                new TsConfigPathsPlugin({
                    configFileName: './tsconfig.webpack.json'
                })
            ]
        },

        output: {
            path: helpers.root('dist'),
            filename: '[name].bundle.js',
            sourceMapFilename: '[name].map'
        },

        module: {
            rules: [
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
                            options: {
                                configFileName: './tsconfig.webpack.json'
                            }

                        },
                        {
                            loader: 'angular2-template-loader'
                        }
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

            new HotModuleReplacementPlugin()

        ],

        devServer: {
            headers: { 'Access-Control-Allow-Origin': '*' },
            hot: true,
            inline: true,
            contentBase: false,
            port: METADATA.port,
            host: METADATA.host,
            open: true,
            compress: true,
            historyApiFallback: true,
            watchOptions: {
                ignored: /node_modules/
            },
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
                assets: true, // required by custom stat output
                version: false,
                errorDetails: false,
                moduleTrace: false,
            }
        }
    })
};
