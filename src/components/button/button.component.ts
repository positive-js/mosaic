import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
    selector: 'mc-button',
    templateUrl: './button.component.html'
})
export class ButtonComponent {

    @Input() label: string = 'Test';

    @Output() onClick: EventEmitter<any> = new EventEmitter();

    public onClickEvent(event: any): void {
        this.onClick.emit(event);
    }

}
