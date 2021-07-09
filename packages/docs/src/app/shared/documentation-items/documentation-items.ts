/* tslint:disable:naming-convention */
import { Injectable } from '@angular/core';
import { EXAMPLE_COMPONENTS } from '@ptsecurity/mosaic-examples';


export interface AdditionalApiDoc {
    name: string;
    path: string;
}

export interface ExampleSpecs {
    prefix: string;
    exclude?: string[];
}

export interface DocItem {
    /** Id of the doc item. Used in the URL for linking to the doc. */
    id: string;
    /** Display name of the doc item. */
    name: string;
    /** Short summary of the doc item. */
    summary?: string;
    /** Package which contains the doc item. */
    packageName?: string;
    /** Specifications for which examples to be load. */
    exampleSpecs?: ExampleSpecs;
    /** List of examples. */
    examples?: string[];
    /** Optional id of the API document file. */
    apiDocId?: string;
    /** Optional path to the overview file of this doc item. */
    overviewPath?: string;
    /** List of additional API docs. */
    additionalApiDocs?: AdditionalApiDoc[];
}

export interface DocCategory {
    id: string;
    name: string;
    summary: string;
    items: DocItem[];
}

export interface DocSection {
    name: string;
    summary: string;
}

const exampleNames = Object.keys(EXAMPLE_COMPONENTS);
const COMPONENTS = 'components';
const COMMON = 'common';
const CDK = 'cdk';

export const SECTIONS: { [key: string]: DocSection } = {
    [COMPONENTS]: {
        name: 'Components',
        summary: 'Angular Mosaic UI components'
    },
    [CDK]: {
        name: 'CDK',
        summary: 'The Component Dev Kit (CDK) is a set of behavior primitives for building UI components.'
    }
};

const DOCS: { [key: string]: DocCategory[] } = {
    [COMPONENTS]: [
        {
            id: 'indicators',
            name: 'Indicators',
            summary: '',
            items: [
                {
                    id: 'alerts',
                    name: 'Alerts',
                    summary: '',
                    examples: ['alerts-types']
                },
                {
                    id: 'badges',
                    name: 'Badges',
                    summary: '',
                    examples: ['badges-types']
                },
                {
                    id: 'icon',
                    name: 'Icon',
                    summary: '',
                    examples: ['icon-types']
                },
                {
                    id: 'progress-bar',
                    name: 'Progress-bar',
                    summary: '',
                    examples: ['progress-bar-types']
                },
                {
                    id: 'progress-spinner',
                    name: 'Progress-spinner',
                    summary: '',
                    examples: ['progress-spinner-types']
                },
                {
                    id: 'tags',
                    name: 'Tags',
                    summary: '',
                    examples: ['tags-types']
                }
            ]
        },
        {
            id: 'modals',
            name: 'Popups & Modals',
            summary: '',
            items: [
                {
                    id: 'modal',
                    name: 'Modal',
                    summary: '',
                    examples: ['modal-types']
                },
                {
                    id: 'popover',
                    name: 'Popover',
                    summary: '',
                    examples: ['popover-types']
                },
                {
                    id: 'sidepanel',
                    name: 'Sidepanel',
                    summary: '',
                    examples: ['sidepanel-types']
                },
                {
                    id: 'tooltip',
                    name: 'Tooltip',
                    summary: '',
                    examples: ['tooltip-types']
                }
            ]
        },
        {
            id: 'forms',
            name: 'Form Controls',
            summary: 'Controls that collect and validate user input.',
            items: [
                {
                    id: 'checkbox',
                    name: 'Checkbox',
                    summary: '',
                    examples: ['checkbox-types']
                },
                {
                    id: 'datepicker',
                    name: 'Datepicker',
                    summary: '',
                    examples: ['datepicker-types']
                },
                {
                    id: 'dropdown',
                    name: 'Dropdown',
                    summary: '',
                    examples: ['dropdown-types']
                },
                {
                    id: 'input',
                    name: 'Input',
                    summary: '',
                    examples: ['input-types']
                },
                {
                    id: 'textarea',
                    name: 'Textarea',
                    summary: '',
                    examples: ['textarea-types']
                },
                {
                    id: 'radio',
                    name: 'Radio',
                    summary: '',
                    examples: ['radio-types']
                },
                {
                    id: 'timepicker',
                    name: 'Timepicker',
                    summary: '',
                    examples: ['timepicker-types']
                },
                {
                    id: 'select',
                    name: 'Select',
                    summary: '',
                    examples: ['select-types']
                },
                {
                    id: 'tree-select',
                    name: 'Tree-select',
                    summary: '',
                    examples: ['treeSelect-types']
                },
                {
                    id: 'autocomplete',
                    name: 'Autocomplete',
                    summary: '',
                    examples: ['autocomplete-types']
                },
                {
                    id: 'tags-input',
                    name: 'Tags input',
                    summary: '',
                    examples: ['tags-input-types']
                },
                {
                    id: 'tags-autocomplete',
                    name: 'Tags autocomplete',
                    summary: '',
                    examples: ['tags-autocomplete-types']
                }
            ]
        },
        {
            id: 'nav',
            name: 'Navigation',
            summary: 'Menus, toolbars that organise your content.',
            items: [
                {
                    id: 'link',
                    name: 'Link',
                    summary: '',
                    examples: ['link-types']
                },
                {
                    id: 'navbar',
                    name: 'Navbar',
                    summary: '',
                    examples: ['navbar-types']
                }
            ]
        },
        {
            id: 'layout',
            name: 'Layout',
            summary: '',
            items: [
                {
                    id: 'card',
                    name: 'Card',
                    summary: '',
                    examples: ['card-types']
                },
                {
                    id: 'splitter',
                    name: 'Splitter',
                    summary: '',
                    examples: ['splitter-types']
                },
                {
                    id: 'divider',
                    name: 'Divider',
                    summary: '',
                    examples: ['divider-types']
                },
                {
                    id: 'tabs',
                    name: 'Tabs',
                    summary: '',
                    examples: ['tabs-types']
                },
                {
                    id: 'layout-flex',
                    name: 'Layout flex',
                    summary: '',
                    examples: ['layout-flex-types']
                }
            ]
        },
        {
            id: 'buttons',
            name: 'Buttons',
            summary: 'Buttons, toggles.',
            items: [
                {
                    id: 'button',
                    name: 'Button',
                    summary: 'An interactive button with a range of presentation options.',
                    examples: ['button-types']
                },
                {
                    id: 'button-toggle',
                    name: 'Button Toggle',
                    summary: '',
                    examples: ['button-toggle-types']
                },
                {
                    id: 'toggle',
                    name: 'Toggle',
                    summary: '',
                    examples: ['toggle-types']
                }
            ]
        },
        {
            id: 'core/styles',
            name: 'Styles',
            summary: 'styles',
            items: [
                {
                    id: 'typography',
                    name: 'Typography',
                    summary: '',
                    examples: ['typography-types']
                }
            ]
        },
        {
            id: 'core/styles',
            name: 'Data list',
            summary: 'styles',
            items: [
                {
                    id: 'list',
                    name: 'List',
                    summary: '',
                    examples: ['list-types']
                },
                {
                    id: 'tree',
                    name: 'Tree',
                    summary: '',
                    examples: ['tree-types']
                },
                {
                    id: 'tags-list',
                    name: 'Tags list',
                    summary: '',
                    examples: ['tags-list-types']
                },
                {
                    id: 'table',
                    name: 'Table',
                    summary: '',
                    examples: ['table-types']
                }
            ]
        },
        {
            id: 'core/styles',
            name: 'Formatters',
            summary: 'styles',
            items: [
                {
                    id: 'number-formatter',
                    name: 'Number',
                    summary: '',
                    examples: ['number-types']
                },
                {
                    id: 'date-formatter',
                    name: 'Date',
                    summary: '',
                    examples: ['date-types']
                }
            ]
        },
        {
            id: 'core/styles',
            name: 'Validation',
            summary: 'styles',
            items: [
                {
                    id: 'validation',
                    name: 'Validation',
                    summary: '',
                    examples: ['validation-types']
                }
            ]
        },
        {
            id: 'core/styles',
            name: 'Forms',
            summary: 'styles',
            items: [
                {
                    id: 'forms',
                    name: 'Forms',
                    summary: '',
                    examples: ['forms-types']
                }
            ]
        }
    ],
    [CDK]: [],
    [COMMON]: [
        {
            id: 'components',
            name: 'Components',
            summary: '',
            items: [
                {
                    id: 'sites-menu',
                    name: 'Sites Menu',
                    summary: '',
                    examples: ['sites-menu-types']
                }
            ]
        }
    ]
};

for (const category of DOCS[COMPONENTS]) {
    for (const doc of category.items) {
        doc.packageName = 'mosaic';
    }
}

for (const category of DOCS[CDK]) {
    for (const doc of category.items) {
        doc.packageName = 'cdk';
    }
}

for (const category of DOCS[COMMON]) {
    for (const doc of category.items) {
        doc.packageName = 'common';
    }
}

const ALL_COMPONENTS = DOCS[COMPONENTS].reduce((result, category) => result.concat(category.items), []);
const ALL_CDK        = DOCS[CDK].reduce((result, cdk) => result.concat(cdk.items), []);
const ALL_COMMON     = DOCS[COMMON].reduce((result, cdk) => result.concat(cdk.items), []);
const ALL_DOCS = ALL_COMPONENTS.concat(ALL_CDK).concat(ALL_COMMON);

@Injectable()
export class DocumentationItems {
    getCategories(section: string): DocCategory[] {
        return DOCS[section];
    }

    getItems(section: string): DocItem[] {
        if (section === COMPONENTS) {
            return ALL_COMPONENTS;
        }
        if (section === COMMON) {
            return ALL_COMMON;
        }
        if (section === CDK) {
            return ALL_CDK;
        }

        return [];
    }

    getItemById(id: string, section: string): DocItem {
        let aliasToSection = section;

        if (section === 'components') {
            aliasToSection = 'mosaic';
        }

        return ALL_DOCS.find((doc) => doc.id === id && doc.packageName === aliasToSection);
    }
}
