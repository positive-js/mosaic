/*
    Webpack plugins
 */
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const DllPlugin = require('webpack/lib/DllPlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

const helpers = require('./helpers');


const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const DLL_DIST = helpers.root('dist-dll');

const METADATA = {
    ENV: ENV
};

module.exports = {

    devtool: 'sourcemap',

    entry: {
        'polyfills': ['./src/polyfills.ts'],
        'vendors': ['./src/vendors.ts'],
    },

    resolve: {
        extensions: [ '.js', '.ts' ],
        modules: [ helpers.root('node_modules'), helpers.root('src') ]
    },

    output: {
        filename: '[name].dll.js',
        path: DLL_DIST,

        library: '[name]',
        sourceMapFilename: '[name].map'
    },

    plugins: [

        new ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            ///angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            /angular(\\|\/)core(\\|\/)@angular/,
            helpers.root('./src')
        ),

        new UglifyJsPlugin({
            beautify: false,
            mangle: {
                screw_ie8: true
            },
            compress: {
                screw_ie8: true,
                warnings: false
            },
            comments: false
        }),

        new DllPlugin({
            path: DLL_DIST + '/[name]-manifest.json',
            name: '[name]',
            context: helpers.root()
        }),

        new DefinePlugin({
            'ENV': JSON.stringify(METADATA.ENV)
        })
    ]
};
