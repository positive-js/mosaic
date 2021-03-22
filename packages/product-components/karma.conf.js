const getBaseKarmaConfig = require('../../karma.conf');


module.exports = function(config) {

    const baseConfig = getBaseKarmaConfig();
    config.set({
        ...baseConfig
    });

    config.set({
        coverageIstanbulReporter: {
            dir: `${config.coverageIstanbulReporter.dir}/product-components`
        }
    });
};
