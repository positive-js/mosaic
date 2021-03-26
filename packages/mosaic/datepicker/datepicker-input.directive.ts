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
import {
    BACKSPACE,
    DELETE,
    DOWN_ARROW, END,
    hasModifierKey, HOME,
    isHorizontalMovement,
    isLetterKey,
    isVerticalMovement, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, SPACE, UP_ARROW
} from '@ptsecurity/cdk/keycodes';
import { McFormFieldControl } from '@ptsecurity/mosaic/form-field';
import { noop, Subject, Subscription } from 'rxjs';

import { createMissingDateImplError } from './datepicker-errors';
import { McDatepicker } from './datepicker.component';


// tslint:disable:naming-convention
export enum DateParts {
    year,
    month,
    date
}

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
        public targetElement: HTMLElement
    ) {
        this.value = this.target.value;
    }
}

let uniqueComponentIdSuffix: number = 0;


/** Directive used to connect an input to a McDatepicker. */
@Directive({
    selector: 'input[mcDatepicker]',
    exportAs: 'mcDatepickerInput',
    providers: [
        MC_DATEPICKER_VALUE_ACCESSOR,
        MC_DATEPICKER_VALIDATORS,
        { provide: McFormFieldControl, useExisting: McDatepickerInput }
    ],
    host: {
        class: 'mc-input mc-datepicker',
        '[attr.placeholder]': 'placeholder',
        '[attr.required]': 'required',
        '[attr.disabled]': 'disabled || null',
        '[attr.min]': 'min ? dateAdapter.toIso8601(min) : null',
        '[attr.max]': 'max ? dateAdapter.toIso8601(max) : null',
        '[attr.size]': 'getSize()',
        '[attr.autocomplete]': '"off"',

        // '(input)': 'onInput($event.target.value)',
        '(paste)': 'onPaste($event)',
        '(change)': 'onChange()',

        '(focus)': 'focusChanged(true)',
        '(blur)': 'onBlur()',

        '(keydown)': 'onKeyDown($event)'
    }
})
export class McDatepickerInput<D> implements McFormFieldControl<D>, ControlValueAccessor, Validator, OnDestroy {
    readonly stateChanges: Subject<void> = new Subject<void>();

    readonly errorState: boolean;

    controlType: string = 'datepicker';

    focused: boolean = false;

    datepicker: McDatepicker<D>;

    dateFilter: (date: D | null) => boolean;

    /** Emits when the value changes (either due to user input or programmatic change). */
    valueChange = new EventEmitter<D | null>();

    /** Emits when the disabled state has changed */
    disabledChange = new EventEmitter<boolean>();

    @Input() placeholder: string;

    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = coerceBooleanProperty(value);
    }

    private _required: boolean;

    /** The datepicker that this input is associated with. */
    @Input()
    set mcDatepicker(value: McDatepicker<D>) {
        if (!value) { return; }

        this.datepicker = value;
        this.datepicker.registerInput(this);
        this.datepickerSubscription.unsubscribe();

        this.datepickerSubscription = this.datepicker.selectedChanged
            .subscribe((selected: D) => {
                this.value = selected;
                this.cvaOnChange(selected);
                this.onTouched();
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

    private _value: D | null;

    /** The minimum valid date. */
    @Input()
    get min(): D | null {
        return this._min;
    }

    set min(value: D | null) {
        this._min = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
        this.validatorOnChange();
    }

    private _min: D | null;

    /** The maximum valid date. */
    @Input()
    get max(): D | null {
        return this._max;
    }

    set max(value: D | null) {
        this._max = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
        this.validatorOnChange();
    }

    private _max: D | null;

    /** Whether the datepicker-input is disabled. */
    @Input()
    get disabled(): boolean {
        return this._disabled;
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

    private _disabled: boolean;

    @Input()
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value || this.uid;
    }

    private _id: string;

    /** Emits when a `change` event is fired on this `<input>`. */
    @Output() readonly dateChange: EventEmitter<McDatepickerInputEvent<D>> =
        new EventEmitter<McDatepickerInputEvent<D>>();

    /** Emits when an `input` event is fired on this `<input>`. */
    @Output() readonly dateInput: EventEmitter<McDatepickerInputEvent<D>> =
        new EventEmitter<McDatepickerInputEvent<D>>();

    get empty(): boolean {
        return !this.viewValue && !this.isBadInput();
    }

    get viewValue(): string {
        return this.elementRef.nativeElement.value;
    }

    get ngControl(): any {
        return this.control;
    }

    get selectionStart(): number | null {
        return this.elementRef.nativeElement.selectionStart;
    }

    set selectionStart(value: number | null) {
        this.elementRef.nativeElement.selectionStart = value;
    }

    get selectionEnd(): number | null {
        return this.elementRef.nativeElement.selectionEnd;
    }

    set selectionEnd(value: number | null) {
        this.elementRef.nativeElement.selectionEnd = value;
    }

    private control: AbstractControl;
    private readonly uid = `mc-datepicker-${uniqueComponentIdSuffix++}`;

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
        this.localeSubscription = dateAdapter.localeChanges
            .subscribe(() => this.value = this.value);
    }

    onContainerClick() {
        this.focus();
    }

    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    focusChanged(isFocused: boolean): void {
        if (isFocused !== this.focused) {
            this.focused = isFocused;
            this.onTouched();
            this.stateChanges.next();
        }
    }

    onTouched = () => {};

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
    validate(control: AbstractControl): ValidationErrors | null {
        this.setControl(control);

        return this.validator ? this.validator(control) : null;
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

    onKeyDown(event: KeyboardEvent): void {
        // tslint:disable-next-line: deprecation
        const keyCode = event.keyCode;

        if (isLetterKey(event) && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();

            // this.incorrectInput.emit();
        } else if (
            (hasModifierKey(event) && (isVerticalMovement(keyCode) || isHorizontalMovement(keyCode))) ||
            event.ctrlKey || event.metaKey ||
            [DELETE, BACKSPACE].includes(keyCode)
        ) {
            noop();
        } else if (keyCode === SPACE) {
            // this.spaceKeyHandler(event);
        } else if ([HOME, PAGE_UP].includes(keyCode)) {
            // this.createSelectionOfTimeComponentInInput(0);
        } else if ([END, PAGE_DOWN].includes(keyCode)) {
            // this.createSelectionOfTimeComponentInInput(this.viewValue.length);
        } else if ([UP_ARROW, DOWN_ARROW].includes(keyCode)) {
            event.preventDefault();

            this.verticalArrowKeyHandler(keyCode);
        } else if ([LEFT_ARROW, RIGHT_ARROW].includes(keyCode)) {
            // this.horizontalArrowKeyHandler(keyCode);
        } else if (/^\D$/.test(event.key)) {
            event.preventDefault();

            // const newValue = this.getNewValue(event.key, this.selectionStart as number);
            // const formattedValue = this.replaceSymbols(newValue);
            //
            // if (newValue !== formattedValue) {
            //     this.setViewValue(formattedValue);
            //
            //     setTimeout(this.onInput);
            // } else {
            //     this.incorrectInput.emit();
            // }
        } else {
            // setTimeout(this.onInput);
        }
    }

    // onKeydown(event: KeyboardEvent) {
    //     // tslint:disable-next-line:deprecation
    //     const isAltDownArrow = event.altKey && event.keyCode === DOWN_ARROW;
    //
    //     if (this.datepicker && isAltDownArrow && !this.elementRef.nativeElement.readOnly) {
    //         this.datepicker.open();
    //         event.preventDefault();
    //     }
    // }

    // onInput(value: string) {
    //     let date = this.dateAdapter.parse(value, this.dateFormats.parse.dateInput);
    //     this.lastValueValid = !date || this.dateAdapter.isValid(date);
    //     date = this.getValidDateOrNull(date);
    //
    //     if (!this.dateAdapter.sameDate(date, this._value)) {
    //         this._value = date;
    //         this.cvaOnChange(date);
    //         this.valueChange.emit(date);
    //         this.dateInput.emit(new McDatepickerInputEvent(this, this.elementRef.nativeElement));
    //     }
    // }

    onChange() {
        this.dateChange.emit(new McDatepickerInputEvent(this, this.elementRef.nativeElement));
    }

    /** Handles blur events on the input. */
    onBlur() {
        // Reformat the input only if we have a valid value.
        if (this.value) {
            this.formatValue(this.value);
        }

        this.focusChanged(false);
    }

    onPaste($event) {
        console.log('todo: ', $event); // tslint:disable-line:no-console
    }

    getSize(): number {
        // todo maybe here need count length of mask
        // tslint:disable-next-line:no-magic-numbers
        return 10;
    }

    private getTimeEditMetrics(cursorPosition: number): {
        modifiedTimePart: DateParts;
        cursorStartPosition: number;
        cursorEndPosition: number;
    } {
        const timeString: string = this.viewValue;
        let modifiedTimePart: DateParts;
        let cursorStartPosition: number;
        let cursorEndPosition: number;

        const hoursIndex = 0;
        const minutesIndex = timeString.indexOf('.', hoursIndex + 1);
        const secondsIndex = minutesIndex !== -1 ? timeString.indexOf('.', minutesIndex + 1) : -1;

        if (secondsIndex !== -1 && cursorPosition > secondsIndex) {
            modifiedTimePart = DateParts.date;
            cursorStartPosition = secondsIndex + 1;
            cursorEndPosition = timeString.length;
        } else if (minutesIndex !== -1 && cursorPosition > minutesIndex) {
            modifiedTimePart = DateParts.month;
            cursorStartPosition = minutesIndex + 1;
            cursorEndPosition = secondsIndex > -1 ? secondsIndex : timeString.length;
        } else {
            modifiedTimePart = DateParts.year;
            cursorStartPosition = hoursIndex;
            cursorEndPosition = minutesIndex !== -1 ? minutesIndex : timeString.length;
        }

        return { modifiedTimePart, cursorStartPosition, cursorEndPosition };
    }

    private incrementTime(dateVal: D, whatToIncrement: DateParts = DateParts.date): D {
        console.log('incrementTime: '); // tslint:disable-line:no-console
        let year = this.dateAdapter.getYear(dateVal);
        let month = this.dateAdapter.getMonth(dateVal);
        let date = this.dateAdapter.getDate(dateVal);

        switch (whatToIncrement) {
            case DateParts.date:
                year++;
                break;
            case DateParts.month:
                month++;
                break;
            case DateParts.year:
                date++;
                break;
            default:
        }

        // if (date > SECONDS_PER_MINUTE) { date = 0; }
        //
        // if (month > MINUTES_PER_HOUR) { month = 0; }
        //
        // if (date > HOURS_PER_DAY) { date = 0; }

        return this.dateAdapter.createDateTime(
            year,
            month,
            date,
            this.dateAdapter.getHours(this.value as D),
            this.dateAdapter.getMinutes(this.value as D),
            this.dateAdapter.getSeconds(this.value as D),
            this.dateAdapter.getMilliseconds(this.value as D)
        );
    }

    private decrementTime(dateVal: D, whatToDecrement: DateParts = DateParts.date): D {
        console.log('decrementTime: '); // tslint:disable-line:no-console
        let year = this.dateAdapter.getYear(dateVal);
        let month = this.dateAdapter.getMonth(dateVal);
        let date = this.dateAdapter.getDate(dateVal);

        switch (whatToDecrement) {
            case DateParts.date:
                year--;
                break;
            case DateParts.month:
                month--;
                break;
            case DateParts.year:
                date--;
                break;
            default:
        }

        // if (date < 0) { date = SECONDS_PER_MINUTE; }
        //
        // if (month < 0) { month = MINUTES_PER_HOUR; }
        //
        // if (year < 0) { year = HOURS_PER_DAY; }

        return this.dateAdapter.createDateTime(
            year,
            month,
            date,
            this.dateAdapter.getHours(this.value as D),
            this.dateAdapter.getMinutes(this.value as D),
            this.dateAdapter.getSeconds(this.value as D),
            this.dateAdapter.getMilliseconds(this.value as D)
        );
    }

    private verticalArrowKeyHandler(keyCode: number): void {
        if (!this.value) { return; }

        let changedTime;

        const newEditParams = this.getTimeEditMetrics(this.selectionStart as number);

        if (keyCode === UP_ARROW) {
            changedTime = this.incrementTime(this.value, newEditParams.modifiedTimePart);
        }

        if (keyCode === DOWN_ARROW) {
            changedTime = this.decrementTime(this.value, newEditParams.modifiedTimePart);
        }

        this.value = changedTime;

        this.selectionStart = newEditParams.cursorStartPosition;
        this.selectionEnd = newEditParams.cursorEndPosition;

        this.onChange();
        this.stateChanges.next();
    }

    /** Checks whether the input is invalid based on the native validation. */
    private isBadInput(): boolean {
        const validity = (<HTMLInputElement> this.elementRef.nativeElement).validity;

        return validity && validity.badInput;
    }

    private cvaOnChange: (value: any) => void = () => {};

    private validatorOnChange = () => {};

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

    private setControl(control: AbstractControl) {
        if (!this.control) {
            this.control = control;
        }
    }
}
