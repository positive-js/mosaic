import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McButtonModule } from '../../lib/button';
import { McIconModule } from '../../lib/icon';
import { McListModule } from '../../lib/list';


@Component({
    selector: 'app',
    template: require('./template.html'),
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./styles.scss']
})
export class PanelDemoComponent {
    page: string = 'first';
    test: boolean = true;
    selectedItems = [];
    narwhalCategories = [];
}


@NgModule({
    declarations: [
        PanelDemoComponent
    ],
    imports: [
        CommonModule,
        BrowserModule,
        McButtonModule,
        McIconModule,
        McListModule,
        FormsModule
    ],
    bootstrap: [
        PanelDemoComponent
    ]
})
export class PanelDemoModule {}  // tslint:disable-line no-unnecessary-class

platformBrowserDynamic()
    .bootstrapModule(PanelDemoModule);

