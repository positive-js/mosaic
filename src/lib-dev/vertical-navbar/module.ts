import { APP_BASE_HREF } from '@angular/common';
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@ptsecurity/mosaic/menu';

import { McButtonModule } from '../../lib/button';
import { McIconModule } from '../../lib/icon';
import { McVerticalNavbarModule } from '../../lib/vertical-navbar/';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class VerticalNavbarDemoComponent {
    expanded = true;
}


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
        MatMenuModule
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

