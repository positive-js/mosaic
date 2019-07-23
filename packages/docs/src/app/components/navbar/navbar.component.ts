import { Component } from '@angular/core';


@Component({
    selector: 'navbar',
    templateUrl: './navbar.template.html',
    styleUrls: ['./navbar.scss']
})

export class NavbarComponent {

    versions = ["5.1", "5.0.1", "5", "4.8.8", "4.8.5", "4.8.4", "4.8", "4.7.1", "1.0" ];
    curVerIndex = this.versions[0];

    languages = ["Русский язык", "Английский язык"];
    curLanguage = this.languages[0];

    themes = ["Светлая тема", "Темная тема"];
    curTheme = this.themes[0];

    colors = ["#2f80ed", "#333491", "#07804e", "#eaaf00"];
    activeColor = "#2f80ed";

    setVersion(version) {
        this.curVerIndex = version;
    }

    setLanguage(language) {
        this.curLanguage = language;
    }

    setTheme(i) {
        this.curTheme = this.themes[i];
        this.activeColor = this.colors[i]
    }

}
