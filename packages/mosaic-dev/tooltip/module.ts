import { Component, NgModule, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McListModule } from '@ptsecurity/mosaic/list';
import { McRadioModule } from '@ptsecurity/mosaic/radio';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';


/* tslint:disable:no-trailing-whitespace */
@Component({
    selector: 'app',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html'
})
export class DemoComponent implements OnInit {

    @ViewChild('manualTooltip', {static: false}) manualTooltip: any;
    @ViewChild('tooltip', {static: false}) tooltip: any;
    @ViewChild('tooltipRef', {static: false}) tooltipRef: any;
    @ViewChild('titleSource') titleSource: any;

    triggerTooltip: boolean = false;
    show: boolean = true;
    counter = 0;
    tooltipPosition: string = 'left';
    title: string = 'Default text';
    titleModel: string = '';
    availablePositions: string[] = ['top', 'bottom', 'left', 'right'];

    get getTitle(): string {
        return this.titleModel;
    }
    ngOnInit(): void {
        this.counter = 0;
        setInterval(() => {
            this.counter += 1;
            this.titleModel = this.counter.toString();
        }, 1000);
    }

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
        if (this.availablePositions.indexOf(pos) > -1) {
            this.tooltipPosition = pos;
        }
    }

    updateTitle() {
        this.show = !this.show;
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
