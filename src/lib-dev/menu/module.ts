import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McDividerModule } from '@ptsecurity/mosaic/divider';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { MatMenuModule } from '@ptsecurity/mosaic/menu';

import { MenuDemo } from './menu-demo';


@NgModule({
    declarations: [
        MenuDemo
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([
            {path: 'dummy', children: []},
            {path: 'gummy', children: []}
        ]),
        McButtonModule,
        McIconModule,
        McDividerModule,
        MatMenuModule
    ],
    bootstrap: [
        MenuDemo
    ],
    providers: [
        {provide: APP_BASE_HREF, useValue : '/' }
    ]
})
export class MenuDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(MenuDemoModule)
    .catch((error) => console.error(error));
