/* tslint:disable:naming-convention */
import { Injectable } from '@angular/core';


export interface DocItem {
    id: string;
    name: string;
    summary?: string;
    packageName?: string;
    examples?: string[];
}

export interface DocCategory {
    id: string;
    name: string;
    items: DocItem[];
    summary?: string;
}


const COMPONENTS = 'components';
const CDK = 'cdk';

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
                },
                {
                    id: 'toast',
                    name: 'Toast',
                    summary: '',
                    examples: ['toast-types']
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
                },
                {
                    id: 'dropdown',
                    name: 'Dropdown',
                    summary: '',
                    examples: ['dropdown-types']
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
    [CDK]: [

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

const ALL_COMPONENTS = DOCS[COMPONENTS]
    .reduce((result, category) => result.concat(category.items), [] as DocItem[]);
const ALL_CDK = DOCS[CDK].reduce((result, cdk) => result.concat(cdk.items), [] as DocItem[]);
const ALL_DOCS = ALL_COMPONENTS.concat(ALL_CDK);
const ALL_CATEGORIES = DOCS[COMPONENTS].concat(DOCS[CDK]);

@Injectable()
export class DocumentationItems {
    getCategories(section: string): DocCategory[] {
        return DOCS[section];
    }

    getItems(section: string): DocItem[] {
        if (section === COMPONENTS) {
            return ALL_COMPONENTS;
        }
        if (section === CDK) {
            return ALL_CDK;
        }

        return [];
    }

    getItemById(id: string, section: string): DocItem | undefined {
        const sectionLookup = section === 'cdk' ? 'cdk' : 'mosaic';

        return ALL_DOCS.find((doc) => doc.id === id && doc.packageName === sectionLookup);
    }

    getCategoryById(id: string): DocCategory | undefined {
        return ALL_CATEGORIES.find((c) => c.id === id);
    }
}
