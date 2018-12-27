import { Component, NgModule, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McFormFieldModule} from '@ptsecurity/mosaic/form-field';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McListModule } from '@ptsecurity/mosaic/list';
import { McRadioModule } from '@ptsecurity/mosaic/radio';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';


/* tslint:disable:no-trailing-whitespace */
@Component({
    selector: 'app',
    styleUrls: ['./styles.css'],
    encapsulation: ViewEncapsulation.None,
    template: require('./template.html')
})
export class DemoComponent {

    @ViewChild('manualTooltip') manualTooltip: any;
    @ViewChild('tooltip') tooltip: any;
    @ViewChild('tooltipRef') tooltipRef: any;

    triggerTooltip: boolean = false;
    tooltipPosition: string = 'left';
    title: string = 'Default text';
    constructor(){}

    toggleTooltip() {
        if (!this.tooltip.isTooltipOpen) {
            this.tooltip.show();
        } else {
            this.tooltip.hide();
        }
    }

    toggleTooltipExternal(flag) {
        if (!flag) {
            this.tooltipRef.show();
        } else {
            this.tooltipRef.hide();
        }
    }

    trigger(e) {
        e.stopPropagation();
        if (this.manualTooltip.isTooltipOpen) {
            this.manualTooltip.hide();
        } else {
            this.manualTooltip.show();
        }
    }

    updatePosition(pos: string) {
        this.tooltipPosition = pos;
    }
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        McToolTipModule,
        McButtonModule,
        McRadioModule,
        McListModule,
        McInputModule,
        McFormFieldModule
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
