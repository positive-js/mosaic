import { A11yModule } from '@angular/cdk/a11y';
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McFormsModule, PopUpPlacements, PopUpSizes, ThemePalette } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McPopoverModule } from '@ptsecurity/mosaic/popover';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McSplitterModule } from '@ptsecurity/mosaic/splitter';

import { McIconModule } from '../../mosaic/icon/';


/* tslint:disable:no-trailing-whitespace */
@Component({
    selector: 'app',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html'
})
export class DemoComponent {
    themePalette = ThemePalette;
    popUpPlacements = PopUpPlacements;

    popoverActiveStage: number;
    selectedOrder: boolean;

    isPopoverVisibleLeft: boolean = false;

    activatedPosition: string = '';

    ELEMENTS = {
        BUTTON: 'button',
        CONFIRM_BUTTON: 'confirm-button',
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

    selectedElement: string = this.ELEMENTS.BUTTON;
    selectedPlacement: PopUpPlacements = PopUpPlacements.Left;
    selectedTrigger: string = this.TRIGGERS.CLICK;
    selectedSize: PopUpSizes = PopUpSizes.Normal;
    layoutClass: string = 'layout-row layout-align-center-center';
    content: string = 'button text';
    userDefinedPlacementPriority: string[] = ['bottom', 'right'];
    multipleSelected: string[] = [];

    confirmText: string = 'Вы уверены, что хотите продолжить?';
    confirmButtonText: string = 'Да';

    constructor() {
        this.popoverActiveStage = 1;
    }

    changeStep(direction: number) {
        const newStage = this.popoverActiveStage + direction;

        // tslint:disable-next-line:no-magic-numbers
        if (newStage < 1 || newStage > 3) { return; }

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

    setPlacement(placement: PopUpPlacements) {
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

    getOrder(forElement: string) {
        if (forElement === 'config') {
            return this.selectedOrder ? { order: 2 } : { order: 1 };
        }
        if (forElement === 'result') {
            return this.selectedOrder ? { order: 1 } : { order: 2 };
        }
    }

    get isFallbackActivated(): boolean {
        return this.selectedPlacement !== this.activatedPosition && this.activatedPosition !== '';
    }

    onConfirm() {
        alert('confirmed');
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserAnimationsModule,
        A11yModule,
        FormsModule,
        McFormsModule,
        McFormFieldModule,
        McSelectModule,
        McPopoverModule,
        McButtonModule,
        McIconModule,
        McInputModule,
        McSplitterModule,
        McCheckboxModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
