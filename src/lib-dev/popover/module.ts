import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McPopoverModule } from '@ptsecurity/mosaic/popover';


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

    constructor() {}

    changeStep(direction: number) {
        this.popoverActiveStage += direction;
    }

    changePopoverVisibility() {
        this.isPopoverVisible = !this.isPopoverVisible;
        this.popoverActiveStage = 1;
    }

    onPopoverVisibleChange(visibility: boolean) {
        if (!visibility) {
            this.isPopoverVisible = false;
        }
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
