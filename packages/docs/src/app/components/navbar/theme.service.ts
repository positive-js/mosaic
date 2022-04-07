import { Injectable, ApplicationRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export enum Themes {
    Default = 'theme-light',
    Dark = 'theme-dark'
}

@Injectable({
    providedIn: 'root'
})

export class ThemeService {
    currentTheme = new BehaviorSubject(Themes.Default);

    constructor(private ref: ApplicationRef) {
        const isLightTheme: boolean = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

        isLightTheme ? this.currentTheme.next(Themes.Default) : this.currentTheme.next(Themes.Dark);

        const prefersColorTheme: any = window.matchMedia('(prefers-color-scheme: light)');

        try {
            // Chrome & Firefox
            prefersColorTheme.addEventListener('change', (e) => {
                const turnOn = e.matches;
                this.currentTheme.next(turnOn ? Themes.Default : Themes.Dark);

                this.ref.tick();
            });
        } catch (err) {
            try {
                // Safari
                prefersColorTheme.addListener((e) => {
                    const turnOn = e.matches;
                    this.currentTheme.next(turnOn ? Themes.Default : Themes.Dark);

                    this.ref.tick();
                });
            } catch (errSafari) {
                // tslint:disable-next-line:no-console
                console.error(errSafari);
            }
        }
    }

    setTheme(value) {
        this.currentTheme.next(value);
    }

    getTheme() {
        return this.currentTheme.getValue();
    }
}
