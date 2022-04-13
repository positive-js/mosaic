import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';

import { mosaicVersion } from '../../shared/version/version';

import { INavbarProperty, NavbarProperty } from './navbar-property';
import { Themes, ThemeService } from './theme.service';


@Component({
    selector: 'navbar',
    templateUrl: './navbar.template.html',
    styleUrls: ['./navbar.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit, OnDestroy {
    mosaicVersion = mosaicVersion;

    /*To add navbar property create new private property of type INavbarProperty
    and instantiate new NavbarProperty(property: INavbarProperty)*/
    versionSwitch: NavbarProperty;
    colorSwitch: NavbarProperty;
    themeSwitch: NavbarProperty;
    skinSwitch: NavbarProperty;
    languageSwitch: NavbarProperty;

    // To add new version to dropdown add new object to the end of data array,
    // number of current version is taken from package.json, rest should be specified
    // run npm show @ptsecurity/mosaic versions --json to see all mosaic versions
    versionData = [
        {
            number: 'Версия 13.2',
            date: '1 апреля',
            selected: false,
            link: '//mosaic.ptsecurity.com'
        },
        {
            number: 'Версия 12.2',
            date: '12 янв 2022',
            selected: false,
            link: '//v12.mosaic.ptsecurity.com'
        },
        {
            number: 'Версия 11.6',
            date: '13 янв 2022',
            selected: false,
            link: '//v11.mosaic.ptsecurity.com'
        },
        {
            number: 'Версия 10.2',
            date: '17 февр 2021',
            selected: false,
            link: '//v10.mosaic.ptsecurity.com'
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
                code: '#2F80ED',
                className: 'color-blue',
                selected: true
            },
            {
                code: '#832112',
                className: 'color-red',
                selected: false
            },
            {
                code: '#07804E',
                className: 'color-green',
                selected: false
            },
            {
                code: '#EAAF00',
                className: 'color-yellow',
                selected: false
            }
        ],
        updateTemplate: true,
        updateSelected: true
    };

    private languageProperty: INavbarProperty = {
        property: 'PT_language',
        data: [
            'Русский',
            'English'
        ],
        updateTemplate: false,
        updateSelected: false
    };

    private themeProperty: INavbarProperty = {
        property: 'PT_theme',
        data: [
            {
                theme: 'auto',
                name: 'Авто',
                className: this.colorAutomaticTheme.matches ? Themes.Default : Themes.Dark,
                selected: true
            },
            {
                theme: 'default',
                name: 'Светлая',
                className: Themes.Default,
                selected: false
            },
            {
                theme: 'dark',
                name: 'Тёмная',
                className: Themes.Dark,
                selected: false
            }
        ],
        updateTemplate: true,
        updateSelected: true
    };

    private skinProperty: INavbarProperty = {
        property: 'PT_skin',
        data: [
            {
                theme: 'pt-2022',
                name: 'Mosaic 2022',
                className: 'pt-2022',
                selected: false
            },
            {
                theme: 'legacy-2017',
                name: 'Mosaic 2017',
                className: 'legacy-2017',
                selected: true
            }
        ],
        updateTemplate: true,
        updateSelected: true
    };

    constructor(private themeService: ThemeService) {
        this.setSelectedVersion();

        this.colorSwitch = new NavbarProperty(this.activeColorProperty);
        this.themeSwitch = new NavbarProperty(this.themeProperty);
        this.skinSwitch = new NavbarProperty(this.skinProperty);
        this.languageSwitch = new NavbarProperty(this.languageProperty);

        try {
            // Chrome & Firefox
            this.colorAutomaticTheme.addEventListener('change', (e) => {
                if (e.matches) {
                    this.themeProperty.data[0].className = Themes.Default;
                } else {
                    this.themeProperty.data[0].className = Themes.Dark;
                }
            });
        } catch (err) {
            try {
                // Safari
                this.colorAutomaticTheme.addListener((e) => {
                    if (e.matches) {
                        this.themeProperty.data[0].className = Themes.Default;
                    } else {
                        this.themeProperty.data[0].className = Themes.Dark;
                    }
                });
            } catch (errSafari) {
                // tslint:disable-next-line:no-console
                console.error(errSafari);
            }
        }
    }

    ngOnInit() {
        this.themingSubscription = this.themeService.currentTheme
            .subscribe((theme: string) => {
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
