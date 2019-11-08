import { Component } from '@angular/core';

import { INavbarProperty, NavbarProperty } from './navbar-property';
import { mosaicVersion } from '../../shared/version/version';


@Component({
    selector: 'navbar',
    templateUrl: './navbar.template.html',
    styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
    mosaicVersion = mosaicVersion;

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

    // To add new version to dropdown add new object to the end of data array,
    // number of first (current) version is taken from package.json, rest should be specified
    // run npm show @ptsecurity/mosaic versions --json to see all mosaic versions
    private versionProperty: INavbarProperty = {
        property: 'PT_version',
        data: [
            {
                number: '8.1.0',
                date: '9 октября',
                selected: false,
                link: '//mosaic.ptsecurity.com'
            },
            {
                number: '7.-.-',
                date: '9 октября',
                selected: false,
                link: '//mosaic.ptsecurity.com'
            }
        ],

        updateTemplate: false,
        updateSelected: false,
        customActions: function(i) {
            if (!location.origin.match(this.data[i].link) && !location.origin.match('localhost')) {
                location.href = `${this.data[i].link}${location.pathname}${location.search}${location.hash}`;
            }
        }
    };

    constructor() {
        this.setSelectedVersion();

        this.versionSwitch = new NavbarProperty(this.versionProperty);
        this.colorSwitch = new NavbarProperty(this.activeColorProperty);
        this.themeSwitch = new NavbarProperty(this.themeProperty);
        this.languageSwitch = new NavbarProperty(this.languageProperty);
    }

    setSelectedVersion() {
        /* Если мы находимся на последней версии - обновляем ее из package.json
        Если нет - последние версии предыдущих мажоров должны быть указаны в массиве*/
        if (location.origin.match(this.versionProperty.data[0].link)) {
            this.versionProperty.data[0].number =  this.mosaicVersion;
        }
        // Определяем выбранную версию
        this.versionProperty.data.forEach((version) => {
            if(version.number == this.mosaicVersion) version.selected = true;
        })
    }

}
