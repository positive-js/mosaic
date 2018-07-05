import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McCheckboxModule } from '../../lib/checkbox';


/* tslint:disable:no-trailing-whitespace */
@Component({
    selector: 'app',
    styleUrls: ['./styles.css'],
    encapsulation: ViewEncapsulation.None,
    template: require('./template.html')
})
export class DemoComponent {
    checked: boolean[] = [true, true, false];
    indeterminate: boolean = true;
    disabled: boolean = false;
    labelPosition = 'after';

    onCheckboxChange(val) {
        console.log('onCheckboxChange', val);
    }
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        McCheckboxModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {
}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));
