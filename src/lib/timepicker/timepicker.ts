import {
    Directive,
    DoCheck,
    ElementRef,
    forwardRef,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    Optional,
    Renderer2,
    Self
} from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    FormGroupDirective,
    NG_VALIDATORS,
    NgControl,
    NgForm,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';
import {
    CanUpdateErrorState,
    CanUpdateErrorStateCtor,
    ErrorStateMatcher,
    mixinErrorState
} from '@ptsecurity/mosaic/core';
import { McFormFieldControl } from '@ptsecurity/mosaic/form-field';
import { MC_INPUT_VALUE_ACCESSOR } from '@ptsecurity/mosaic/input';
import {
    noop,
    Subject
} from 'rxjs';

import {
    ARROW_DOWN_KEYCODE,
    ARROW_LEFT_KEYCODE,
    ARROW_RIGHT_KEYCODE,
    ARROW_UP_KEYCODE,
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


let uniqueComponentIdSuffix: number = 0;

const formValidators: WeakMap<FormControl, ValidatorFn | null> = new WeakMap();
const formValidatorOnChangeRegistrators: WeakMap<FormControl, () => void> = new WeakMap();
const validatorOnChange = (c: FormControl) => {
    const validatorOnChangeHandler = formValidatorOnChangeRegistrators.get(c);
    if (validatorOnChangeHandler !== undefined) { validatorOnChangeHandler(); }
}

// tslint:disable naming-convention
export class McTimepickerBase {
    constructor(
        public _defaultErrorStateMatcher: ErrorStateMatcher,
        public _parentForm: NgForm,
        public _parentFormGroup: FormGroupDirective,
        public ngControl: NgControl) { }
}

// tslint:enable naming-convention

// tslint:disable-next-line naming-convention
export const McTimepickerMixinBase:
    CanUpdateErrorStateCtor &
    typeof McTimepickerBase = mixinErrorState(McTimepickerBase);

@Directive({
    selector: 'input[mcTimepicker]',
    exportAs: 'mcTimepickerInput',
    host: {
        class: 'mc-timepicker mc-input',
        // Native input properties that are overwritten by Angular inputs need to be synced with
        // the native input element. Otherwise property bindings for those don't work.
        '[attr.id]': 'id',
        '[attr.placeholder]': 'placeholder',
        '[disabled]': 'disabled',
        '[required]': 'required',
        '[attr.time-format]': 'timeFormat',
        '[attr.min-time]': 'minTime',
        '[attr.max-time]': 'maxTime',
        '[attr.value]': 'value',
        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)',
        '(input)': 'onInput()',
        '(paste)': 'onPaste($event)',
        '(keydown)': 'onKeyDown($event)'
    },
    providers: [
        {
            provide: NG_VALIDATORS,
            useValue: {
                validate(c) {
                    // TODO ACHTUNG! This is `workaround` to bind singleton-like Validator implementation to
                    // context of each validated component. This MUST be burned (with the man coded this sh…t)
                    // and realized in proper way!
                    if (this.__validatorOnChangeHandler !== undefined) {
                        formValidatorOnChangeRegistrators.set(c, this.__validatorOnChangeHandler);
                        this.__validatorOnChangeHandler = undefined;
                    }
                    const validator = formValidators.get(c);

                    return validator ? validator(c) : null;
                },
                registerOnValidatorChange(fn: () => void): void { 
                    this.__validatorOnChangeHandler = fn;
                }
            },
            multi: true
        },
        {
            provide: McFormFieldControl,
            useExisting: forwardRef(() => McTimepicker)
        }
    ]

})
export class McTimepicker extends McTimepickerMixinBase
    implements McFormFieldControl<any>,
        OnChanges,
        OnDestroy,
        DoCheck,
        CanUpdateErrorState,
        ControlValueAccessor {

    /** An object used to control when error messages are shown. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    focused: boolean = false;

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    readonly stateChanges: Subject<void> = new Subject<void>();

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    controlType: string = 'mc-timepicker';

    @Input()
    get disabled(): boolean {
        if (this.ngControl && this.ngControl.disabled !== null) { return this.ngControl.disabled; }

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

    @Input()
    get id(): string { return this._id; }

    set id(value: string) { this._id = value || this.uid; }


    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input() placeholder: string;

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get required(): boolean { return this._required; }

    set required(value: boolean) { this._required = coerceBooleanProperty(value); }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get value(): string { return this.inputValueAccessor.value; }

    set value(value: string) {
        if (value !== this.value) {
            this.inputValueAccessor.value = value;
            this.applyInputChanges();
        }
    }

    @Input('time-format')
    get timeFormat(): TimeFormats { return this._timeFormat; }

    set timeFormat(formatValue: TimeFormats) {
        this._timeFormat = Object
            .keys(TimeFormats)
            .map((timeFormatKey) => TimeFormats[timeFormatKey])
            .indexOf(formatValue) > -1 ? formatValue : DEFAULT_TIME_FORMAT;

        validatorOnChange(<FormControl> this.ngControl.control);
        this.placeholder = TIMEFORMAT_PLACEHOLDERS[this._timeFormat];
    }

    @Input('min-time')
    get minTime(): string | null { return this._minTime; }

    set minTime(minValue: string | null) {
        this._minTime = minValue;
        this.minDateTime = minValue !== null ? this.getDateFromTimeString(minValue) : undefined;
        validatorOnChange(<FormControl> this.ngControl.control);
    }

    @Input('max-time')
    get maxTime(): string | null { return this._maxTime; }

    set maxTime(maxValue: string | null) {
        this._maxTime = maxValue;
        this.maxDateTime = maxValue !== null ? this.getDateFromTimeString(maxValue) : undefined;
        validatorOnChange(<FormControl> this.ngControl.control);
    }

    private _id: string;
    private readonly uid = `mc-timepicker-${uniqueComponentIdSuffix++}`;
    private _disabled: boolean;
    private _required: boolean;
    private previousNativeValue: any;
    private readonly inputValueAccessor: { value: any };
    private onChange: (value: any) => void;
    private onTouched: () => void;
    private _timeFormat: TimeFormats;
    private _minTime: string | null = null;
    private minDateTime: Date | undefined;
    private _maxTime: string | null = null;
    private maxDateTime: Date | undefined;
    private currentDateTimeInput: Date | undefined;

    // tslint:disable naming-convention
    constructor(private readonly elementRef: ElementRef,
                @Optional() @Self() public ngControl: NgControl,
                @Optional() _parentForm: NgForm,
                @Optional() _parentFormGroup: FormGroupDirective,
                _defaultErrorStateMatcher: ErrorStateMatcher,
                @Optional() @Self() @Inject(MC_INPUT_VALUE_ACCESSOR) inputValueAccessor: any,
                private readonly renderer: Renderer2) {
        // tslint:enable naming-convention
        super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);

        // If no input value accessor was explicitly specified, use the element as the input value
        // accessor.
        this.inputValueAccessor = inputValueAccessor || this.elementRef.nativeElement;

        this.previousNativeValue = this.value;
        this.onChange = noop;

        // Force setter to be called in case id was not specified.
        this.id = this.id;

        this.placeholder = TIMEFORMAT_PLACEHOLDERS[DEFAULT_TIME_FORMAT];

        // Instead of NG_VALUE_ACCESSOR (https://github.com/angular/material2/issues/8158#issuecomment-344618103)
        if (this.ngControl) { this.ngControl.valueAccessor = this; }

        // Substitute initial empty validator with validator linked to directive object instance (workaround)

        formValidators.set(
            <FormControl> this.ngControl.control,
            Validators.compose([
                () => this.parseValidator(),
                () => this.minTimeValidator(),
                () => this.maxTimeValidator()
            ])
        );
    }

    ngOnChanges(): void {
        this.stateChanges.next();
    }

    ngOnDestroy(): void {
        this.stateChanges.complete();
    }

    ngDoCheck(): void {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();
        }

        // We need to dirty-check the native element's value, because there are some cases where
        // we won't be notified when it changes (e.g. the consumer isn't using forms or they're
        // updating the value using `emitEvent: false`).
        this.dirtyCheckNativeValue();
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
        this.applyInputChanges();
        this.focusChanged(false);
    }

    onPaste($event) {
        $event.preventDefault();
        const clipboardUserInput: string = $event.clipboardData.getData('text');

        if (this.getDateFromTimeString(clipboardUserInput) === undefined) { return; }

        this.elementRef.nativeElement.value = clipboardUserInput;
        this.onInput();
    }

    onInput() {
        const initialCursorStart: number = this.elementRef.nativeElement.selectionStart;
        const initialCursorEnd: number = this.elementRef.nativeElement.selectionEnd;
        let isAutocompleteTriggered: boolean = false;

        const {
            hoursOnly,
            hoursAndMinutes,
            hoursAndMinutesAndSeconds
        } = this.getParsedTimeParts(this.elementRef.nativeElement.value);

        // tslint:disable no-magic-numbers
        if (hoursOnly &&
            hoursOnly[1] &&
            hoursOnly[1].length === 2) {
            isAutocompleteTriggered = true;
        } else if (hoursAndMinutes &&
            hoursAndMinutes[1].length === 1 &&
            hoursAndMinutes[2] &&
            hoursAndMinutes[2].length === 2) {
            isAutocompleteTriggered = true;
        } else if (hoursAndMinutesAndSeconds &&
            hoursAndMinutesAndSeconds[1].length === 2 &&
            hoursAndMinutesAndSeconds[2].length === 2 &&
            hoursAndMinutesAndSeconds[3] &&
            hoursAndMinutesAndSeconds[3].length === 2) {
            isAutocompleteTriggered = true;
        }
        // tslint:enable no-magic-numbers

        this.applyInputChanges({doTimestringReformat: isAutocompleteTriggered});

        this.elementRef.nativeElement.selectionStart = initialCursorStart;
        this.elementRef.nativeElement.selectionEnd = initialCursorEnd;

        if (isAutocompleteTriggered && this.ngControl.errors === null) {
            this.createSelectionOfTimeComponentInInput(initialCursorStart + 1);
        }
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    get empty(): boolean {
        return !this.elementRef.nativeElement.value && !this.isBadInput();
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    onContainerClick() {
        this.focus();
    }

    writeValue(value: Date | null): void {
        if (value !== null) {
            this.renderer.setProperty(this.elementRef.nativeElement,
                'value',
                this.getTimeStringFromDate(value, this.timeFormat)
            );
        }
        this.onChange(value || null);
        this.applyInputChanges();
    }

    onKeyDown(event: KeyboardEvent): void {

        const keyCode: string = this.getKeyCode(event);

        if (keyCode === ARROW_UP_KEYCODE || keyCode === ARROW_DOWN_KEYCODE) {
            this.upDownTimeByArrowKeys(event);
        }
        if (keyCode === ARROW_LEFT_KEYCODE || keyCode === ARROW_RIGHT_KEYCODE) {
            this.switchSelectionBetweenTimeparts(event);
        }
    }

    registerOnChange(fn: (value: Date) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /** Does some manual dirty checking on the native input `value` property. */
    private dirtyCheckNativeValue() {
        const newValue = this.value;

        if (this.previousNativeValue !== newValue) {
            this.previousNativeValue = newValue;
            this.stateChanges.next();
        }
    }

    /** Checks whether the input is invalid based on the native validation. */
    private isBadInput(): boolean {
        const validity = (<HTMLInputElement> this.elementRef.nativeElement).validity;

        return validity && validity.badInput;
    }

    private applyInputChanges(applyParams: {
        changedTime?: Date;
        doTimestringReformat?: boolean;
    } = {}): void {
        const {changedTime, doTimestringReformat = true} = applyParams;
        const timeToApply: Date | undefined = changedTime ||
            this.getDateFromTimeString(this.elementRef.nativeElement.value);
        this.currentDateTimeInput = timeToApply;

        if (doTimestringReformat && timeToApply !== undefined) {
            const selectionStart: number = this.elementRef.nativeElement.selectionStart;
            const selectionEnd: number = this.elementRef.nativeElement.selectionEnd;
            this.renderer.setProperty(
                this.elementRef.nativeElement,
                'value',
                this.getTimeStringFromDate(timeToApply, this.timeFormat));
            this.elementRef.nativeElement.selectionStart = selectionStart;
            this.elementRef.nativeElement.selectionEnd = selectionEnd;
        }

        (<FormControl> this.ngControl.control).updateValueAndValidity();
        const result = this.ngControl.errors === null && timeToApply !== undefined ? timeToApply : null;
        this.onChange(result);
        this.stateChanges.next();
    }

    private upDownTimeByArrowKeys(event: KeyboardEvent): void {
        event.preventDefault();

        let changedTime: Date | undefined = this.currentDateTimeInput;
        if (changedTime !== undefined) {
            const cursorPos = this.elementRef.nativeElement.selectionStart;

            const modifiedTimePart = this.getTimeEditMetrics(cursorPos)
                .modifiedTimePart;
            const keyCode: string = this.getKeyCode(event);
            if (keyCode === ARROW_UP_KEYCODE) { changedTime = this.incrementTime(changedTime, modifiedTimePart); }
            if (keyCode === ARROW_DOWN_KEYCODE) { changedTime = this.decrementTime(changedTime, modifiedTimePart); }
            this.applyInputChanges({changedTime});
            this.createSelectionOfTimeComponentInInput(cursorPos);
        }
    }

    private switchSelectionBetweenTimeparts(event: KeyboardEvent): void {
        const changedTime: Date | undefined = this.currentDateTimeInput;
        const keyCode: string = this.getKeyCode(event);

        if (changedTime !== undefined) {
            let cursorPos: number = this.elementRef.nativeElement.selectionStart;
            if (keyCode === ARROW_LEFT_KEYCODE) {
                cursorPos = this.getCursorPositionOfPrevTimePartStart(cursorPos, this.elementRef.nativeElement.value);
            } else if (keyCode === ARROW_RIGHT_KEYCODE) {
                cursorPos = this.getCursorPositionOfNextTimePartStart(cursorPos, this.elementRef.nativeElement.value);
            }
            this.createSelectionOfTimeComponentInInput(cursorPos);
        }
    }

    /**
     * @description Microsoft EDGE doesn't support KeyboaedEvent.code thus we need this helper
     */
    private getKeyCode(event: KeyboardEvent): string {
        return event.code || event.key;
    }

    private createSelectionOfTimeComponentInInput(cursorPos: number): void {
        setTimeout(() => {
            const newEditParams = this.getTimeEditMetrics(cursorPos);
            this.elementRef.nativeElement.selectionStart = newEditParams.cursorStartPosition;
            this.elementRef.nativeElement.selectionEnd = newEditParams.cursorEndPosition;
        });
    }

    private incrementTime(dateVal: Date,
                          whatToIncrement: TimeParts = TimeParts.seconds): Date {
        let {hours, minutes, seconds} = this.getTimeDigitsFromDate(dateVal);

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

        return <Date> this.getDateFromTimeDigits(hours, minutes, seconds);
    }

    /**
     * @description Decrement part of time
     */
    private decrementTime(dateVal: Date,
                          whatToDecrement: TimeParts = TimeParts.seconds): Date {
        let {hours, minutes, seconds} = this.getTimeDigitsFromDate(dateVal);

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

        return <Date> this.getDateFromTimeDigits(hours, minutes, seconds);
    }

    private getCursorPositionOfPrevTimePartStart(cursorPos: number, timeString: string): number {
        return cursorPos === 0 ? timeString.length : cursorPos - 1;
    }

    private getCursorPositionOfNextTimePartStart(cursorPos: number,
                                                 timeString: string,
                                                 timeDevider: string = ':'): number {
        const nextDividerPos: number = timeString.indexOf(timeDevider, cursorPos);

        return nextDividerPos !== undefined ? nextDividerPos + 1 : 0;
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

        return {
            modifiedTimePart,
            cursorStartPosition,
            cursorEndPosition
        };
    }

    /**
     * @description Create time string for displaying inside input element of UI
     */
    private getTimeStringFromDate(tempVal: Date,
                                  timeFormat: TimeFormats = DEFAULT_TIME_FORMAT): string {
        const hours: string = this.getNumberWithLeadingZero(tempVal.getHours());
        const minutes: string = this.getNumberWithLeadingZero(tempVal.getMinutes());
        const seconds: string = this.getNumberWithLeadingZero(tempVal.getSeconds());

        const formattedTimeGenerators = {
            [TimeFormats.HHmm]: () => `${hours}:${minutes}`,
            [TimeFormats.HHmmss]: () => `${hours}:${minutes}:${seconds}`
        };

        return formattedTimeGenerators[timeFormat]();
    }

    private getParsedTimeParts(timeString: string): {
        hoursOnly: any;
        hoursAndMinutes: any;
        hoursAndMinutesAndSeconds: any;
    } {
        const hoursAndMinutesAndSeconds = timeString.match(HOURS_MINUTES_SECONDS_REGEXP);
        const hoursAndMinutes = timeString.match(HOURS_MINUTES_REGEXP);
        const hoursOnly = timeString.match(HOURS_ONLY_REGEXP);

        return {
            hoursOnly,
            hoursAndMinutes,
            hoursAndMinutesAndSeconds
        };
    }

    /**
     * @description Create Date object from separate parts of time
     */
    private getDateFromTimeDigits(hours: number, minutes: number, seconds: number = 0): Date | undefined {
        return this.getDateFromTimeString(`${hours}:${minutes}:${seconds}`);
    }

    private getDateFromTimeString(timeString: string | undefined): Date | undefined {
        // TODO Use moment-js
        if (timeString === undefined) { return; }

        const {
            hoursOnly,
            hoursAndMinutes,
            hoursAndMinutesAndSeconds
        } = this.getParsedTimeParts(timeString);

        if (timeString.trim().length === 0 ||
            hoursOnly === null && hoursAndMinutes === null && hoursAndMinutesAndSeconds === null) {
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
        // const timestamp: number = Date.parse(fullDateString);
        const resultDate: Date = new Date(1970, 0, 1, hours, minutes, seconds);
        // tslint:enable no-magic-numbers

        return isNaN(resultDate.getTime()) ? undefined : resultDate;
    }

    private getNumberWithLeadingZero(digit: number): string {
        const MAX_DIGIT_WITH_LEADING_ZERO: number = 9;

        return digit > MAX_DIGIT_WITH_LEADING_ZERO ? `${digit}` : `0${digit}`;
    }

    private getTimeDigitsFromDate(dateVal: Date): { hours: number; minutes: number; seconds: number } {
        return {
            hours: dateVal.getHours(),
            minutes: dateVal.getMinutes(),
            seconds: dateVal.getSeconds()
        };
    }

    private parseValidator(): ValidationErrors | null {
        return this.currentDateTimeInput === undefined ?
            {mcTimepickerParse: {text: this.elementRef.nativeElement.value}} :
            null;
    }

    private minTimeValidator(): ValidationErrors | null {

        if (this.currentDateTimeInput !== undefined &&
            this.minDateTime !== undefined &&
            this.isTimeLowerThenMin(this.currentDateTimeInput)) {
            return {mcTimepickerLowerThenMintime: {text: this.elementRef.nativeElement.value}};
        }

        return null;
    }

    private maxTimeValidator(): ValidationErrors | null {
        if (this.currentDateTimeInput !== undefined &&
            this.maxDateTime !== undefined &&
            this.isTimeGreaterThenMax(this.currentDateTimeInput)) {
            return {mcTimepickerHigherThenMaxtime: {text: this.elementRef.nativeElement.value}};
        }

        return null;
    }

    private isTimeLowerThenMin(timeToCompare: Date): boolean {
        return timeToCompare.getTime() - (<Date> this.minDateTime).getTime() < 0;
    }

    private isTimeGreaterThenMax(timeToCompare: Date): boolean {
        return timeToCompare.getTime() - (<Date> this.maxDateTime).getTime() >= 0;
    }
}
