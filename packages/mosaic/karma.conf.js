const getBaseKarmaConfig = require('../../karma.conf');


module.exports = function(config) {

    const baseConfig = getBaseKarmaConfig();
    config.set({
        ...baseConfig
    });

    config.set({
        coverageIstanbulReporter: {
            'report-config': {
                lcovonly: {
                    file: 'mosaic.lcov.info'
                }
            }
        },
    });
};
