const webpackMerge = require('webpack-merge');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');

const helpers = require('./helpers');
const commonConfig = require('./webpack.common.js');

const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const METADATA = {
    host: HOST,
    port: PORT,
    ENV: ENV
};

let polyfillsManifest;
let vendorManifest;

try {
    polyfillsManifest = require(helpers.root('dist-dll', 'polyfills-manifest.json'));
    vendorManifest = require(helpers.root('dist-dll', 'vendors-manifest.json'));
} catch (e) {
    throw 'Please rebuild DLL first by running `npm run build:dll`';
}

module.exports = function (options) {

    let entryObj = {} ;
    if (options.component) {

        const COMPONENT_NAME = options.component;
        const componentEntry = [
            'components',
            COMPONENT_NAME,
            'index.ts'
        ].join('/');

        entryObj[COMPONENT_NAME] = componentEntry;
    }

    return webpackMerge(commonConfig, {

        devtool: 'source-map',

        entry: entryObj,

        output: {

            filename: '[name].bundle.js',

            chunkFilename: '[name].chunk.js'
        },

        module: {
            rules: [
                {
                    test: /\.less$/,
                    use: [
                        {
                            loader: 'style-loader'
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'less-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                }
            ]
        },

        plugins: [

            new DefinePlugin({
                'ENV': JSON.stringify(METADATA.ENV)
            }),

            new UglifyJsPlugin({
                sourceMap: true
            }),

            new DllReferencePlugin({
                context: '.',
                manifest: polyfillsManifest
            }),

            new DllReferencePlugin({
                context: '.',
                manifest: vendorManifest
            }),

            new LoaderOptionsPlugin({
                debug: true,
                options: {
                    tslint: {
                        emitErrors: true,
                        failOnHint: false,
                        resourcePath: helpers.root('src')
                    }
                }
            }),

            new AddAssetHtmlPlugin([
                { filepath: 'dist-dll' + '/polyfills.dll.js', includeSourcemap: false },
                { filepath: 'dist-dll' + '/vendors.dll.js',   includeSourcemap: false }
            ]),

            new HtmlWebpackPlugin({
                template: 'src/components/button/button.html',
                chunksSortMode: 'dependency',
                inject: 'body'
            })
        ],

        devServer: {
            contentBase: './src',
            port: METADATA.port,
            host: METADATA.host,
            historyApiFallback: true,
            watchOptions: {
                aggregateTimeout: 300,
                poll: 1000
            },
            stats: 'minimal'
        }
    })
};
