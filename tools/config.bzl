# List of all entry-points of the Angular CDK package.
CDK_ENTRYPOINTS = [
    "a11y",
    "datetime",
    "keycodes",
    "testing",
]

MOSAIC_ENTRYPOINTS = [
    "autocomplete",
    "button",
    "button-toggle",
    "card",
    "checkbox",
    "core",
    "datepicker",
    "divider",
    "dropdown",
    "form-field",
    "icon",
    "input",
    "link",
    "list",
    "modal",
    "navbar",
    "popover",
    "progress-bar",
    "progress-spinner",
    "radio",
    "select",
    "sidebar",
    "sidepanel",
    "splitter",
    "table",
    "tabs",
    "tags",
    "textarea",
    "timepicker",
    "toggle",
    "tooltip",
    "tree",
    "tree-select",
]

CDK_TARGETS = ["//packages/cdk"] + ["//packages/cdk/%s" % ep for ep in CDK_ENTRYPOINTS]

MOSAIC_TARGETS = ["//packages/mosaic"] + ["//packages/mosaic/%s" % ep for ep in MOSAIC_ENTRYPOINTS]

