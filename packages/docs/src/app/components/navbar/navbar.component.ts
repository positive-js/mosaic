import { Component } from '@angular/core';

import { INavbarProperty, NavbarProperty } from './navbar-property';


@Component({
    selector: 'navbar',
    templateUrl: './navbar.template.html',
    styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
    /*To add navbar property create new private property of type INavbarProperty
    and instantiate new NavbarProperty(property: INavbarProperty)*/
    versionSwitch: NavbarProperty;
    colorSwitch: NavbarProperty;
    themeSwitch: NavbarProperty;
    languageSwitch: NavbarProperty;

    private activeColorProperty: INavbarProperty = {
        property: 'PT_color',
        data: [
            {
                code: '#2f80ed',
                className: 'active-blue',
                selected: true
            },
            {
                code: '#832112',
                className: 'active-red',
                selected: false
            },
            {
                code: '#07804e',
                className: 'active-green',
                selected: false
            },
            {
                code: '#eaaf00',
                className: 'active-yellow',
                selected: false
            }
        ],
        updateTemplate: true,
        updateSelected: true
    };

    private languageProperty: INavbarProperty = {
        property: 'PT_language',
        data: [
            'Русский язык',
            'Английский язык'
        ],
        updateTemplate: false,
        updateSelected: false
    };

    private themeProperty: INavbarProperty = {
        property: 'PT_theme',
        data: [
            {
                theme: 'default',
                name: 'Светлая тема',
                className: 'theme-default',
                selected: true
            },
            {
                theme: 'dark',
                name: 'Темная тема',
                className: 'theme-dark',
                selected: false
            }
        ],
        updateTemplate: true,
        updateSelected: true
    };

    private versionProperty: INavbarProperty = {
        property: 'PT_version',
        data: [
            {
                number: '8.0',
                date: '9 октября',
                selected: true
            }
        ],
        updateTemplate: false,
        updateSelected: true
    };

    constructor() {
        this.versionSwitch = new NavbarProperty(this.versionProperty);
        this.colorSwitch = new NavbarProperty(this.activeColorProperty);
        this.themeSwitch = new NavbarProperty(this.themeProperty);
        this.languageSwitch = new NavbarProperty(this.languageProperty);
    }


}
