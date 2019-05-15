import {Injectable, EventEmitter} from '@angular/core';


export interface IDocsSiteTheme {
    href: string;
    accent: string;
    primary: string;
    isDark?: boolean;
    isDefault?: boolean;
}


@Injectable()
export class ThemeStorage {
    static storageKey = 'docs-theme-storage-current';

    onThemeUpdate: EventEmitter<IDocsSiteTheme> = new EventEmitter<IDocsSiteTheme>();

    storeTheme(theme: IDocsSiteTheme) {
        try {
            window.localStorage[ThemeStorage.storageKey] = JSON.stringify(theme);
        } catch (e) {}

        this.onThemeUpdate.emit(theme);
    }

    getStoredTheme() {
        try {
            return JSON.parse(window.localStorage[ThemeStorage.storageKey] || null);
        } catch (e) {
            return null;
        }
    }

    clearStorage() {
        try {
            window.localStorage.removeItem(ThemeStorage.storageKey);
        } catch (e) {}
    }
}
