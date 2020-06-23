import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    Directive,
    ElementRef,
    forwardRef,
    Input,
    OnDestroy,
    Optional,
    Renderer2
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
import { DateAdapter } from '@ptsecurity/cdk/datetime';
import {
    BACKSPACE,
    DELETE,
    DOWN_ARROW,
    hasModifierKey,
    LEFT_ARROW,
    RIGHT_ARROW,
    UP_ARROW
} from '@ptsecurity/cdk/keycodes';
import { McFormFieldControl } from '@ptsecurity/mosaic/form-field';
import { noop, Subject } from 'rxjs';

import {
    DEFAULT_TIME_FORMAT,
    HOURS_PER_DAY,
    HOURS_MINUTES_REGEXP,
    HOURS_MINUTES_SECONDS_REGEXP,
    HOURS_ONLY_REGEXP,
    MINUTES_PER_HOUR,
    SECONDS_PER_MINUTE,
    TIMEFORMAT_PLACEHOLDERS,
    TimeFormats,
    TimeParts,
    AM_PM_FORMAT_REGEXP
} from './timepicker.constants';


/** @docs-private */
export const MC_TIMEPICKER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => McTimepicker),
    multi: true
};

/** @docs-private */
export const MC_TIMEPICKER_VALIDATORS: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => McTimepicker),
    multi: true
};


let uniqueComponentIdSuffix: number = 0;


@Directive({
    selector: 'input[mcTimepicker]',
    exportAs: 'mcTimepickerInput',
    host: {
        class: 'mc-timepicker mc-input',
        // Native input properties that are overwritten by Angular inputs need to be synced with
        // the native input element. Otherwise property bindings for those don't work.
        '[attr.id]': 'id',
        '[attr.placeholder]': 'placeholder',
        '[attr.disabled]': 'disabled || null',
        '[attr.required]': 'required',

        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)',

        '(paste)': 'onPaste($event)',

        '(keydown)': 'onKeyDown($event)'
    },
    providers: [
        MC_TIMEPICKER_VALIDATORS,
        MC_TIMEPICKER_VALUE_ACCESSOR,
        { provide: McFormFieldControl, useExisting: McTimepicker }
    ]
})
export class McTimepicker<D> implements McFormFieldControl<D>, OnDestroy, ControlValueAccessor, Validator {
    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    readonly stateChanges: Subject<void> = new Subject<void>();

    readonly errorState: boolean;

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    focused: boolean = false;

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    controlType: string = 'mc-timepicker';

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input() placeholder: string;
    private lastValueValid = false;

    private control: AbstractControl;

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);

        // Browsers may not fire the blur event if the input is disabled too quickly.
        // Reset from here to ensure that the element doesn't become stuck.
        if (this.focused) {
            this.focused = false;
        }

        this.stateChanges.next();
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

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = coerceBooleanProperty(value);
    }

    private _required: boolean;

    @Input()
    get format(): TimeFormats {
        return this._format;
    }

    set format(formatValue: TimeFormats) {
        this._format = Object
            .keys(TimeFormats)
            .map((timeFormatKey) => TimeFormats[timeFormatKey])
            .indexOf(formatValue) > -1 ? formatValue : DEFAULT_TIME_FORMAT;

        this.placeholder = TIMEFORMAT_PLACEHOLDERS[this._format];

        if (this.value) {
            this.updateView();
        }
    }

    private _format: TimeFormats = DEFAULT_TIME_FORMAT;

    @Input()
    get min(): D | null {
        return this._min;
    }

    set min(value: D | null) {
        this._min = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
        this.validatorOnChange();
    }

    private _min: D | null = null;

    @Input()
    get max(): D | null {
        return this._max;
    }

    set max(value: D | null) {
        this._max = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
        this.validatorOnChange();
    }

    private _max: D | null = null;

    @Input()
    get value(): D | null {
        return this._value;
    }

    set value(value: D | null) {
        const newValue = this.dateAdapter.deserialize(value);

        this.lastValueValid = !newValue || this.dateAdapter.isValid(newValue);

        this._value = this.getValidDateOrNull(newValue);

        this.updateView();
    }

    private _value: D | null;

    get viewValue(): string {
        return this.elementRef.nativeElement.value;
    }

    get ngControl(): any {
        return this.control;
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    get empty(): boolean {
        return !this.viewValue && !this.isBadInput();
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

    private readonly uid = `mc-timepicker-${uniqueComponentIdSuffix++}`;

    private validator: ValidatorFn | null;

    private onChange: (value: any) => void;
    private onTouched: () => void;

    constructor(
        private readonly elementRef: ElementRef,
        @Optional() private dateAdapter: DateAdapter<any>,
        private readonly renderer: Renderer2
    ) {
        if (!this.dateAdapter) {
            throw Error(`McTimepicker: No provider found for DateAdapter. You must import one of the existing ` +
                `modules at your application root or provide a custom implementation or use exists ones.`);
        }

        this.validator = Validators.compose([this.parseValidator, this.minValidator, this.maxValidator]);

        this.onChange = noop;

        // Force setter to be called in case id was not specified.
        this.id = this.id;

        this.placeholder = TIMEFORMAT_PLACEHOLDERS[DEFAULT_TIME_FORMAT];
    }

    ngOnDestroy(): void {
        this.stateChanges.complete();
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

    onBlur() {
        this.lastValueValid = !!this.getDateFromTimeString(this.viewValue);
        this.control.updateValueAndValidity();
        this.focusChanged(false);
    }

    onPaste($event) {
        const newTimeObj = this.getDateFromTimeString($event.clipboardData.getData('text'));

        if (!newTimeObj) { return; }

        $event.preventDefault();

        this.renderer.setProperty(
            this.elementRef.nativeElement,
            'value',
            this.getTimeStringFromDate(newTimeObj, this.format)
        );

        this.value = newTimeObj;
        this.onChange(newTimeObj);
        this.stateChanges.next();
    }

    onInput() {
        const newTimeObj = this.getDateFromTimeString(this.viewValue);

        if (!newTimeObj) { return; }

        const selectionStart = this.selectionStart;
        const selectionEnd = this.selectionEnd;

        this.renderer.setProperty(
            this.elementRef.nativeElement,
            'value',
            this.getTimeStringFromDate(newTimeObj, this.format)
        );

        this.selectionStart = selectionStart;
        this.selectionEnd = selectionEnd;

        this.createSelectionOfTimeComponentInInput((selectionStart as number) + 1);

        this.onChange(newTimeObj);
        this.stateChanges.next();
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    onContainerClick() {
        this.focus();
    }

    onKeyDown(event: KeyboardEvent): void {
        // tslint:disable-next-line: deprecation
        const keyCode = event.keyCode;

        if (hasModifierKey(event) || [BACKSPACE, DELETE].includes(keyCode)) {
            return;
        } else if ([UP_ARROW, DOWN_ARROW].includes(keyCode)) {
            event.preventDefault();

            this.verticalArrowKeyHandler(keyCode);

            return;
        } else if ([LEFT_ARROW, RIGHT_ARROW].includes(keyCode)) {
            this.horizontalArrowKeyHandler(keyCode);

            return;
        }

        setTimeout(() => this.onInput());
    }

    validate(control: AbstractControl): ValidationErrors | null {
        this.setControl(control);

        return this.validator ? this.validator(control) : null;
    }

    registerOnValidatorChange(fn: () => void): void {
        this.validatorOnChange = fn;
    }

    writeValue(value: D | null): void {
        this.value = value;
    }

    registerOnChange(fn: (value: D) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /** Checks whether the input is invalid based on the native validation. */
    private isBadInput(): boolean {
        const validity = (<HTMLInputElement> this.elementRef.nativeElement).validity;

        return validity && validity.badInput;
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

        this.onChange(changedTime);
        this.stateChanges.next();
    }

    private horizontalArrowKeyHandler(keyCode: number): void {
        if (!this.value) { return; }

        let cursorPos = this.selectionStart as number;

        if (keyCode === LEFT_ARROW) {
            cursorPos = cursorPos === 0 ? this.viewValue.length : cursorPos - 1;
        } else if (keyCode === RIGHT_ARROW) {
            const nextDividerPos: number = this.viewValue.indexOf(':', cursorPos);

            cursorPos = nextDividerPos ? nextDividerPos + 1 : 0;
        }

        this.createSelectionOfTimeComponentInInput(cursorPos);
    }

    private createSelectionOfTimeComponentInInput(cursorPos: number): void {
        setTimeout(() => {
            const newEditParams = this.getTimeEditMetrics(cursorPos);

            this.selectionStart = newEditParams.cursorStartPosition;
            this.selectionEnd = newEditParams.cursorEndPosition;
        });
    }

    private incrementTime(dateVal: D, whatToIncrement: TimeParts = TimeParts.seconds): D {
        let hours = this.dateAdapter.getHours(dateVal);
        let minutes = this.dateAdapter.getMinutes(dateVal);
        let seconds = this.dateAdapter.getSeconds(dateVal);

        switch (whatToIncrement) {
            case TimeParts.hours:
                hours++;
                break;
            case TimeParts.minutes:
                minutes++;
                break;
            case TimeParts.seconds:
                seconds++;
                break;
            default:
        }

        if (seconds > SECONDS_PER_MINUTE) { seconds = 0; }

        if (minutes > MINUTES_PER_HOUR) { minutes = 0; }

        if (hours > HOURS_PER_DAY) { hours = 0; }

        return this.dateAdapter.createDateTime(
            this.dateAdapter.getYear(this.value),
            this.dateAdapter.getMonth(this.value),
            this.dateAdapter.getDate(this.value),
            hours,
            minutes,
            seconds,
            this.dateAdapter.getMilliseconds(this.value)
        );
    }

    private decrementTime(dateVal: D, whatToDecrement: TimeParts = TimeParts.seconds): D {
        let hours = this.dateAdapter.getHours(dateVal);
        let minutes = this.dateAdapter.getMinutes(dateVal);
        let seconds = this.dateAdapter.getSeconds(dateVal);

        switch (whatToDecrement) {
            case TimeParts.hours:
                hours--;
                break;
            case TimeParts.minutes:
                minutes--;
                break;
            case TimeParts.seconds:
                seconds--;
                break;
            default:
        }

        if (seconds < 0) { seconds = SECONDS_PER_MINUTE; }

        if (minutes < 0) { minutes = MINUTES_PER_HOUR; }

        if (hours < 0) { hours = HOURS_PER_DAY; }

        return this.dateAdapter.createDateTime(
            this.dateAdapter.getYear(this.value),
            this.dateAdapter.getMonth(this.value),
            this.dateAdapter.getDate(this.value),
            hours,
            minutes,
            seconds,
            this.dateAdapter.getMilliseconds(this.value)
        );
    }

    /**
     * @description Get params for arrow-keys (up/down) time valie edit.
     * @param cursorPosition Current cursor position in timeString
     */
    private getTimeEditMetrics(cursorPosition: number): {
        modifiedTimePart: TimeParts;
        cursorStartPosition: number;
        cursorEndPosition: number;
    } {
        const timeString: string = this.viewValue;
        let modifiedTimePart: TimeParts;
        let cursorStartPosition: number;
        let cursorEndPosition: number;

        const hoursIndex = 0;
        const minutesIndex = timeString.indexOf(':', hoursIndex + 1);
        const secondsIndex = minutesIndex !== -1 ? timeString.indexOf(':', minutesIndex + 1) : -1;

        if (secondsIndex !== -1 && cursorPosition > secondsIndex) {
            modifiedTimePart = TimeParts.seconds;
            cursorStartPosition = secondsIndex + 1;
            cursorEndPosition = timeString.length;
        } else if (minutesIndex !== -1 && cursorPosition > minutesIndex) {
            modifiedTimePart = TimeParts.minutes;
            cursorStartPosition = minutesIndex + 1;
            cursorEndPosition = secondsIndex > -1 ? secondsIndex : timeString.length;
        } else {
            modifiedTimePart = TimeParts.hours;
            cursorStartPosition = hoursIndex;
            cursorEndPosition = minutesIndex !== -1 ? minutesIndex : timeString.length;
        }

        return { modifiedTimePart, cursorStartPosition, cursorEndPosition };
    }

    /**
     * @description Create time string for displaying inside input element of UI
     */
    private getTimeStringFromDate(value: D | null, timeFormat: TimeFormats): string {
        if (!value || !this.dateAdapter.isValid(value)) { return ''; }

        return this.dateAdapter.format(value, timeFormat);
    }

    private getDateFromTimeString(timeString: string): D | null {
        if (!timeString) { return null; }

        const hoursAndMinutesAndSeconds = timeString.match(HOURS_MINUTES_SECONDS_REGEXP);
        const hoursAndMinutes = timeString.match(HOURS_MINUTES_REGEXP);
        const hoursOnly = timeString.match(HOURS_ONLY_REGEXP);
        const hoursAndMinutesInAmPm = timeString.match(AM_PM_FORMAT_REGEXP);

        let hours: number = 0;
        let minutes: number = 0;
        let seconds: number = 0;

        // tslint:disable:no-magic-numbers
        if (hoursAndMinutesInAmPm) {
            hours = Number(hoursAndMinutesInAmPm[1]);
            minutes = Number(hoursAndMinutesInAmPm[2]);

            if (/[p]/i.test(hoursAndMinutesInAmPm[3]) || (/[a]/i.test(hoursAndMinutesInAmPm[3]) && hours === 12)) {
                hours += 12;
            }
        } else if (hoursAndMinutesAndSeconds) {
            hours = Number(hoursAndMinutesAndSeconds[1]);
            minutes = Number(hoursAndMinutesAndSeconds[2]);
            seconds = Number(hoursAndMinutesAndSeconds[3]);
        } else if (hoursAndMinutes) {
            hours = Number(hoursAndMinutes[1]);
            minutes = Number(hoursAndMinutes[2]);
        } else if (hoursOnly) {
            hours = Number(hoursOnly[1]);
        } else {
            return null;
        }
        // tslint:enable

        const resultDate = this.dateAdapter.createDateTime(
            this.dateAdapter.getYear(this.value),
            this.dateAdapter.getMonth(this.value),
            this.dateAdapter.getDate(this.value),
            hours,
            minutes,
            seconds,
            this.dateAdapter.getMilliseconds(this.value)
        );

        return this.getValidDateOrNull(resultDate);
    }

    private parseValidator: ValidatorFn = (): ValidationErrors | null => {
        return this.empty || this.lastValueValid ? null : { mcTimepickerParse: { text: this.viewValue } };
    }

    private minValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));

        return (!this.min || !controlValue || this.compareTime(this.min, controlValue) <= 0) ?
            null :
            { mcTimepickerLowerThenMin: { min: this.min, actual: controlValue } };
    }

    private maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));

        return (!this.max || !controlValue || this.compareTime(this.max, controlValue) >= 0) ?
            null :
            { mcTimepickerHigherThenMax: { max: this.max, actual: controlValue } };
    }

    private compareTime(first: D, second: D): number {
        const result = this.dateAdapter.getHours(first) - this.dateAdapter.getHours(second) ||
            this.dateAdapter.getMinutes(first) - this.dateAdapter.getMinutes(second);

        if (TimeFormats.HHmm === this.format) {
            return result;
        } else if (TimeFormats.HHmmss === this.format) {
            return result || this.dateAdapter.getSeconds(first) - this.dateAdapter.getSeconds(second);
        } else {
            throw Error(`Unknown format: ${this.format}`);
        }
    }

    private getValidDateOrNull(obj: any): D | null {
        return (this.dateAdapter.isDateInstance(obj) && this.dateAdapter.isValid(obj)) ? obj : null;
    }

    private updateView() {
        const formattedValue = this.getTimeStringFromDate(this.value, this.format);

        this.renderer.setProperty(this.elementRef.nativeElement, 'value', formattedValue);
    }

    private setControl(control: AbstractControl) {
        if (!this.control) {
            this.control = control;
        }
    }

    // tslint:disable-next-line:no-empty
    private validatorOnChange = () => {};
}
