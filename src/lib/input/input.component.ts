import { Component, Directive, ElementRef, forwardRef, Input, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import { CanDisable, HasTabIndex, mixinDisabled, mixinTabIndex } from '@ptsecurity/mosaic/core';


const noop = () => {};

export const MC_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => McInput),
    multi: true
};

export class McInputBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McInputMixinBase =
    mixinTabIndex(mixinDisabled(McInputBase));

@Directive({
    selector: 'mc-input[mc-input-mono]',
    host: { class: 'mc-input_mono' }
})
export class McInputMono {}


@Component({
    selector: 'mc-input',
    templateUrl: 'input.component.html',
    styleUrls: ['./input.css'],
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.mc-input_disabled]': 'disabled',
        class: 'mc-input mc-input_costumier'
    },
    providers: [ MC_INPUT_CONTROL_VALUE_ACCESSOR ]
})
export class McInput extends _McInputMixinBase implements ControlValueAccessor, CanDisable, HasTabIndex {
    @Input()
    placeholder: string = '';

    @Input()
    disabled: boolean = false;

    @Input()
    type: string;

    @Input()
    cleaner: boolean = false;

    private innerValue: any = '';
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    constructor(elementRef: ElementRef, private _focusMonitor: FocusMonitor) {
        super(elementRef);

        this._focusMonitor.monitor(this._elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    }

    focus(): void {
        this.getHostElement().focus();
    }

    get value(): any {
        return this.innerValue;
    }

    set value(v: any) {
        if (v !== this.innerValue) {
            this.innerValue = v;
            this.onChangeCallback(v);
        }
    }

    get canShowCleaner() {
        return this.cleaner && !this.disabled && this.value;
    }

    onBlur() {
        this.onTouchedCallback();
    }

    writeValue(value: any) {
        if (value !== this.innerValue) {
            this.innerValue = value;
        }
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    clear() {
        this.value = '';
    }

    private getHostElement() {
        return this._elementRef.nativeElement;
    }
}
