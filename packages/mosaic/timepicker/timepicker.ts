import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    Directive,
    DoCheck,
    ElementRef,
    forwardRef,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Renderer2,
    Self
} from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    FormGroupDirective,
    NgControl,
    NgForm,
    ValidationErrors
} from '@angular/forms';
import { DateAdapter } from '@ptsecurity/cdk/datetime';
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

export class McTimepickerBase {
    constructor(
        public defaultErrorStateMatcher: ErrorStateMatcher,
        public parentForm: NgForm,
        public parentFormGroup: FormGroupDirective,
        public ngControl: NgControl
    ) {}
}

// tslint:disable-next-line naming-convention
export const McTimepickerMixinBase:
    CanUpdateErrorStateCtor & typeof McTimepickerBase = mixinErrorState(McTimepickerBase);

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
        '[attr.time-format]': 'timeFormat',
        '[attr.min-time]': 'minTime',
        '[attr.max-time]': 'maxTime',
        '[attr.value]': 'value',
        '[attr.aria-invalid]': 'errorState',

        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)',

        '(input)': 'onInput()',
        '(paste)': 'onPaste($event)',

        '(keydown)': 'onKeyDown($event)'
    },
    providers: [{
        provide: McFormFieldControl,
        useExisting: forwardRef(() => McTimepicker)
    }]
})
export class McTimepicker<D> extends McTimepickerMixinBase
    implements McFormFieldControl<any>, OnDestroy, DoCheck, CanUpdateErrorState, ControlValueAccessor {

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

    /** An object used to control when error messages are shown. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input() placeholder: string;

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

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get value(): string {
        return this.inputValueAccessor.value;
    }

    set value(value: string) {
        if (value !== this.value) {
            this.inputValueAccessor.value = value;
            this.applyInputChanges();
        }
    }

    @Input('time-format')
    get timeFormat(): TimeFormats {
        return this._timeFormat;
    }

    set timeFormat(formatValue: TimeFormats) {
        this._timeFormat = Object
            .keys(TimeFormats)
            .map((timeFormatKey) => TimeFormats[timeFormatKey])
            .indexOf(formatValue) > -1 ? formatValue : DEFAULT_TIME_FORMAT;

        this.placeholder = TIMEFORMAT_PLACEHOLDERS[this._timeFormat];

        setTimeout(() => this.applyInputChanges({ doTimestringReformat: true }));
    }

    private _timeFormat: TimeFormats;

    @Input('min-time')
    get minTime(): string | null {
        return this._minTime;
    }

    set minTime(value: string | null) {
        this._minTime = value;
        (this.ngControl.control as FormControl).updateValueAndValidity();
    }

    private _minTime: string | null = null;

    @Input('max-time')
    get maxTime(): string | null {
        return this._maxTime;
    }

    set maxTime(maxValue: string | null) {
        this._maxTime = maxValue;
        (this.ngControl.control as FormControl).updateValueAndValidity();
    }

    private _maxTime: string | null = null;

    private readonly uid = `mc-timepicker-${uniqueComponentIdSuffix++}`;
    private readonly inputValueAccessor: { value: any };

    private originalValue: any;
    private previousNativeValue: any;
    private currentDateTimeInput: D | undefined;

    private onChange: (value: any) => void;
    private onTouched: () => void;

    constructor(
        private readonly elementRef: ElementRef,
        @Optional() @Self() public ngControl: NgControl,
        @Optional() parentForm: NgForm,
        @Optional() parentFormGroup: FormGroupDirective,
        defaultErrorStateMatcher: ErrorStateMatcher,
        @Optional() @Self() @Inject(MC_INPUT_VALUE_ACCESSOR) inputValueAccessor: any,
        private readonly renderer: Renderer2,
        @Optional() private dateAdapter: DateAdapter<any>
    ) {
        super(defaultErrorStateMatcher, parentForm, parentFormGroup, ngControl);

        if (!this.dateAdapter) {
            throw Error(`McTimepicker: No provider found for DateAdapter. You must import one of the existing ` +
                `modules at your application root or provide a custom implementation or use exists ones.`);
        }

        // If no input value accessor was explicitly specified, use the element as the input value
        // accessor.
        this.inputValueAccessor = inputValueAccessor || this.elementRef.nativeElement;

        this.previousNativeValue = this.value;
        this.onChange = noop;

        // Force setter to be called in case id was not specified.
        this.id = this.id;

        this.placeholder = TIMEFORMAT_PLACEHOLDERS[DEFAULT_TIME_FORMAT];

        if (this.ngControl) {
            // Instead of NG_VALUE_ACCESSOR (https://github.com/angular/material2/issues/8158#issuecomment-344618103)
            this.ngControl.valueAccessor = this;

            // To avoid cyclic dependency https://stackoverflow.com/a/49578414
            const control = this.ngControl.control as FormControl;
            const myValidators = [
                () => this.parseValidator(),
                () => this.minTimeValidator(),
                () => this.maxTimeValidator()
            ];
            const validators = control.validator
                ? [control.validator, ...myValidators]
                : myValidators;

            control.setValidators(validators);
            control.updateValueAndValidity();
        }
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

        this.applyInputChanges({ doTimestringReformat: isAutocompleteTriggered });

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

    writeValue(value: D | null): void {
        if (value !== null) {
            this.saveOriginalValue(value);

            this.renderer.setProperty(
                this.elementRef.nativeElement,
                'value',
                this.getTimeStringFromDate(value, this.timeFormat)
            );

            this.applyInputChanges();
        }
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

    registerOnChange(fn: (value: D) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    saveOriginalValue(value: D): void {
        if (this.dateAdapter.isValid(value)) {
            this.originalValue = value;
        }
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

    private applyInputChanges(applyParams: { changedTime?: D; doTimestringReformat?: boolean } = {}): void {
        const { changedTime, doTimestringReformat = true } = applyParams;
        const timeToApply: D | undefined = changedTime ||
            this.getDateFromTimeString(this.elementRef.nativeElement.value);
        this.currentDateTimeInput = timeToApply;

        if (doTimestringReformat && timeToApply !== undefined) {
            const selectionStart: number = this.elementRef.nativeElement.selectionStart;
            const selectionEnd: number = this.elementRef.nativeElement.selectionEnd;
            this.renderer.setProperty(
                this.elementRef.nativeElement,
                'value',
                this.getTimeStringFromDate(timeToApply, this.timeFormat)
            );
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

        let changedTime: D | undefined = this.currentDateTimeInput;
        if (changedTime !== undefined) {
            const cursorPos = this.elementRef.nativeElement.selectionStart;

            const modifiedTimePart = this.getTimeEditMetrics(cursorPos)
                .modifiedTimePart;
            const keyCode: string = this.getKeyCode(event);
            if (keyCode === ARROW_UP_KEYCODE) { changedTime = this.incrementTime(changedTime, modifiedTimePart); }
            if (keyCode === ARROW_DOWN_KEYCODE) { changedTime = this.decrementTime(changedTime, modifiedTimePart); }
            this.applyInputChanges({ changedTime });
            this.createSelectionOfTimeComponentInInput(cursorPos);
        }
    }

    private switchSelectionBetweenTimeparts(event: KeyboardEvent): void {
        const changedTime: D | undefined = this.currentDateTimeInput;
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

    private incrementTime(dateVal: D, whatToIncrement: TimeParts = TimeParts.seconds): D {
        let { hours, minutes, seconds } = this.getTimeDigitsFromDate(dateVal);

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

        return <D> this.getDateFromTimeDigits(hours, minutes, seconds);
    }

    /**
     * @description Decrement part of time
     */
    private decrementTime(dateVal: D, whatToDecrement: TimeParts = TimeParts.seconds): D {
        let { hours, minutes, seconds } = this.getTimeDigitsFromDate(dateVal);

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

        return <D> this.getDateFromTimeDigits(hours, minutes, seconds);
    }

    private getCursorPositionOfPrevTimePartStart(cursorPos: number, timeString: string): number {
        return cursorPos === 0 ? timeString.length : cursorPos - 1;
    }

    private getCursorPositionOfNextTimePartStart(
        cursorPos: number, timeString: string, timeDevider: string = ':'
    ): number {
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
    private getTimeStringFromDate(value: D, timeFormat: TimeFormats = DEFAULT_TIME_FORMAT): string {
        if (value === undefined || value === null) {
            return '';
        }

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

        const convertedTimeString = momentWrappedTime !== null
            ? momentWrappedTime.format('H:m:s')
            : '';

        const hoursAndMinutesAndSeconds = convertedTimeString.match(HOURS_MINUTES_SECONDS_REGEXP);
        const hoursAndMinutes = convertedTimeString.match(HOURS_MINUTES_REGEXP);
        const hoursOnly = convertedTimeString.match(HOURS_ONLY_REGEXP);

        return {
            hoursOnly,
            hoursAndMinutes,
            hoursAndMinutesAndSeconds
        };
    }

    /**
     * @description Create Date object from separate parts of time
     */
    private getDateFromTimeDigits(hours: number, minutes: number, seconds: number = 0): D | undefined {
        return this.getDateFromTimeString(`${hours}:${minutes}:${seconds}`);
    }

    private getDateFromTimeString(timeString: string): D | undefined {
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

        const resultDate: D = this.dateAdapter.createDateTime(
            this.dateAdapter.getYear(this.originalValue),
            this.dateAdapter.getMonth(this.originalValue),
            this.dateAdapter.getDate(this.originalValue),
            hours,
            minutes,
            seconds,
            0
        );

        return this.dateAdapter.isValid(resultDate) ? resultDate : undefined;
    }

    private getTimeDigitsFromDate(dateVal: D): { hours: number; minutes: number; seconds: number } {
        return {
            hours: this.dateAdapter.getHours(dateVal),
            minutes: this.dateAdapter.getMinutes(dateVal),
            seconds: this.dateAdapter.getSeconds(dateVal)
        };
    }

    private parseValidator(): ValidationErrors | null {
        return this.currentDateTimeInput === undefined ?
            { mcTimepickerParse: { text: this.elementRef.nativeElement.value } } :
            null;
    }

    private minTimeValidator(): ValidationErrors | null {
        if (
            this.minTime &&
            this.currentDateTimeInput !== undefined &&
            this.isTimeLowerThenMin(this.currentDateTimeInput)
        ) {
            return { mcTimepickerLowerThenMintime: { text: this.elementRef.nativeElement.value } };
        }

        return null;
    }

    private maxTimeValidator(): ValidationErrors | null {
        if (
            this.maxTime &&
            this.currentDateTimeInput !== undefined &&
            this.isTimeGreaterThenMax(this.currentDateTimeInput)
        ) {
            return { mcTimepickerHigherThenMaxtime: { text: this.elementRef.nativeElement.value } };
        }

        return null;
    }

    private isTimeLowerThenMin(timeToCompare: D): boolean {
        if (timeToCompare === undefined || timeToCompare ===  null || this.minTime === null) {
            return false;
        }

        return this.dateAdapter.compareDateTime(timeToCompare, this.getDateFromTimeString(this.minTime)) < 0;
    }

    private isTimeGreaterThenMax(timeToCompare: D): boolean {
        if (timeToCompare === undefined || timeToCompare ===  null || this.maxTime === null) {
            return false;
        }

        return this.dateAdapter.compareDateTime(timeToCompare, this.getDateFromTimeString(this.maxTime)) >= 0;
    }
}
