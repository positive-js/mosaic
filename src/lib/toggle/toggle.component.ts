// tslint:disable:no-empty
import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CanColor, CanColorCtor, mixinColor } from '@ptsecurity/mosaic/core';


export class McToggleBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McToggleMixinBase: CanColorCtor & typeof McToggleBase
    = mixinColor(McToggleBase);

@Component({
    selector: 'mc-toggle',
    exportAs: 'mcToggle',
    template: `
        <div class='mc-toggle__capsule'>
            <div class='mc-toggle__circle'></div>
        </div>
    `,
    styleUrls: ['./toggle.css'],
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: McToggleComponent, multi: true}
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'color'],
    host: {
        '[class.mc-toggle-off]': '!value'
    }
})
export class McToggleComponent extends _McToggleMixinBase implements ControlValueAccessor, CanColor {
    private _value: boolean = false;
    get value() {
        return this._value;
    }

    constructor(public _elementRef: ElementRef) {
        super(_elementRef);
    }

    writeValue(value: boolean) {
        if (value !== this._value) {
            this._value = value;
        }
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    private onTouchedCallback = () => {};

    private onChangeCallback = (_: any) => {};
}
