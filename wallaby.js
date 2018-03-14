var wallabyWebpack = require('wallaby-webpack');
var path = require('path');

module.exports = function (wallaby) {

    var webpackPostprocessor = wallabyWebpack({
        entryPatterns: [
            'spec-bundle-wallaby.js',
            'src/**/*spec.js'
        ],

        module: {
            loaders: [
                { test: /\.css$/, loader: 'raw-loader' },
                { test: /\.html$/, loader: 'raw-loader' },
                {
                    test: /\.ts$/,
                    include: /node_modules/,
                    use: [
                        {
                            loader: 'awesome-typescript-loader',
                            query: {
                                sourceMap: true,
                                inlineSourceMap: true,
                                compilerOptions: {
                                    removeComments: true
                                }
                            }
                        },
                        'angular2-template-loader'
                    ]
                },
                { test: /\.js$/, loader: 'angular2-template-loader', exclude: /node_modules/ },
                { test: /\.json$/, loader: 'json-loader' },
                { test: /\.styl$/, loaders: ['raw-loader', 'stylus-loader'] },
                { test: /\.less$/, loaders: ['raw-loader', 'less-loader'] },
                { test: /\.scss$|\.sass$/, loaders: ['raw-loader', 'sass-loader'] },
                { test: /\.(jpg|png)$/, loader: 'url-loader?limit=128000' }
            ]
        },

        resolve: {
            extensions: ['.js', '.ts'],
            modules: [
                path.join(wallaby.projectCacheDir, 'src')
            ]
        }
    });

    return {
        files: [
            { pattern: 'src/**/*.ts', load: false },
            { pattern: 'spec-bundle-wallaby.js', load: false, instrument: false },
            { pattern: 'src/**/*.d.ts', ignore: true },
            { pattern: 'src/**/*.css', load: false },
            { pattern: 'src/**/*.scss', load: false },
            { pattern: 'src/**/*.html', load: false },
            { pattern: 'src/**/*.json', load: false },
            { pattern: 'src/**/*spec.ts', ignore: true }
        ],

        tests: [
            { pattern: 'src/**/*spec.ts', load: false }
        ],

        testFramework: 'jasmine',

        // middleware: function (app, express) {
        //     var path = require('path');
        //     app.use('/favicon.ico', express.static(path.join(__dirname, 'src/favicon.ico')));
        //     app.use('/assets', express.static(path.join(__dirname, 'src/assets')));
        // },

        env: {
            kind: 'chrome'
        },

        postprocessor: webpackPostprocessor,

        setup: function () {
            window.__moduleBundler.loadTests();
        },

        debug: true
    };
};
