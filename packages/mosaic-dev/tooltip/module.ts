import { A11yModule } from '@angular/cdk/a11y';
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';


/* tslint:disable:no-trailing-whitespace */
@Component({
    selector: 'app',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html'
})
export class DemoComponent {
    popoverActiveStage: number;

    isPopoverVisibleLeft: boolean = false;

    activatedPosition: string = '';

    ELEMENTS = {
        BUTTON: 'button',
        INPUT: 'input',
        ICON: 'icon'
    };

    TRIGGERS = {
        CLICK: 'click',
        FOCUS: 'focus',
        HOVER: 'hover'
    };

    SIZE = {
        LARGE: 'large',
        NORMAL: 'normal',
        SMALL: 'small'
    };

    selectedElement: string = 'button';
    selectedPlacement: string = 'left';
    selectedTrigger: string = 'hover';
    layoutClass: string = 'layout-align-center-center';
    content: string = 'button text';
    userDefinedPlacementPriority: string[] = ['bottom', 'right'];
    multipleSelected: string[] = [];

    constructor() {
        this.popoverActiveStage = 1;
    }

    changeStep(direction: number) {
        const newStage = this.popoverActiveStage + direction;

        // tslint:disable-next-line:no-magic-numbers
        if (newStage < 1 || newStage > 3) {
            return;
        }

        this.popoverActiveStage += direction;
    }

    onPopoverVisibleChange($event) {
        if (!$event) {
            this.activatedPosition = '';
        }
    }

    onStrategyPlacementChange(event) {
        this.activatedPosition = event;
    }

    setPlacement(placement: string) {
        this.selectedPlacement = placement;
    }

    showElement(): string {
        return this.selectedElement;
    }

    activated(value: string): boolean {
        return this.selectedPlacement === value;
    }

    isActual(value: string): boolean {
        return this.activatedPosition === value && this.selectedPlacement !== this.activatedPosition;
    }

    get isFallbackActivated(): boolean {
        return this.selectedPlacement !== this.activatedPosition && this.activatedPosition !== '';
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
        McFormFieldModule,
        McCheckboxModule,
        McSelectModule,
        McIconModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {
}
