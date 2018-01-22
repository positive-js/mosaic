import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McButtonModule } from '../../lib/components/button/';


@Component({
    selector: 'app',
    template: `
        <button mc-button color="primary"></button>
        <button mc-button color="accent"></button>`,
    styleUrls: ['./theme.scss']
})
export class ButtonDemoComponent {}


/* tslint:disable:max-classes-per-file */
@NgModule({
    declarations: [
        ButtonDemoComponent
    ],
    imports: [
        BrowserModule,
        McButtonModule
    ],
    bootstrap: [
        ButtonDemoComponent
    ]
})
export class ButtonDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(ButtonDemoModule)
    /* tslint:disable:no-console */
    .catch((error) => console.error(error));

