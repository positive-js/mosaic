import { Component, EventEmitter, Output } from '@angular/core';


@Component({
    selector: 'mc-stepper',
    template: `
        <i class="mc mc-stepper-step-up mc-icon mc-angle-L_16 mc-icon-flip-h" (mousedown)="onStepUp($event)"></i>
        <i class="mc mc-stepper-step-down mc-icon mc-angle-L_16" (mousedown)="onStepDown($event)"></i>
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
