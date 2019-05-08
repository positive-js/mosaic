import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss']
})
export class DemoComponent {}


/* tslint:disable:max-classes-per-file */
@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule
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
