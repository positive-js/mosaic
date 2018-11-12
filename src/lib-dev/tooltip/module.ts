import { Component, NgModule, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McListModule } from '@ptsecurity/mosaic/list';
import { McRadioModule } from '@ptsecurity/mosaic/radio';
import { McToolTipModule, McTooltip } from '@ptsecurity/mosaic/tooltip';


/* tslint:disable:no-trailing-whitespace */
@Component({
    selector: 'app',
    styleUrls: ['./styles.css'],
    encapsulation: ViewEncapsulation.None,
    template: require('./template.html')
})
export class DemoComponent {

    @ViewChild('manualTooltip') manualTooltip: McTooltip;

    trigger(e) {
        e.stopPropagation();
        if (this.manualTooltip.isTooltipOpen) {
            this.manualTooltip.hide();
        } else {
            this.manualTooltip.show();
        }
    }
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        McToolTipModule,
        McButtonModule,
        McRadioModule,
        McListModule,
        McInputModule
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
