import { A11yModule } from '@angular/cdk/a11y';
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McPopoverModule } from '@ptsecurity/mosaic/popover';

import { McIconModule } from '../../mosaic/icon/';


/* tslint:disable:no-trailing-whitespace */
@Component({
    selector: 'app',
    styleUrls: ['./styles.css'],
    encapsulation: ViewEncapsulation.None,
    template: require('./template.html')
})
export class DemoComponent {
    popoverActiveStage: number;

    isPopoverVisibleLeft: boolean = false;

    constructor() {
        this.popoverActiveStage = 1;
    }

    changeStep(direction: number) {
        const newStage = this.popoverActiveStage + direction;

        // tslint:disable-next-line:no-magic-numbers
        if (newStage < 1 || newStage > 3) { return; }

        this.popoverActiveStage += direction;
    }

    changePopoverVisibilityLeft() {
        this.isPopoverVisibleLeft = !this.isPopoverVisibleLeft;
    }

    onPopoverVisibleChangeLeft(update: boolean) {
        this.isPopoverVisibleLeft = update;
    }
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        A11yModule,
        McPopoverModule,
        McButtonModule,
        McIconModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {
}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error)); // tslint:disable-line
