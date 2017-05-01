import {
    Attribute,
    ChangeDetectionStrategy,
    Component, ElementRef, Input, Renderer2, ViewEncapsulation
} from '@angular/core';
import { toBoolean } from '../../core/utils/utils';


@Component({
    selector: 'mc-button, button[mc-button]',
    template: require('./button.component.html'),
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ButtonComponent {

    @Input()
    public label: string = 'Default text 2';

    @Input()
    get disabled(): boolean { return this._disabled; }
    set disabled(value) { this._disabled = toBoolean(value); }

    private _elementRef: ElementRef;
    private _renderer: Renderer2;
    private _disabled: boolean = false;

    constructor(@Attribute('mc-button') mcButton: string) {

    }
}
