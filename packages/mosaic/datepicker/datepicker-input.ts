// tslint:disable:no-empty
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Output
} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { DateAdapter, MC_DATE_FORMATS, McDateFormats } from '@ptsecurity/cdk/datetime';
import { DOWN_ARROW } from '@ptsecurity/cdk/keycodes';
import { MC_INPUT_VALUE_ACCESSOR } from '@ptsecurity/mosaic/input';
import { Subscription } from 'rxjs';

import { McDatepicker } from './datepicker';
import { createMissingDateImplError } from './datepicker-errors';


/** @docs-private */
export const MC_DATEPICKER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => McDatepickerInput),
    multi: true
};

/** @docs-private */
export const MC_DATEPICKER_VALIDATORS: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => McDatepickerInput),
    multi: true
};


/**
 * An event used for datepicker input and change events. We don't always have access to a native
 * input or change event because the event may have been triggered by the user clicking on the
 * calendar popup. For consistency, we always use McDatepickerInputEvent instead.
 */
export class McDatepickerInputEvent<D> {
    /** The new value for the target datepicker input. */
    value: D | null;

    constructor(
        /** Reference to the datepicker input component that emitted the event. */
        public target: McDatepickerInput<D>,
        /** Reference to the native input element associated with the datepicker input. */
        public targetElement: HTMLElement) {
        this.value = this.target.value;
    }
}


/** Directive used to connect an input to a McDatepicker. */
@Directive({
    selector: 'input[mcDatepicker]',
    exportAs: 'mcDatepickerInput',
    providers: [
        MC_DATEPICKER_VALUE_ACCESSOR,
        MC_DATEPICKER_VALIDATORS,
        { provide: MC_INPUT_VALUE_ACCESSOR, useExisting: McDatepickerInput }
    ],
    host: {
        '[attr.aria-haspopup]': 'true',
        '[attr.aria-owns]': '(datepicker?.opened && datepicker.id) || null',
        '[attr.min]': 'min ? dateAdapter.toIso8601(min) : null',
        '[attr.max]': 'max ? dateAdapter.toIso8601(max) : null',
        '[attr.disabled]': 'disabled || null',
        '(input)': 'onInput($event.target.value)',
        '(change)': 'onChange()',
        '(blur)': 'onBlur()',
        '(keydown)': 'onKeydown($event)'
    }
})
export class McDatepickerInput<D> implements ControlValueAccessor, OnDestroy, Validator {
    /** The datepicker that this input is associated with. */
    @Input()
    set mcDatepicker(value: McDatepicker<D>) {
        if (!value) {
            return;
        }

        this.datepicker = value;
        this.datepicker.registerInput(this);
        this.datepickerSubscription.unsubscribe();

        this.datepickerSubscription = this.datepicker.selectedChanged.subscribe((selected: D) => {
            this.value = selected;
            this.cvaOnChange(selected);
            this.onTouched();
            this.dateInput.emit(new McDatepickerInputEvent(this, this.elementRef.nativeElement));
            this.dateChange.emit(new McDatepickerInputEvent(this, this.elementRef.nativeElement));
        });
    }

    /** Function that can be used to filter out dates within the datepicker. */
    @Input()
    set mcDatepickerFilter(value: (date: D | null) => boolean) {
        this.dateFilter = value;
        this.validatorOnChange();
    }

    /** The value of the input. */
    @Input()
    get value(): D | null {
        return this._value;
    }

    set value(value: D | null) {
        // tslint:disable-next-line:no-parameter-reassignment
        value = this.dateAdapter.deserialize(value);
        this.lastValueValid = !value || this.dateAdapter.isValid(value);
        // tslint:disable-next-line:no-parameter-reassignment
        value = this.getValidDateOrNull(value);
        const oldDate = this.value;
        this._value = value;
        this.formatValue(value);

        if (!this.dateAdapter.sameDate(oldDate, value)) {
            this.valueChange.emit(value);
        }
    }

    /** The minimum valid date. */
    @Input()
    get min(): D | null {
        return this._min;
    }

    set min(value: D | null) {
        this._min = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
        this.validatorOnChange();
    }

    /** The maximum valid date. */
    @Input()
    get max(): D | null {
        return this._max;
    }

    set max(value: D | null) {
        this._max = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
        this.validatorOnChange();
    }

    /** Whether the datepicker-input is disabled. */
    @Input()
    get disabled(): boolean {
        return !!this._disabled;
    }

    set disabled(value: boolean) {
        const newValue = coerceBooleanProperty(value);
        const element = this.elementRef.nativeElement;

        if (this._disabled !== newValue) {
            this._disabled = newValue;
            this.disabledChange.emit(newValue);
        }

        // We need to null check the `blur` method, because it's undefined during SSR.
        if (newValue && element.blur) {
            // Normally, native input elements automatically blur if they turn disabled. This behavior
            // is problematic, because it would mean that it triggers another change detection cycle,
            // which then causes a changed after checked error if the input element was focused before.
            element.blur();
        }
    }

    datepicker: McDatepicker<D>;
    dateFilter: (date: D | null) => boolean;

    /** Emits when a `change` event is fired on this `<input>`. */
    @Output() readonly dateChange: EventEmitter<McDatepickerInputEvent<D>> =
        new EventEmitter<McDatepickerInputEvent<D>>();

    /** Emits when an `input` event is fired on this `<input>`. */
    @Output() readonly dateInput: EventEmitter<McDatepickerInputEvent<D>> =
        new EventEmitter<McDatepickerInputEvent<D>>();

    /** Emits when the value changes (either due to user input or programmatic change). */
    valueChange = new EventEmitter<D | null>();

    /** Emits when the disabled state has changed */
    disabledChange = new EventEmitter<boolean>();
    private _value: D | null;
    private _min: D | null;
    private _max: D | null;
    private _disabled: boolean;

    private datepickerSubscription = Subscription.EMPTY;

    private localeSubscription = Subscription.EMPTY;

    /** Whether the last value set on the input was valid. */
    private lastValueValid = false;

    /** The combined form control validator for this input. */
    private validator: ValidatorFn | null;

    constructor(
        public elementRef: ElementRef<HTMLInputElement>,
        @Optional() public dateAdapter: DateAdapter<D>,
        @Optional() @Inject(MC_DATE_FORMATS) private dateFormats: McDateFormats
    ) {
        this.validator = Validators.compose([
            this.parseValidator,
            this.minValidator,
            this.maxValidator,
            this.filterValidator
        ]);

        if (!this.dateAdapter) {
            throw createMissingDateImplError('DateAdapter');
        }

        if (!this.dateFormats) {
            throw createMissingDateImplError('MC_DATE_FORMATS');
        }

        // Update the displayed date when the locale changes.
        this.localeSubscription = dateAdapter.localeChanges.subscribe(() => {
            this.value = this.value;
        });
    }

    onTouched = () => {
    }

    ngOnDestroy() {
        this.datepickerSubscription.unsubscribe();
        this.localeSubscription.unsubscribe();
        this.valueChange.complete();
        this.disabledChange.complete();
    }

    /** @docs-private */
    registerOnValidatorChange(fn: () => void): void {
        this.validatorOnChange = fn;
    }

    /** @docs-private */
    validate(c: AbstractControl): ValidationErrors | null {
        return this.validator ? this.validator(c) : null;
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(value: D): void {
        this.value = value;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: any) => void): void {
        this.cvaOnChange = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onKeydown(event: KeyboardEvent) {
        // tslint:disable-next-line:deprecation
        const isAltDownArrow = event.altKey && event.keyCode === DOWN_ARROW;

        if (this.datepicker && isAltDownArrow && !this.elementRef.nativeElement.readOnly) {
            this.datepicker.open();
            event.preventDefault();
        }
    }

    onInput(value: string) {
        let date = this.dateAdapter.parse(value, this.dateFormats.parse.dateInput);
        this.lastValueValid = !date || this.dateAdapter.isValid(date);
        date = this.getValidDateOrNull(date);

        if (!this.dateAdapter.sameDate(date, this._value)) {
            this._value = date;
            this.cvaOnChange(date);
            this.valueChange.emit(date);
            this.dateInput.emit(new McDatepickerInputEvent(this, this.elementRef.nativeElement));
        }
    }

    onChange() {
        this.dateChange.emit(new McDatepickerInputEvent(this, this.elementRef.nativeElement));
    }

    /** Handles blur events on the input. */
    onBlur() {
        // Reformat the input only if we have a valid value.
        if (this.value) {
            this.formatValue(this.value);
        }

        this.onTouched();
    }

    private cvaOnChange: (value: any) => void = () => {
    }

    private validatorOnChange = () => {
    }

    /** The form control validator for whether the input parses. */
    private parseValidator: ValidatorFn = (): ValidationErrors | null => {
        return this.lastValueValid ?
            null : { mcDatepickerParse: { text: this.elementRef.nativeElement.value } };
    }

    /** The form control validator for the min date. */
    private minValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));

        return (!this.min || !controlValue ||
            this.dateAdapter.compareDate(this.min, controlValue) <= 0) ?
            null : { mcDatepickerMin: { min: this.min, actual: controlValue } };
    }

    /** The form control validator for the max date. */
    private maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));

        return (!this.max || !controlValue ||
            this.dateAdapter.compareDate(this.max, controlValue) >= 0) ?
            null : { mcDatepickerMax: { max: this.max, actual: controlValue } };
    }

    /** The form control validator for the date filter. */
    private filterValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));

        return !this.dateFilter || !controlValue || this.dateFilter(controlValue) ?
            null : { mcDatepickerFilter: true };
    }

    /** Formats a value and sets it on the input element. */
    private formatValue(value: D | null) {
        this.elementRef.nativeElement.value =
            value ? this.dateAdapter.format(value, this.dateFormats.display.dateInput) : '';
    }

    /**
     * @param obj The object to check.
     * @returns The given object if it is both a date instance and valid, otherwise null.
     */
    private getValidDateOrNull(obj: any): D | null {
        return (this.dateAdapter.isDateInstance(obj) && this.dateAdapter.isValid(obj)) ? obj : null;
    }
}
