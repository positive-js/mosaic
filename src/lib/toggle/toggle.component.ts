// tslint:disable:no-empty
import { Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


@Component({
    selector: 'mc-toggle',
    exportAs: 'mcToggle',
    templateUrl: './toggle.component.html',
    styleUrls: ['./toggle.css'],
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: McToggleComponent, multi: true}
    ]
})
export class McToggleComponent implements ControlValueAccessor {
    private _value: boolean = true;

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
