import { Component, EventEmitter, Output } from '@angular/core';


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
