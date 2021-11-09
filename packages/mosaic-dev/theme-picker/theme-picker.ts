import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, ChangeDetectionStrategy, NgModule } from '@angular/core';

import { IDocsSiteTheme, ThemeStorage } from './theme-storage/theme-storage';


@Component({
    selector: 'theme-picker',
    templateUrl: 'theme-picker.html',
    styleUrls: ['theme-picker.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {'aria-hidden': 'true'}
})
export class ThemePicker {
    currentTheme;

    themes: IDocsSiteTheme[] = [
        {
            primary: '#673AB7',
            href: 'default-theme.scss',
            isDefault: true
        },
        {
            primary: '#000000',
            href: 'dark-theme.scss'
        }
    ];

    constructor(private _themeStorage: ThemeStorage) {
        const currentTheme = this._themeStorage.getStoredTheme();

        if (currentTheme) {
            this.installTheme(currentTheme);
        }
    }

    installTheme(theme: IDocsSiteTheme) {
        this.currentTheme = this.getCurrentThemeFromHref(theme.href);

        // tslint:disable-next-line:non-literal-require
        require(`style-loader!./../../mosaic/core/theming/prebuilt/${theme.href}`);

        if (this.currentTheme) {
            this._themeStorage.storeTheme(this.currentTheme);
        }
    }

    private getCurrentThemeFromHref(href: string) {

        return this.themes.find((theme) => theme.href === href);
    }

}

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [ThemePicker],
    declarations: [ThemePicker],
    providers: [ThemeStorage]
})
export class ThemePickerModule { }
