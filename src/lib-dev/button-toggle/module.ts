import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McButtonModule } from '../../lib/button';
import { McButtonToggleModule } from '../../lib/button-toggle';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonDemoComponent {}


@NgModule({
    declarations: [
        ButtonDemoComponent
    ],
    imports: [
        BrowserModule,
        McButtonModule,
        McButtonToggleModule,
        McIconModule
    ],
    bootstrap: [
        ButtonDemoComponent
    ]
})
export class ButtonDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(ButtonDemoModule)
    // tslint:disable-next-line:no-console
    .catch((error) => console.error(error));

