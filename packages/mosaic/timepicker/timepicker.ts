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
import { DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, UP_ARROW } from '@ptsecurity/cdk/keycodes';
import { McFormField, McFormFieldControl } from '@ptsecurity/mosaic/form-field';
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
    TimeParts
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
        '[attr.format]': 'format',

        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)',

        '(input)': 'onInput()',
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

    private _format: TimeFormats;

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
        let newValue = this.dateAdapter.deserialize(value);
        this.lastValueValid = !newValue || this.dateAdapter.isValid(newValue);
        newValue = this.getValidDateOrNull(newValue);
        const oldDate = this.value;
        this._value = newValue;

        // if (!this.dateAdapter.sameDate(oldDate, newValue)) {
        //     this.valueChange.emit(value);
        // }

        this.updateView();
    }

    private _value: D | null;

    readonly errorState: boolean;

    private readonly uid = `mc-timepicker-${uniqueComponentIdSuffix++}`;
    private validator: ValidatorFn | null;

    private previousNativeValue: any;

    private onChange: (value: any) => void;
    private onTouched: () => void;

    constructor(
        private readonly elementRef: ElementRef,
        @Optional() private dateAdapter: DateAdapter<any>,
        @Optional() private readonly parentFormField: McFormField,

        private readonly renderer: Renderer2
    ) {
        console.log('constructor');

        if (!this.dateAdapter) {
            throw Error(`McTimepicker: No provider found for DateAdapter. You must import one of the existing ` +
                `modules at your application root or provide a custom implementation or use exists ones.`);
        }

        this.validator = Validators.compose([this.parseValidator, this.minValidator, this.maxValidator]);

        this.previousNativeValue = this._value;
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
        this.focusChanged(false);
    }

    onPaste($event) {
        $event.preventDefault();
        const clipboardUserInput: string = $event.clipboardData.getData('text');

        if (this.getDateFromTimeString(clipboardUserInput) === undefined) { return; }

        this.elementRef.nativeElement._value = clipboardUserInput;
        this.onInput();
    }

    onInput() {
        console.log('onInput');
        const initialCursorStart: number = this.elementRef.nativeElement.selectionStart;
        const initialCursorEnd: number = this.elementRef.nativeElement.selectionEnd;
        let isAutocompleteTriggered: boolean = false;

        const { hoursOnly, hoursAndMinutes, hoursAndMinutesAndSeconds } = this.getParsedTimeParts(
            this.elementRef.nativeElement.value
        );

        // tslint:disable no-magic-numbers
        if (hoursOnly && hoursOnly[1] && hoursOnly[1].length === 2) {
            isAutocompleteTriggered = true;
        } else if (
            hoursAndMinutes && hoursAndMinutes[1].length === 1 && hoursAndMinutes[2] && hoursAndMinutes[2].length === 2
        ) {
            isAutocompleteTriggered = true;
        } else if (
            hoursAndMinutesAndSeconds &&
            hoursAndMinutesAndSeconds[1].length === 2 &&
            hoursAndMinutesAndSeconds[2].length === 2 &&
            hoursAndMinutesAndSeconds[3] &&
            hoursAndMinutesAndSeconds[3].length === 2
        ) {
            isAutocompleteTriggered = true;
        }
        // tslint:enable no-magic-numbers

        if (isAutocompleteTriggered) {
            this.applyInputChanges();

            this.elementRef.nativeElement.selectionStart = initialCursorStart;
            this.elementRef.nativeElement.selectionEnd = initialCursorEnd;

            this.createSelectionOfTimeComponentInInput(initialCursorStart + 1);
        }
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    get empty(): boolean {
        return !this.elementRef.nativeElement._value && !this.isBadInput();
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    onContainerClick() {
        this.focus();
    }

    onKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;

        if ([UP_ARROW, DOWN_ARROW].includes(keyCode)) {
            event.preventDefault();

            this.verticalArrowKeyHandler(keyCode);
        }

        if ([LEFT_ARROW, RIGHT_ARROW].includes(keyCode)) {
            this.horizontalArrowKeyHandler(keyCode);
        }
    }

    validate(control: AbstractControl): ValidationErrors | null {
        console.log('validate');
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

    private applyInputChanges(): void {
        console.log('applyInputChanges');

        const timeToApply = this.getDateFromTimeString(this.elementRef.nativeElement.value);

        if (timeToApply) {
            const selectionStart: number = this.elementRef.nativeElement.selectionStart;
            const selectionEnd: number = this.elementRef.nativeElement.selectionEnd;
            this.renderer.setProperty(
                this.elementRef.nativeElement,
                'value',
                this.getTimeStringFromDate(timeToApply, this.format)
            );
            this.elementRef.nativeElement.selectionStart = selectionStart;
            this.elementRef.nativeElement.selectionEnd = selectionEnd;
        }

        this.onChange(timeToApply);
        this.stateChanges.next();
    }

    private verticalArrowKeyHandler(keyCode: number): void {
        console.log('upDownTimeByArrowKeys');
        if (!this.value) { return; }

        let changedTime;

        const cursorPos = this.elementRef.nativeElement.selectionStart;
        const newEditParams = this.getTimeEditMetrics(cursorPos);

        if (keyCode === UP_ARROW) {
            changedTime = this.incrementTime(this.value, newEditParams.modifiedTimePart);
        }

        if (keyCode === DOWN_ARROW) {
            changedTime = this.decrementTime(this.value, newEditParams.modifiedTimePart);
        }

        this.value = changedTime;

        this.elementRef.nativeElement.selectionStart = newEditParams.cursorStartPosition;
        this.elementRef.nativeElement.selectionEnd = newEditParams.cursorEndPosition;

        this.onChange(changedTime);
        this.stateChanges.next();
    }

    private horizontalArrowKeyHandler(keyCode: number): void {
        console.log('switchSelectionBetweenTimeparts');
        if (!this.value) { return; }

        let cursorPos: number = this.elementRef.nativeElement.selectionStart;
        const value = this.elementRef.nativeElement.value;

        if (keyCode === LEFT_ARROW) {
            cursorPos = cursorPos === 0 ? value.length : cursorPos - 1;
        } else if (keyCode === RIGHT_ARROW) {
            const nextDividerPos: number = value.indexOf(':', cursorPos);

            cursorPos = nextDividerPos ? nextDividerPos + 1 : 0;
        }

        this.createSelectionOfTimeComponentInInput(cursorPos);
    }

    private createSelectionOfTimeComponentInInput(cursorPos: number): void {
        setTimeout(() => {
            const newEditParams = this.getTimeEditMetrics(cursorPos);
            this.elementRef.nativeElement.selectionStart = newEditParams.cursorStartPosition;
            this.elementRef.nativeElement.selectionEnd = newEditParams.cursorEndPosition;
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
        const timeString: string = this.elementRef.nativeElement.value;
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
    private getTimeStringFromDate(value: D, timeFormat: TimeFormats = DEFAULT_TIME_FORMAT): string {
        if (!this.dateAdapter.isValid(value)) { return ''; }

        return this.dateAdapter.format(value, timeFormat);
    }

    private getParsedTimeParts(timeString: string): {
        hoursOnly: any;
        hoursAndMinutes: any;
        hoursAndMinutesAndSeconds: any;
    } {
        const momentWrappedTime = this.dateAdapter.parse(timeString, [
            'h:m a',
            'h:m:s a',
            'H:m',
            'H:m:s'
        ]);

        const convertedTimeString = momentWrappedTime !== null ? momentWrappedTime.format('H:m:s') : '';

        const hoursAndMinutesAndSeconds = convertedTimeString.match(HOURS_MINUTES_SECONDS_REGEXP);
        const hoursAndMinutes = convertedTimeString.match(HOURS_MINUTES_REGEXP);
        const hoursOnly = convertedTimeString.match(HOURS_ONLY_REGEXP);

        return {
            hoursOnly,
            hoursAndMinutes,
            hoursAndMinutesAndSeconds
        };
    }

    private getDateFromTimeString(timeString: string): D | null {
        if (!timeString) { return; }

        const { hoursOnly, hoursAndMinutes, hoursAndMinutesAndSeconds } = this.getParsedTimeParts(timeString);

        if (
            timeString.trim().length === 0 ||
            (hoursOnly === null && hoursAndMinutes === null && hoursAndMinutesAndSeconds === null)
        ) {
            return;
        }

        // tslint:disable no-magic-numbers
        let hours: number = 0;
        let minutes: number = 0;
        let seconds: number = 0;

        if (hoursOnly) {
            hours = Number(hoursOnly[1]);
        } else if (hoursAndMinutes) {
            hours = Number(hoursAndMinutes[1]);
            minutes = Number(hoursAndMinutes[2]);
        } else if (hoursAndMinutesAndSeconds) {
            hours = Number(hoursAndMinutesAndSeconds[1]);
            minutes = Number(hoursAndMinutesAndSeconds[2]);
            seconds = Number(hoursAndMinutesAndSeconds[3]);
        }

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
        return this.lastValueValid ? null : { mcTimepickerParse: { text: this.elementRef.nativeElement.value } };
    }

    private minValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));

        return (!this.min || !controlValue || this.dateAdapter.compareDate(this.min, controlValue) <= 0) ?
            null :
            { mcTimepickerLowerThenMintime: { min: this.min, actual: controlValue } };
    }

    private maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));

        return (!this.max || !controlValue || this.dateAdapter.compareDate(this.max, controlValue) >= 0) ?
            null :
            { mcTimepickerHigherThenMaxtime: { max: this.max, actual: controlValue } };
    }

    private getValidDateOrNull(obj: any): D | null {
        return (this.dateAdapter.isDateInstance(obj) && this.dateAdapter.isValid(obj)) ? obj : null;
    }

    private updateView() {
        const formattedValue = this.getTimeStringFromDate(this.value, this.format);

        this.renderer.setProperty(this.elementRef.nativeElement, 'value', formattedValue);
    }

    // tslint:disable-next-line:no-empty
    private validatorOnChange = () => {};
}
