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

import { McButtonModule } from '../../mosaic/button';
import { McIconModule } from '../../mosaic/icon';
import { McLinkModule } from '../../mosaic/link';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('hideShowAnimator', [
            state('true' , style({ opacity: 1, display: '' })),
            state('false', style({ opacity: 0, display: 'none' })),
            transition('false => true', animate('.5s')),
            transition('true => false', animate('.2s'))
        ])
    ]
})
export class DemoComponent {
    // tslint:disable-next-line:no-magic-numbers
    readonly shownAlerts: number[]  = Array.from(Array(16).keys());

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
        McButtonModule,
        McLinkModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));
