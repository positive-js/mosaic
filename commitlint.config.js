
const scope_types = [
    'alert',
    'autocomplete',
    'badge',
    'build',
    'button',
    'button-toggle',
    'ci',
    'cdk',
    'card',
    'checkbox',
    'chore',
    'common',
    'datepicker',
    'design-tokens',
    'divider',
    'docs',
    'dropdown',
    'overlay',
    'formatter',
    'form-field',
    'icon',
    'input',
    'link',
    'list',
    'modal',
    'mosaic-moment-adapter',
    'mosaic-luxon-adapter',
    'navbar',
    'optgroup',
    'panel',
    'popover',
    'progress-bar',
    'progress-spinner',
    'radio',
    'schematics',
    'scrolling',
    'select',
    'security',
    'sidepanel',
    'splitter',
    'tabs',
    'tags',
    'textarea',
    'timepicker',
    'toggle',
    'tooltip',
    'tree',
    'tree-select',
    'typography',
    'vertical-navbar',
    'visual'
];

module.exports = {
    extends: ['@ptsecurity/commitlint-config'],
    rules: {
        'scope-enum': [ 2, 'always', scope_types]
    }
};
