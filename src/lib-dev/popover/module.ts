import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McPopoverModule } from '@ptsecurity/mosaic/popover';


//
// FIXME: Удалить этот пример
//


/* tslint:disable:no-trailing-whitespace */
@Component({
    selector: 'app',
    styleUrls: ['./styles.css'],
    encapsulation: ViewEncapsulation.None,
    template: require('./template.html')
})
export class DemoComponent {
    private isPopoverVisible: boolean = false;
    private popoverActiveStage: number = 1;
    private isRedPillDisabled: boolean = false;
    private motivationCounter: number = 0;

    constructor() {}

    changePopoverVisibility() {
        this.isPopoverVisible = !this.isPopoverVisible;
        this.popoverActiveStage = 1;
        this.isRedPillDisabled = false;
        this.motivationCounter = 0;
    }

    onBlueClick() {
        this.popoverActiveStage = 2;
    }

    onRedClick() {
        if (this.motivationCounter > 15) {
            this.popoverActiveStage = 3;
        }

        this.motivationCounter += 1;
    }

    disableRedPill(isDisabled: boolean = false) {
        this.isRedPillDisabled = isDisabled;
    }

    get motivation() {
        return this.motivationCounter ? `(${this.motivationCounter})` : ``;
    }
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        McPopoverModule,
        McButtonModule
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
