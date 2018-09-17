import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McTabsModule } from '../../lib/tabs/';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TabsDemoComponent {
    onSelectionChanged(e) {
        console.log(e);
    }
}


@NgModule({
    declarations: [
        TabsDemoComponent
    ],
    imports: [
        BrowserModule,
        McTabsModule
    ],
    bootstrap: [
        TabsDemoComponent
    ]
})
export class TabsDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(TabsDemoModule)
    .catch((error) => console.error(error));

