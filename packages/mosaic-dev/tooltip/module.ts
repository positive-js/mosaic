import { A11yModule } from '@angular/cdk/a11y';
import { Component, NgModule, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { ArrowPlacements } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';


/* tslint:disable:no-trailing-whitespace */
@Component({
    selector: 'app',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html'
})
export class DemoComponent implements OnInit {

    @ViewChild('manualTooltip', { static: false }) manualTooltip: any;
    @ViewChild('tooltip', { static: false }) tooltip: any;
    @ViewChild('tooltipRef', { static: false }) tooltipRef: any;
    @ViewChild('titleSource') titleSource: any;
    @ViewChild('titleSourceTest') titleSourceTest: TemplateRef<any>;

    triggerTooltip: boolean = false;
    show: boolean = true;
    counter = 0;
    tooltipPosition: string = 'top';
    title: string = 'Default text';
    titleModel: string | TemplateRef<any> = '';
    availablePositions: string[] = ['top', 'bottom', 'left', 'right'];

    arrowPos = ArrowPlacements;

    get getTitle(): string | TemplateRef<any> {
        return this.titleModel;
    }

    ngOnInit(): void {
        this.counter = 0;
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

        this.titleModel = this.titleSourceTest;
    }

    updateTitle() {
        this.titleModel = this.titleSource.nativeElement.value;
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        A11yModule,
        FormsModule,
        McToolTipModule,
        McButtonModule,
        McInputModule,
        McFormFieldModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
