// tslint:disable:no-console
import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McButtonModule } from '../../lib/button';
import { McIconModule } from '../../lib/icon';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('hideShowAnimator', [
            state('true' , style({ opacity: 1, display: '' })),
            state('false', style({ opacity: 0, display: 'none' })),
            transition('false => true', animate('.9s')),
            transition('true => false', animate('.5s'))
        ])
    ]
})
export class DemoComponent {
    // tslint:disable-next-line:no-magic-numbers
    readonly shownAlerts: number[]  = Array.from(Array(13).keys());

    isAlertShown(id: number) {
        return this.shownAlerts.indexOf(id) !== -1;
    }

    hideAlert(id: number) {
        const index = this.shownAlerts.findIndex((alertId) => alertId === id);
        this.shownAlerts.splice(index, 1);
    }
}


@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        McIconModule,
        McButtonModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));
