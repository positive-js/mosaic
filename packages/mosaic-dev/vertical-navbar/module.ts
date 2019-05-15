import { APP_BASE_HREF } from '@angular/common';
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';

import { McButtonModule } from '../../mosaic/button';
import { McIconModule } from '../../mosaic/icon';
import { McVerticalNavbarModule } from '../../mosaic/vertical-navbar/';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class VerticalNavbarDemoComponent {}


@NgModule({
    declarations: [
        VerticalNavbarDemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([
            {path: 'dummy', children: []},
            {path: 'gummy', children: []}
        ]),
        McVerticalNavbarModule,
        McButtonModule,
        McIconModule,
        McDropdownModule
    ],
    bootstrap: [
        VerticalNavbarDemoComponent
    ],
    providers: [
        {provide: APP_BASE_HREF, useValue : '/' }
    ]
})
export class NavbarDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(NavbarDemoModule)
    .catch((error) => console.error(error));

