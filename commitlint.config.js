module.exports = {
    extends: ['@ptsecurity/commitlint-config'],
    rules: {
        'scope-enum': [ 
            2,
            'always',
            [
                'build',
                'docs',
                'chore',
                'cdk', 
                'common',
                'typography',
                'button',
                'list',
                'checkbox',
                'radio',
                'input',
                'select',
                'tooltip',
                'dropdown',
                'popover',
                'tree',
                'tabs',
                'icon',
                'progress-spinner',
                'progress-bar',
                'datepicker',
                'timepicker',
                'visual'
            ]
        ]
    }
};
