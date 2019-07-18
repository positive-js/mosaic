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


const DOCS: { [key: string]: DocCategory[] } = {
    [COMPONENTS]: [
        {
            id: 'forms',
            name: 'Form Controls',
            summary: 'Controls that collect and validate user input.',
            items: [
            ]
        },
        {
            id: 'nav',
            name: 'Navigation',
            summary: 'Menus, toolbars that organise your content.',
            items: [
            ]
        },
        {
            id: 'layout',
            name: 'Layout',
            summary: '',
            items: [
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
            id: 'modals',
            name: 'Popups & Modals',
            summary: 'Floating components that can be dynamically shown or hidden.',
            items: [
            ]
        },
        {
            id: 'tables',
            name: 'Data table',
            summary: 'Tools for displaying and interacting with tabular data.',
            items: [
            ]
        }
    ]
};

for (const category of DOCS[COMPONENTS]) {
    for (const doc of category.items) {
        doc.packageName = 'mosaic';
    }
}

const ALL_COMPONENTS = DOCS[COMPONENTS].reduce(
    (result, category) => result.concat(category.items), []);
const ALL_DOCS = ALL_COMPONENTS;
const ALL_CATEGORIES = DOCS[COMPONENTS];

@Injectable()
export class DocumentationItems {
    getCategories(section: string): DocCategory[] {
        return DOCS[section];
    }

    getItems(section: string): DocItem[] {
        if (section === COMPONENTS) {
            return ALL_COMPONENTS;
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
