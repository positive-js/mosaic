import {
    ChangeDetectionStrategy,
    Component, Directive, ElementRef, Input, Renderer2, ViewEncapsulation
} from '@angular/core';

import { toBoolean } from '../core/utils/utils';


@Directive({
    selector: 'button[mc-button], a[mc-button]',
    host: { class: 'mc-button' }
})
export class McButtonStyler {}

/* tslint:disable:max-classes-per-file */
@Component({
    selector: 'button[mc-button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[disabled]': 'disabled || null',
    }
})
export class McButton {

    @Input()
    get color(): string { return this._color; }
    set color(value: string) { this._updateColor(value); }

    @Input()
    public label: string = 'Default text 2';

    @Input()
    get disabled(): boolean { return this._disabled; }
    set disabled(value) { this._disabled = toBoolean(value); }

    private _disabled: boolean = false;
    private _color: string;

    constructor(
        private _elementRef: ElementRef,
        private _renderer: Renderer2) {}

    _updateColor(newColor: string) {
        this._setElementColor(this._color, false);
        this._setElementColor(newColor, true);
        this._color = newColor;
    }

    _setElementColor(color: string, isAdd: boolean) {
        if (color != null && color !== '') {
            if (isAdd) {
                this._renderer.addClass(this._getHostElement(), `mc-${color}`);
            } else {
                this._renderer.removeClass(this._getHostElement(), `mc-${color}`);
            }
        }
    }

    _getHostElement() {
        return this._elementRef.nativeElement;
    }
}
