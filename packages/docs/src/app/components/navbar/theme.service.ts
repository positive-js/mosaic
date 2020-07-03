import { Injectable, ApplicationRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export enum Themes {
  Default = 'theme-default',
  Dark = 'theme-dark'
}

@Injectable({
    providedIn: 'root'
})

export class ThemeService {
  currentTheme = new BehaviorSubject(Themes.Default);

  constructor(private ref: ApplicationRef) {
    const isLightTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

    isLightTheme ? this.currentTheme.next(Themes.Default) : this.currentTheme.next(Themes.Dark);

    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      const turnOn = e.matches;
      this.currentTheme.next(turnOn ? Themes.Default : Themes.Dark);

      this.ref.tick();
    });
  }

  setTheme(value) {
    this.currentTheme.next(value);
  }

  getTheme() {
    return this.currentTheme.getValue();
  }
}
