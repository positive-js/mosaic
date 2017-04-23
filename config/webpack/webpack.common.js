const NyanProgressPlugin = require('nyan-progress-webpack-plugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');

const helpers = require('./helpers');


module.exports = {

    context: helpers.root(),

    resolve: {
        extensions: [ '.ts', '.js', '.json' ],
        modules: [ helpers.root('node_modules'), helpers.root('src') ],
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader',
                options: {
                    configFileName: 'tsconfig.json'
                },
                exclude: [
                    helpers.root('node_modules')
                ]
            },

            { test: /\.(otf|ttf|woff|woff2)$/, use: 'url-loader?limit=10000' },
        ]
    },

    plugins: [

        new NyanProgressPlugin(),

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
};
