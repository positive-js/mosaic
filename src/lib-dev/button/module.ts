import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McButtonModule } from '../../lib/button/';


@Component({
    selector: 'app',
    template: `
        <button mc-button></button>
        <button mc-button disabled>Default</button>
        <button mc-button color="primary">primary</button>
        <button mc-button color="accent">accent</button>`,
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
    .catch((error) => console.error(error));

