const NyanProgressPlugin = require('nyan-progress-webpack-plugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const helpers = require('../helpers');


module.exports = function (options) {

    let entryObj = {
        polyfills: './src/lib/polyfills.ts',
        vendors: './src/lib/vendors.ts',
    };
    let htmlTemplatePath = '';

    const COMPONENT_NAME = options.component;

    if (COMPONENT_NAME) {

        entryObj[COMPONENT_NAME] = [
            'lib-dev',
            COMPONENT_NAME,
            'module.ts'
        ].join('/');

        htmlTemplatePath = [
            'src/lib-dev',
            COMPONENT_NAME,
            'index.html'
        ].join('/');
    }

    return {

        entry: entryObj,

        resolve: {
            extensions: [ '.ts', '.js' ],
            modules: [ helpers.root('node_modules'), helpers.root('src') ],
        },

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                configFileName: 'tsconfig.json'
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
                    test: /\.(html)$/,
                    loader: 'raw-loader',
                    exclude: /\.async\.(html)$/
                },

                { test: /\.(otf|ttf|woff|woff2)$/, use: 'url-loader?limit=10000' },
            ]
        },

        plugins: [

            new CheckerPlugin(),

            new DuplicatePackageCheckerPlugin(),

            new NyanProgressPlugin(),

            new ScriptExtHtmlWebpackPlugin({
                defaultAttribute: 'defer'
            }),

            new CommonsChunkPlugin({
                name: 'polyfills',
                chunks: ['polyfills']
            }),

            // This enables tree shaking of the vendor modules
            new CommonsChunkPlugin({
                name: 'vendors',
                chunks: [options.component],
                minChunks: module => /node_modules/.test(module.resource)
            }),

            new CommonsChunkPlugin({
                name: ['polyfills', 'vendors'].reverse()
            }),

            new HtmlWebpackPlugin({
                template: htmlTemplatePath,
                chunksSortMode: 'dependency',
                inject: 'body'
            }),

            /**
             * Plugin: ContextReplacementPlugin
             * Description: Provides context to Angular's use of System.import
             *
             * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
             * See: https://github.com/angular/angular/issues/11580
             */
            new ContextReplacementPlugin(
                // The (\\|\/) piece accounts for path separators in *nix and Windows
                /angular(\\|\/)core(\\|\/)@angular/,
                helpers.root('./src')
            )
        ]
    }
};
