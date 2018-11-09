module.exports = {
    extends: ['@ptsecurity/commitlint-config'],
    rules: {
        'scope-enum': [
            2,
            'always',
            [
                'alert',
                'badge',
                'build',
                'button',
                'cdk',
                'card',
                'checkbox',
                'chore',
                'common',
                'datepicker',
                'docs',
                'dropdown',
                'form-field',
                'icon',
                'input',
                'link',
                'list',
                'navbar',
                'panel',
                'popover',
                'progress-bar',
                'progress-spinner',
                'radio',
                'select',
                'splitter',
                'tabs',
                'textarea',
                'timepicker',
                'tooltip',
                'tree',
                'typography',
                'visual'
            ]
        ]
    }
};
