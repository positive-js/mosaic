
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');

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

        optimization: {
            noEmitOnErrors: true,
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'initial'
            }
        },

        plugins: [

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
