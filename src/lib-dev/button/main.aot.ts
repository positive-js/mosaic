import '../../lib/polyfills';

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ButtonModule } from '../../lib/components/button/button.module';

@Component({
    selector: 'button-demo',
    template: `<div><mc-button></mc-button></div>`
})
export class ButtonDemoComponent {}

@NgModule({
    declarations: [
        ButtonDemoComponent
    ],
    imports: [
        BrowserModule,
        ButtonModule
    ],
    bootstrap: [
        ButtonDemoComponent
    ]
})
export class ButtonDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(ButtonDemoModule)
    .catch((error) => console.error(error));
