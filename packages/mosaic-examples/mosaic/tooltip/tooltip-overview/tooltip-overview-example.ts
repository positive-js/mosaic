import { Component, ViewEncapsulation } from '@angular/core';


/**
 * @title Basic tooltip
 */
@Component({
    selector: 'tooltip-overview-example',
    templateUrl: 'tooltip-overview-example.html',
    styleUrls: ['tooltip-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TooltipOverviewExample {
    tooltipActiveStage: number;
    selectedOrder: boolean;

    isPopoverVisibleLeft: boolean = false;

    activatedPosition: string = '';

    ELEMENTS = {
        BUTTON: 'button',
        INPUT: 'input',
        ICON: 'icon',
        WARNING: 'warning',
        EXTENDED: 'extended'
    };

    TRIGGERS = {
        CLICK: 'click',
        FOCUS: 'focus',
        HOVER: 'hover'
    };

    selectedElement: string = 'button';
    selectedPlacement: string = 'left';
    selectedTrigger: string = 'click';
    layoutClass: string = 'layout-row layout-align-center-center';
    content: string = 'button text';
    userDefinedPlacementPriority: string[] = ['bottom', 'right'];
    multipleSelected: string[] = [];

    constructor() {
        this.tooltipActiveStage = 1;
    }

    changeStep(direction: number) {
        const newStage = this.tooltipActiveStage + direction;

        // tslint:disable-next-line:no-magic-numbers
        if (newStage < 1 || newStage > 3) { return; }

        this.tooltipActiveStage += direction;
    }

    onTooltipVisibleChange($event) {
        if (!$event) {
            this.activatedPosition = '';
        }
    }

    onPlacementChange(event) {
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
