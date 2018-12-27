import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McIconModule } from '../../lib/icon';
import { McLinkModule } from '../../lib/link';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {}


/* tslint:disable:max-classes-per-file */
@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        McLinkModule,
        McIconModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    /* tslint:disable:no-console */
    .catch((error) => console.error(error));
