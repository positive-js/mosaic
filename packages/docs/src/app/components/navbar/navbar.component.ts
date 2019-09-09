import { Component } from '@angular/core';


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
    themes = ['Светлая тема', 'Темная тема'];
    curTheme = this.themes[0];
    // TODO Эти значения временные, надо определиться с постоянными и заменить ими текущие значения.
    colors = ['#2f80ed', '#333491', '#07804e', '#eaaf00'];
    activeColor = '#2f80ed';

    iconFont = '20px';

    setVersion(version) {
        this.curVerIndex = version;
    }

    setLanguage(language) {
        this.curLanguage = language;
    }

    setTheme(i) {
        this.curTheme = this.themes[i];
    }

    setColor(i) {
        this.activeColor = this.colors[i];
    }

}
