import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
export class ButtonDemoComponent {
    modelResult: any;
    disabled: boolean;
}


@NgModule({
    declarations: [
        ButtonDemoComponent
    ],
    imports: [
        BrowserModule,
        McButtonModule,
        McButtonToggleModule,
        McIconModule,
        FormsModule
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

