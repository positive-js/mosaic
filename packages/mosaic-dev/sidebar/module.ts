/* tslint:disable:no-console */
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McSidebarModule } from '@ptsecurity/mosaic/sidebar';

import { McButtonModule } from '../../mosaic/button';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    leftSidebarParams: any;
    rightSidebarParams: any;

    leftSidebarSidebarState: boolean = false;
    rightSidebarSidebarState: boolean = false;

    onStateChanged($event): void {
        console.log('onStateChanged: ', $event);
    }

    setParamsInLeftSidebar() {
        this.leftSidebarParams = { openedStateWidth: '500px', closedStateWidth: '50px' };
    }

    setParamsInRightSidebar() {
        this.rightSidebarParams = { openedStateWidth: '500px', closedStateWidth: '50px' };
    }

    toggleLeftSidebar() {
        this.leftSidebarSidebarState = !this.leftSidebarSidebarState;
    }

    toggleRightSidebar() {
        this.rightSidebarSidebarState = !this.rightSidebarSidebarState;
    }
}


@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        McButtonModule,
        McSidebarModule,
        McIconModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));

