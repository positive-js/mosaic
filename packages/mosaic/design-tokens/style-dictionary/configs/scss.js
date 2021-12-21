module.exports = {
    scss: {
        transformGroup: 'mc/scss',
        files: [
            {
                destination: '_variables.scss',
                format: 'scss/variables',
                filter: 'color'
            },
            {
                destination: '_palette.scss',
                format: 'mc-scss/palette',
                filter: 'palette'
            },
            {
                destination: '_typography.scss',
                format: 'mc-scss/typography',
                mapName: 'mosaic',
                filter: 'typography'
            }
        ]
    }
};
