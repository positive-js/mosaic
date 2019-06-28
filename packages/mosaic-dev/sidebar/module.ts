/* tslint:disable:no-console */
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McSidebarModule } from '@ptsecurity/mosaic/sidebar';
import { McSplitterModule } from '@ptsecurity/mosaic/splitter';

import { McButtonModule } from '../../mosaic/button';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    leftSidebarSidebarState: boolean = false;
    leftSplitterState: boolean = false;

    rightSidebarSidebarState: boolean = false;

    onStateChanged($event): void {
        console.log('onStateChanged: ', $event);
    }

    toggleLeftSidebar() {
        this.leftSidebarSidebarState = !this.leftSidebarSidebarState;
    }

    toggleRightSidebar() {
        this.rightSidebarSidebarState = !this.rightSidebarSidebarState;
    }

    toggleLeftSplitterState() {
        this.leftSplitterState = !this.leftSplitterState;
    }
}


@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        McSplitterModule,
        McButtonModule,
        McSidebarModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));

