import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { mosaicVersion } from '../../shared/version/version';

import { INavbarProperty, NavbarProperty } from './navbar-property';
import { ThemeService } from './theme.service';


@Component({
    selector: 'navbar',
    templateUrl: './navbar.template.html',
    styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
    mosaicVersion = mosaicVersion;

    /*To add navbar property create new private property of type INavbarProperty
    and instantiate new NavbarProperty(property: INavbarProperty)*/
    versionSwitch: NavbarProperty;
    colorSwitch: NavbarProperty;
    themeSwitch: NavbarProperty;
    languageSwitch: NavbarProperty;

    // To add new version to dropdown add new object to the end of data array,
    // number of current version is taken from package.json, rest should be specified
    // run npm show @ptsecurity/mosaic versions --json to see all mosaic versions
    versionData = [
        {
            number: '8.1.0',
            date: '9 октября',
            selected: false,
            link: '//mosaic.ptsecurity.com'
        },
        {
            number: '8.0.0',
            date: '9 октября',
            selected: false,
            link: '//v8.mosaic.ptsecurity.com'
        }
    ];

    // To add for checking of current color theme of OS preferences
    colorAutomaticTheme: any = window.matchMedia('(prefers-color-scheme: light)');

    // To add for dynamically switching of automatic theme
    themingSubscription: Subscription;

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
                theme: 'auto',
                name: 'Автоматическое переключение',
                className: this.colorAutomaticTheme.matches ? 'theme-default' : 'theme-dark',
                selected: false
            },
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

    constructor(private themeService: ThemeService) {
        this.setSelectedVersion();

        this.colorSwitch = new NavbarProperty(this.activeColorProperty);
        this.themeSwitch = new NavbarProperty(this.themeProperty);
        this.languageSwitch = new NavbarProperty(this.languageProperty);

        this.colorAutomaticTheme.addEventListener('change', (e) => {
            if (e.matches) {
                this.themeProperty.data[0].className = 'theme-default';
            } else {
                this.themeProperty.data[0].className = 'theme-dark';
            }
        });
    }

    ngOnInit() {
        this.themingSubscription = this.themeService.currentTheme.subscribe((theme: string) => {
            if (this.themeSwitch.data[0].selected) {
            this.themeSwitch.data[0].className = theme;
            this.themeSwitch.setValue(0);
          }
        });
    }

    ngOnDestroy() {
        this.themingSubscription.unsubscribe();
    }

    goToVersion(i: number) {
        const link = this.versionData[i].link;
        if (!location.origin.match(link)) {
            location.href = `${link}${location.pathname}${location.search}${location.hash}`;
        }
        this.versionSwitch.setValue(i);
    }

    setSelectedVersion() {
        /* Если мы находимся на последней версии - обновляем ее из package.json
        Если нет - последние версии предыдущих мажоров должны быть указаны в массиве*/
        if (location.origin.match(this.versionData[0].link)) {
            this.versionData[0].number =  this.mosaicVersion;
            this.versionData[0].selected = true;
        } else {
            // Определяем выбранную версию
            this.versionData.forEach((version) => {
                if (version.number === this.mosaicVersion) {
                    version.selected = true;
                }
            });
        }
    }
}
