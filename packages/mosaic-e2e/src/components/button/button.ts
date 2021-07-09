import { Component } from '@angular/core';


@Component({
    selector: 'mc-e2e-button',
    templateUrl: 'button.html'
})
export class McE2EButton {
    isDisabled = false;
    clickCounter = 0;
}
