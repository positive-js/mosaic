import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements, PopUpSizes } from '@ptsecurity/mosaic/core';


/**
 * @title Basic popover
 */
@Component({
    selector: 'popover-overview-example',
    templateUrl: 'popover-overview-example.html',
    styleUrls: ['popover-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class PopoverOverviewExample {
    popUpPlacements = PopUpPlacements;
    popoverActiveStage: number;
    selectedOrder: boolean;

    isPopoverVisibleLeft: boolean = false;

    activatedPosition: string = '';

    ELEMENTS = {
        BUTTON: 'button',
        INPUT: 'input',
        ICON: 'icon'
    };

    SIZE = {
        LARGE: 'large',
        NORMAL: 'normal',
        SMALL: 'small'
    };

    selectedElement: string = 'button';
    selectedPlacement: PopUpPlacements = PopUpPlacements.Left;
    selectedSize: PopUpSizes = PopUpSizes.Normal;
    layoutClass: string = 'layout-row layout-align-center-center';
    content: string = 'button text';
    userDefinedPlacementPriority: string[] = ['bottom', 'right'];
    multipleSelected: string[] = [];

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
}
