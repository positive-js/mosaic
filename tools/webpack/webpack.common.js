const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');

const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;

const HtmlWebpackPlugin = require('html-webpack-plugin');

const helpers = require('./helpers');


module.exports = function (options) {

    const COMPONENT_NAME = options.component;

    const entryObj = {
        polyfills: [
            'core-js/es6/reflect',
            'core-js/es7/reflect',
            "zone.js/dist/zone",
            "zone.js/dist/long-stack-trace-zone"
        ],
        vendors: [
            "@angular/animations",
            "@angular/common",
            "@angular/compiler",
            "@angular/core",
            "@angular/platform-browser",
            "@angular/platform-browser-dynamic",
            "rxjs"
        ],
    };

    entryObj[COMPONENT_NAME] = [
        'lib-dev',
        COMPONENT_NAME,
        'module.ts'
    ].join('/');

    const htmlTemplatePath = [
        'src/lib-dev',
        COMPONENT_NAME,
        'index.html'
    ].join('/');


    return {

        entry: entryObj,

        resolve: {
            extensions: [ '.ts', '.js' ],
            modules: [ helpers.root('node_modules'), helpers.root('src') ],
        },

        module: {
            rules: [
                {
                    test: /\.(html)$/,
                    loader: 'raw-loader',
                    exclude: /\.async\.(html)$/
                },

                { test: /\.(otf|ttf|woff|woff2)$/, use: 'url-loader?limit=10000' },
            ]
        },

        plugins: [

            new HtmlWebpackPlugin({
                template: htmlTemplatePath,
                chunksSortMode: 'dependency',
                inject: 'body'
            }),

            new DuplicatePackageCheckerPlugin(),

            new ScriptExtHtmlWebpackPlugin({
                defaultAttribute: 'defer'
            }),

            new CheckerPlugin(),

            new CommonsChunkPlugin({
                name: 'polyfills',
                chunks: ['polyfills']
            }),

            new CommonsChunkPlugin({
                name: ['polyfills', 'vendors'].reverse()
            }),

            // This enables tree shaking of the vendor modules
            new CommonsChunkPlugin({
                name: 'vendors',
                chunks: [options.component],
                minChunks: module => /node_modules/.test(module.resource)
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
                /angular(\\|\/)core(\\|\/)(@angular|esm5)/,
                helpers.root('src')
            )
        ]
    }
};
