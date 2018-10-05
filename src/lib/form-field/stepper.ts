import { Component, EventEmitter, Output } from '@angular/core';


@Component({
    selector: 'mc-stepper',
    template: `
        <i class="mc mc-icon mc-angle-S_16 mc-icon-rotate_180" (mousedown)="onStepUp($event)"></i>
        <i class="mc mc-icon mc-angle-S_16" (mousedown)="onStepDown($event)"></i>
    `
})
export class McStepper {
    @Output()
    readonly stepUp: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    readonly stepDown: EventEmitter<void> = new EventEmitter<void>();

    onStepUp($event: MouseEvent) {
        this.stepUp.emit();
        $event.preventDefault();
    }

    onStepDown($event: MouseEvent) {
        this.stepDown.emit();
        $event.preventDefault();
    }
}
