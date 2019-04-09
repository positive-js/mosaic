import { Component, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'app',
    templateUrl: 'menu-demo.html',
    styleUrls: ['menu-demo.css'],
    encapsulation: ViewEncapsulation.None
})
export class MenuDemo {
    selected = '';
    items = [
        {text: 'Refresh'},
        {text: 'Settings'},
        {text: 'Help', disabled: true},
        {text: 'Sign Out'}
    ];

    iconItems = [
        {text: 'Redial', icon: 'dialpad'},
        {text: 'Check voicemail', icon: 'voicemail', disabled: true},
        {text: 'Disable alerts', icon: 'notifications_off'}
    ];

    select(text: string) {
        this.selected = text;
    }
}
