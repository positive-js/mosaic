import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
    selector: 'mc-button',
    template: require('./button.component.html')
})
export class ButtonComponent {

    @Input() label: string = 'Default text';

    @Output() onClick: EventEmitter<any> = new EventEmitter();

    public onClickEvent(event: any): void {
        this.onClick.emit(event);
    }

}
