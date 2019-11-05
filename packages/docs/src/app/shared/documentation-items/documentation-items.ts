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
                    id: 'radio',
                    name: 'Radio',
                    summary: '',
                    examples: ['radio-types']
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

const ALL_COMPONENTS = DOCS[COMPONENTS].reduce((result, category) => result.concat(category.items), []);
const ALL_CDK = DOCS[CDK].reduce((result, cdk) => result.concat(cdk.items), []);
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

    getItemById(id: string, section: string): DocItem {
        const sectionLookup = section === 'cdk' ? 'cdk' : 'mosaic';

        return ALL_DOCS.find((doc) => doc.id === id && doc.packageName === sectionLookup);
    }

    getCategoryById(id: string): DocCategory {
        return ALL_CATEGORIES.find((c) => c.id === id);
    }
}
