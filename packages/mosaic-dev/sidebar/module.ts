/* tslint:disable:no-console */
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McSidebarModule, SidebarPositions } from '@ptsecurity/mosaic/sidebar';
import { Direction, McSplitterModule } from '@ptsecurity/mosaic/splitter';

import { McButtonModule } from '../../mosaic/button';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    direction = Direction;
    sidebarPositions = SidebarPositions;

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
