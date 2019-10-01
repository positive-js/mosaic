import { Component, Renderer2 } from '@angular/core';


@Component({
    selector: 'navbar',
    templateUrl: './navbar.template.html',
    styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
    // TODO fetch real data instead
    versions = [{number: '5.1', date: '15 октября', bold: true},
        {number: '5.0.1', date: '14 октября', bold: false},
        {number: '5', date: '13 октября', bold: true},
        {number: '4.8.8', date: '12 октября', bold: false},
        {number: '4.8.5', date: '11 октября', bold: false},
        {number: '4.8.4', date: '10 октября', bold: false},
        {number: '4.8', date: '9 октября', bold: true},
        {number: '4.7.1', date: '8 октября', bold: false},
        {number: '1.0', date: '7 октября', bold: true}];

    curVerIndex = this.versions[0].number;
    languages = ['Русский язык', 'Английский язык'];
    curLanguage = this.languages[0];
    themes = [
        {
            theme: 'default',
            name: 'Светлая тема',
            className: 'theme-default'
        },
        {
            theme: 'dark',
            name: 'Темная тема',
            className: 'theme-dark'
        }
    ];
    curTheme = this.themes[0];
    // TODO Эти значения временные, надо определиться с постоянными и заменить ими текущие значения.
    colors = [
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
        ];
    activeColor = this.colors[0];

    constructor(private renderer: Renderer2) {
        this.initTheme();
        this.initActiveColor();
    }

    setVersion(version) {
        this.curVerIndex = version;
    }

    setLanguage(language) {
        this.curLanguage = language;
    }

    setTheme(i) {
        this.curTheme = this.themes[i];
        localStorage.setItem('PT_theme', `${i}`);
        this.changeThemeOnBody();
    }

    setColor(i) {
        this.activeColor = this.colors[i];
        localStorage.setItem('PT_color', `${i}`);
        this.changeColorOnBody();

        this.colors.forEach((color) => { color.selected = false; });
        this.colors[i].selected = true;
    }

    initTheme() {
        const theme = localStorage.getItem('PT_theme');

        if (theme) {
            this.setTheme(theme);
        } else {
            localStorage.setItem('PT_theme', '0');
        }
    }

    initActiveColor() {
        const color = localStorage.getItem('PT_color');

        if (color) {
            this.setColor(color);
        } else {
            localStorage.setItem('PT_color', '0');
        }
    }

    private changeThemeOnBody() {

        if (this.curTheme) {
            for (const theme of this.themes) {
                this.renderer.removeClass(document.body, theme.className);
            }

            this.renderer.addClass(document.body, this.curTheme.className);
        }
    }

    private changeColorOnBody() {

        if (this.activeColor) {
            for (const color of this.colors) {
                this.renderer.removeClass(document.body, color.className);
            }

            this.renderer.addClass(document.body, this.activeColor.className);
        }
    }
}
