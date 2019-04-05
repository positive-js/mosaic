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
export class ButtonToggleDemoComponent {
    modelResult: any;
    disabled: boolean;
}


@NgModule({
    declarations: [
        ButtonToggleDemoComponent
    ],
    imports: [
        BrowserModule,
        McButtonModule,
        McButtonToggleModule,
        McIconModule,
        FormsModule
    ],
    bootstrap: [
        ButtonToggleDemoComponent
    ]
})
export class ButtonToggleDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(ButtonToggleDemoModule)
    // tslint:disable-next-line:no-console
    .catch((error) => console.error(error));

