import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McRadioModule } from '../../lib/radio';


@Component({
    selector: 'app',
    template: `
        <mc-radio-group>
            <mc-radio-button value="1">Option 1</mc-radio-button>
            <mc-radio-button value="2">Option 2</mc-radio-button>
        </mc-radio-group>
        `
})
export class DemoComponent {}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        McRadioModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));
