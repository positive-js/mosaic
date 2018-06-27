import { Component, NgModule, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McInputModule } from '../../lib/input/';


@Component({
    selector: 'app',
    template: require('./template.html'),
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./styles.scss']
})
export class InputDemoComponent {
    value: string = '';
    invalidValue: string = '';
}


@NgModule({
    declarations: [
        InputDemoComponent
    ],
    imports: [
        BrowserModule,
        McInputModule,
        FormsModule
    ],
    bootstrap: [
        InputDemoComponent
    ]
})
export class InputDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(InputDemoModule)
    .catch((error) => console.error(error));

