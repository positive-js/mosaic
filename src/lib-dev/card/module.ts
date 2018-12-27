import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McCardModule } from '../../lib/card';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CardsDemoComponent {

    s1 = false;
    s2 = false;
    s3 = false;
    s4 = false;
}


@NgModule({
    declarations: [CardsDemoComponent],
    imports: [
        BrowserModule,
        McCardModule
    ],
    bootstrap: [CardsDemoComponent]
})
export class CardsDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(CardsDemoModule)
    // tslint:disable-next-line
    .catch((error) => console.error(error));

