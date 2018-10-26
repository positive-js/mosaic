import {
    Directive,
    DoCheck,
    ElementRef,
    forwardRef,
    Inject,
    InjectionToken,
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
import {
    noop,
    Subject
} from 'rxjs';

import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';
import {
    CanUpdateErrorState,
    CanUpdateErrorStateCtor,
    ErrorStateMatcher,
    mixinErrorState
} from '@ptsecurity/mosaic/core';
import { McFormFieldControl } from '@ptsecurity/mosaic/form-field';

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


let _uniqueComponentIdSuffix: number = 0;
let _validatorOnChange: () => void = noop;
let _validator: ValidatorFn | null = () => null;

export const MC_INPUT_VALUE_ACCESSOR =
    new InjectionToken<{ value: any }>('MC_INPUT_VALUE_ACCESSOR');

export class McTimepickerBase {
    constructor(
        public _defaultErrorStateMatcher: ErrorStateMatcher,
        public _parentForm: NgForm,
        public _parentFormGroup: FormGroupDirective,
        public ngControl: NgControl) { }
}

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
                validate(c) { return _validator ? _validator(c) : null; },
                registerOnValidatorChange(fn: () => void): void { _validatorOnChange = fn; }
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

    set id(value: string) { this._id = value || this._uid; }

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
    get value(): string { return this._inputValueAccessor.value; }

    set value(value: string) {
        if (value !== this.value) {
            this._inputValueAccessor.value = value;
            this._applyInputChanges();
        }
    }

    @Input('time-format')
    get timeFormat(): TimeFormats { return this._timeFormat; }

    set timeFormat(formatValue: TimeFormats) {
        this._timeFormat = Object
            .keys(TimeFormats)
            .map((timeFormatKey) => TimeFormats[timeFormatKey])
            .indexOf(formatValue) > -1 ? formatValue : DEFAULT_TIME_FORMAT;

        _validatorOnChange();
        this.placeholder = TIMEFORMAT_PLACEHOLDERS[this._timeFormat.toLowerCase()];
    }

    @Input('min-time')
    get minTime(): string | null { return this._minTime; }

    set minTime(minValue: string | null) {
        this._minTime = minValue;
        this._minDTime = minValue !== null ? this._getDateFromTimeString(minValue) : undefined;
        _validatorOnChange();
    }

    @Input('max-time')
    get maxTime(): string | null { return this._maxTime; }

    set maxTime(maxValue: string | null) {
        this._maxTime = maxValue;
        this._maxDTime = maxValue !== null ? this._getDateFromTimeString(maxValue) : undefined;
        _validatorOnChange();
    }

    private _id: string;
    private readonly _uid = `mc-timepicker-${_uniqueComponentIdSuffix++}`;
    private _disabled: boolean;
    private _required: boolean;
    private _previousNativeValue: any;
    private readonly _inputValueAccessor: { value: any };
    private _onChange: (value: any) => void;
    private _onTouched: () => void;
    private _timeFormat: TimeFormats;
    private _minTime: string | null = null;
    private _minDTime: Date | undefined;
    private _maxTime: string | null = null;
    private _maxDTime: Date | undefined;
    private _currentDTimeInput: Date | undefined;

    constructor(private readonly _elementRef: ElementRef,
                @Optional() @Self() public ngControl: NgControl,
                @Optional() _parentForm: NgForm,
                @Optional() _parentFormGroup: FormGroupDirective,
                _defaultErrorStateMatcher: ErrorStateMatcher,
                @Optional() @Self() @Inject(MC_INPUT_VALUE_ACCESSOR) inputValueAccessor: any,
                private readonly _renderer: Renderer2) {
        super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);

        // If no input value accessor was explicitly specified, use the element as the input value
        // accessor.
        this._inputValueAccessor = inputValueAccessor || this._elementRef.nativeElement;

        this._previousNativeValue = this.value;
        this._onChange = noop;

        // Force setter to be called in case id was not specified.
        this.id = this.id;

        // Instead of NG_VALUE_ACCESSOR (https://github.com/angular/material2/issues/8158#issuecomment-344618103)
        if (this.ngControl) { this.ngControl.valueAccessor = this; }

        // Substitute initial empty validator with validator linked to directive object instance (workaround)
        _validator = Validators.compose([
            () => this._parseValidator(),
            () => this._minTimeValidator(),
            () => this._maxTimeValidator()
        ]);
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
        this._dirtyCheckNativeValue();
    }

    focus(): void {
        this._elementRef.nativeElement.focus();
    }

    focusChanged(isFocused: boolean): void {
        if (isFocused !== this.focused) {
            this.focused = isFocused;
            this._onTouched();
            this.stateChanges.next();
        }
    }

    onBlur() {
        this._applyInputChanges();
        this.focusChanged(false);
    }

    onPaste($event) {
        $event.preventDefault();
        const clipboardUserInput: string = $event.clipboardData.getData('text');

        if (this._getDateFromTimeString(clipboardUserInput) === undefined) { return; }

        this._elementRef.nativeElement.value = clipboardUserInput;
        this.onInput();
    }

    onInput() {
        const initialCursorStart: number = this._elementRef.nativeElement.selectionStart;
        const initialCursorEnd: number = this._elementRef.nativeElement.selectionEnd;
        let isAutocompleteTriggered: boolean = false;

        const {
            hoursOnly,
            hoursAndMinutes,
            hoursAndMinutesAndSeconds
        } = this._getParsedTimeParts(this._elementRef.nativeElement.value);

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

        this._applyInputChanges({ doTimestringReformat: isAutocompleteTriggered });

        this._elementRef.nativeElement.selectionStart = initialCursorStart;
        this._elementRef.nativeElement.selectionEnd = initialCursorEnd;

        if (isAutocompleteTriggered && this.ngControl.errors === null) {
            this._createSelectionOfTimeComponentInInput(initialCursorStart + 1);
        }
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    get empty(): boolean {
        return !this._elementRef.nativeElement.value && !this._isBadInput();
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
            this._renderer.setProperty(this._elementRef.nativeElement,
                'value',
                this._getTimeStringFromDate(value, this.timeFormat)
            );
        }
        this._onChange(value || null);
        this._applyInputChanges();
    }

    onKeyDown(event: KeyboardEvent): void {

        const keyCode: string = this._getKeyCode(event);

        if (keyCode === ARROW_UP_KEYCODE || keyCode === ARROW_DOWN_KEYCODE) {
            this._upDownTimeByArrowKeys(event);
        }
        if (keyCode === ARROW_LEFT_KEYCODE || keyCode === ARROW_RIGHT_KEYCODE) {
            this._switchSelectionBetweenTimeparts(event);
        }
    }

    registerOnChange(fn: (value: Date) => void): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }

    /** Does some manual dirty checking on the native input `value` property. */
    private _dirtyCheckNativeValue() {
        const newValue = this.value;

        if (this._previousNativeValue !== newValue) {
            this._previousNativeValue = newValue;
            this.stateChanges.next();
        }
    }

    /** Checks whether the input is invalid based on the native validation. */
    private _isBadInput(): boolean {
        const validity = (<HTMLInputElement> this._elementRef.nativeElement).validity;

        return validity && validity.badInput;
    }

    private _applyInputChanges(applyParams: {
        changedTime?: Date;
        doTimestringReformat?: boolean;
    } = {}): void {
        const { changedTime, doTimestringReformat = true } = applyParams;

        const timeToApply: Date | undefined = changedTime ||
            this._getDateFromTimeString(this._elementRef.nativeElement.value);
        this._currentDTimeInput = timeToApply;

        if (doTimestringReformat && timeToApply !== undefined) {
            this._renderer.setProperty(
                this._elementRef.nativeElement,
                'value',
                this._getTimeStringFromDate(timeToApply, this.timeFormat));
        }

        (<FormControl> this.ngControl.control).updateValueAndValidity();
        const result = this.ngControl.errors === null && timeToApply !== undefined ? timeToApply : null;
        this._onChange(result);
        this.stateChanges.next();
    }

    private _upDownTimeByArrowKeys(event: KeyboardEvent): void {
        event.preventDefault();

        let changedTime: Date | undefined = this._currentDTimeInput;
        if (changedTime !== undefined) {
            const cursorPos = this._elementRef.nativeElement.selectionStart;

            const modifiedTimePart = this._getTimeEditMetrics(cursorPos)
                .modifiedTimePart;
            const keyCode: string = this._getKeyCode(event);
            if (keyCode === ARROW_UP_KEYCODE) { changedTime = this._incrementTime(changedTime, modifiedTimePart); }
            if (keyCode === ARROW_DOWN_KEYCODE) { changedTime = this._decrementTime(changedTime, modifiedTimePart); }
            this._applyInputChanges({ changedTime });
            this._createSelectionOfTimeComponentInInput(cursorPos);
        }
    }

    private _switchSelectionBetweenTimeparts(event: KeyboardEvent): void {
        const changedTime: Date | undefined = this._currentDTimeInput;
        const keyCode: string = this._getKeyCode(event);

        if (changedTime !== undefined) {
            let cursorPos: number = this._elementRef.nativeElement.selectionStart;
            if (keyCode === ARROW_LEFT_KEYCODE) {
                cursorPos = this._getCursorPositionOfPrevTimePartStart(cursorPos, this._elementRef.nativeElement.value);
            } else if (keyCode === ARROW_RIGHT_KEYCODE) {
                cursorPos = this._getCursorPositionOfNextTimePartStart(cursorPos, this._elementRef.nativeElement.value);
            }
            this._createSelectionOfTimeComponentInInput(cursorPos);
        }
    }

    /**
     * @description Microsoft EDGE doesn't support KeyboaedEvent.code thus we need this helper
     */
    private _getKeyCode(event: KeyboardEvent): string {
        return event.code || event.key;
    }

    private _createSelectionOfTimeComponentInInput(cursorPos: number): void {
        setTimeout(() => {
            const newEditParams = this._getTimeEditMetrics(cursorPos);
            this._elementRef.nativeElement.selectionStart = newEditParams.cursorStartPosition;
            this._elementRef.nativeElement.selectionEnd = newEditParams.cursorEndPosition;
        });
    }

    private _incrementTime(dateVal: Date,
                           whatToIncrement: TimeParts = TimeParts.seconds): Date {
        let { hours, minutes, seconds } = this._getTimeDigitsFromDate(dateVal);

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

        return <Date> this._getDateFromTimeDigits(hours, minutes, seconds);
    }

    /**
     * @description Decrement part of time
     */
    private _decrementTime(dateVal: Date,
                           whatToDecrement: TimeParts = TimeParts.seconds): Date {
        let { hours, minutes, seconds } = this._getTimeDigitsFromDate(dateVal);

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

        return <Date> this._getDateFromTimeDigits(hours, minutes, seconds);
    }

    private _getCursorPositionOfPrevTimePartStart(cursorPos: number, timeString: string): number {
        return cursorPos === 0 ? timeString.length : cursorPos - 1;
    }

    private _getCursorPositionOfNextTimePartStart(cursorPos: number,
                                                  timeString: string,
                                                  timeDevider: string = ':'): number {
        const nextDividerPos: number = timeString.indexOf(timeDevider, cursorPos);

        return nextDividerPos !== undefined ? nextDividerPos + 1 : 0;
    }

    /**
     * @description Get params for arrow-keys (up/down) time valie edit.
     * @param cursorPosition Current cursor position in timeString
     */
    private _getTimeEditMetrics(cursorPosition: number): {
        modifiedTimePart: TimeParts;
        cursorStartPosition: number;
        cursorEndPosition: number;
    } {
        const timeString: string = this._elementRef.nativeElement.value;
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
    private _getTimeStringFromDate(tempVal: Date,
                                   timeFormat: TimeFormats = DEFAULT_TIME_FORMAT): string {
        const hours: string = this._getNumberWithLeadingZero(tempVal.getHours());
        const minutes: string = this._getNumberWithLeadingZero(tempVal.getMinutes());
        const seconds: string = this._getNumberWithLeadingZero(tempVal.getSeconds());

        const formattedTimeGenerators = {
            [TimeFormats.HHmm]: () => `${hours}:${minutes}`,
            [TimeFormats.HHmmss]: () => `${hours}:${minutes}:${seconds}`
        };

        return formattedTimeGenerators[timeFormat]();
    }

    private _getParsedTimeParts(timeString: string): {
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
    private _getDateFromTimeDigits(hours: number, minutes: number, seconds: number = 0): Date | undefined {
        return this._getDateFromTimeString(`${hours}:${minutes}:${seconds}`);
    }

    private _getDateFromTimeString(timeString: string | undefined): Date | undefined {
        // TODO Use moment-js
        if (timeString === undefined) { return; }

        const {
            hoursOnly,
            hoursAndMinutes,
            hoursAndMinutesAndSeconds
        } = this._getParsedTimeParts(timeString);

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

    private _getNumberWithLeadingZero(digit: number): string {
        const MAX_DIGIT_WITH_LEADING_ZERO: number = 9;

        return digit > MAX_DIGIT_WITH_LEADING_ZERO ? `${digit}` : `0${digit}`;
    }

    private _getTimeDigitsFromDate(dateVal: Date): { hours: number; minutes: number; seconds: number } {
        return {
            hours: dateVal.getHours(),
            minutes: dateVal.getMinutes(),
            seconds: dateVal.getSeconds()
        };
    }

    private _parseValidator(): ValidationErrors | null {
        return this._currentDTimeInput === undefined ?
            { mcTimepickerParse: { text: this._elementRef.nativeElement.value } } :
            null;
    }

    private _minTimeValidator(): ValidationErrors | null {

        if (this._currentDTimeInput !== undefined &&
            this._minDTime !== undefined &&
            this._isTimeLowerThenMin(this._currentDTimeInput)) {
            return { mcTimepickerLowerThenMintime: { text: this._elementRef.nativeElement.value } };
        }

        return null;
    }

    private _maxTimeValidator(): ValidationErrors | null {
        if (this._currentDTimeInput !== undefined &&
            this._maxDTime !== undefined &&
            this._isTimeGreaterThenMax(this._currentDTimeInput)) {
            return { mcTimepickerHigherThenMaxtime: { text: this._elementRef.nativeElement.value } };
        }

        return null;
    }

    private _isTimeLowerThenMin(timeToCompare: Date): boolean {
        return timeToCompare.getTime() - (<Date> this._minDTime).getTime() < 0;
    }

    private _isTimeGreaterThenMax(timeToCompare: Date): boolean {
        return timeToCompare.getTime() - (<Date> this._maxDTime).getTime() >= 0;
    }
}
