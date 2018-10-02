import { Component, EventEmitter, Output } from '@angular/core';


export const BIG_STEP = 10;
export const SMALL_STEP = 1;

@Component({
    selector: 'mc-stepper',
    template: `
        <i class="mc mc-icon mc-angle-S_16 mc-icon-rotate_180" (click)="stepUp.emit()"></i>
        <i class="mc mc-icon mc-angle-S_16" (click)="stepDown.emit()"></i>
    `
})
export class McStepper {
    @Output()
    readonly stepUp: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    readonly stepDown: EventEmitter<void> = new EventEmitter<void>();
}
