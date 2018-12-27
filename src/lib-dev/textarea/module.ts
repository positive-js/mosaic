import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { McTextareaModule } from '@ptsecurity/mosaic/textarea';

import { McFormFieldModule } from '../../lib/form-field';


@Component({
    selector: 'app',
    template: require('./template.html'),
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./styles.scss']
})
export class DemoComponent {
    value: string;
}


@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        McTextareaModule,
        McFormFieldModule,
        FormsModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}

// tslint:disable:no-console
platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));

