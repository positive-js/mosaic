module.exports = {
    css: {
        transformGroup: 'mc/css',
        files: [
            {
                destination: 'css-tokens.css',
                format: 'css/variables',
                filter: 'size',
                prefix: 'mc'
            }
        ]
    }
};
