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
    NgControl,
    NgForm
} from '@angular/forms';
import { noop, Subject } from 'rxjs';

import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';
import {
    CanUpdateErrorState,
    ErrorStateMatcher,
    mixinErrorState
} from '@ptsecurity/mosaic/core';
import { McFormFieldControl } from '@ptsecurity/mosaic/form-field';

import {
    getDateFromTimeString,
    getTimeStringFromDate,
    decrementTime,
    incrementTime,
    DEFAULT_TIME_FORMAT,
    getTimeEditState,
    TimeFormats,
    getCursorPositionOfNextTimePartStart,
    getCursorPositionOfPrevTimePartStart,
    getParsedTimeParts
} from './timepicker.helpers';


const ARROW_UP_KEYCODE: string = 'ArrowUp';
const ARROW_DOWN_KEYCODE: string = 'ArrowDown';
const ARROW_LEFT_KEYCODE: string = 'ArrowLeft';
const ARROW_RIGHT_KEYCODE: string = 'ArrowRight';

let uniqueComponentIdSuffix: number = 0;

export const MC_INPUT_VALUE_ACCESSOR =
    new InjectionToken<{ value: any }>('MC_INPUT_VALUE_ACCESSOR');

export class McTimepickerBase {
    constructor(
        public _defaultErrorStateMatcher: ErrorStateMatcher,
        public _parentForm: NgForm,
        public _parentFormGroup: FormGroupDirective,
        public ngControl: NgControl) { }
}

export const McTimepickerMixinBase = mixinErrorState(McTimepickerBase);

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
        '[attr.value]': 'value',
        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)',
        '(input)': 'onInput()',
        '(keydown)': 'onKeyDown($event)'
    },
    providers: [
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

    static readonly TIMEFORMAT_PLACEHOLDERS: { [timeFormat: string]: string } = {
        'hh:mm:ss': '  :  :  ',
        'hh:mm': '  :  '
    };

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
        if (this.ngControl && this.ngControl.disabled !== null) {
            return this.ngControl.disabled;
        }

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
            this.stateChanges.next();
        }
    }

    @Input('time-format')
    get timeFormat(): TimeFormats { return this._timeFormat; }

    set timeFormat(formatValue: TimeFormats) {
        this._timeFormat = Object
            .keys(TimeFormats)
            .map((timeFormatKey) => TimeFormats[timeFormatKey])
            .indexOf(formatValue) > -1 ? formatValue : DEFAULT_TIME_FORMAT;

        this.placeholder = McTimepicker.TIMEFORMAT_PLACEHOLDERS[this._timeFormat.toLowerCase()];
    }

    private _id: string;
    private readonly _uid = `mc-timepicker-${uniqueComponentIdSuffix++}`;
    private _disabled: boolean;
    private _required: boolean;
    private _previousNativeValue: any;
    private readonly _inputValueAccessor: { value: any };
    private _onChange: (value: any) => void;
    private _onTouched: () => void;
    private _timeFormat: TimeFormats;

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

    onInput() {
        const initialCursorStart: number = this._elementRef.nativeElement.selectionStart;
        const initialCursorEnd: number = this._elementRef.nativeElement.selectionEnd;
        let isAutocompleteTriggered: boolean = false;

        const {
            hoursOnly,
            hoursAndMinutes,
            hoursAndMinutesAndSeconds
        } = getParsedTimeParts(this._elementRef.nativeElement.value);

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
                getTimeStringFromDate(value, this.timeFormat)
            );
        }
        this._onChange(value || null);
        this.stateChanges.next();
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

        const timeToApply = changedTime || getDateFromTimeString(this._elementRef.nativeElement.value);

        if (doTimestringReformat && timeToApply !== undefined) {
            this._renderer.setProperty(
                this._elementRef.nativeElement,
                'value',
                getTimeStringFromDate(timeToApply, this.timeFormat));
        }

        (<FormControl> this.ngControl.control).updateValueAndValidity();
        const result = this.ngControl.errors === null && timeToApply !== undefined ? timeToApply : null;
        this._onChange(result);
        this.stateChanges.next();
    }

    private _upDownTimeByArrowKeys(event: KeyboardEvent): void {
        event.preventDefault();

        let changedTime: Date | undefined = getDateFromTimeString(this._elementRef.nativeElement.value);
        if (changedTime !== undefined) {
            const cursorPos = this._elementRef.nativeElement.selectionStart;

            const modifiedTimePart = getTimeEditState(cursorPos, this._elementRef.nativeElement.value)
                .modifiedTimePart;
            const keyCode: string = this._getKeyCode(event);
            if (keyCode === ARROW_UP_KEYCODE) { changedTime = incrementTime(changedTime, modifiedTimePart); }
            if (keyCode === ARROW_DOWN_KEYCODE) { changedTime = decrementTime(changedTime, modifiedTimePart); }
            this._applyInputChanges({ changedTime });
            this._createSelectionOfTimeComponentInInput(cursorPos);
        }
    }

    private _switchSelectionBetweenTimeparts(event: KeyboardEvent): void {
        const changedTime: Date | undefined = getDateFromTimeString(this._elementRef.nativeElement.value);
        const keyCode: string = this._getKeyCode(event);

        if (changedTime !== undefined) {
            let cursorPos: number = this._elementRef.nativeElement.selectionStart;
            if (keyCode === ARROW_LEFT_KEYCODE) {
                cursorPos = getCursorPositionOfPrevTimePartStart(cursorPos, this._elementRef.nativeElement.value);
            } else if (keyCode === ARROW_RIGHT_KEYCODE) {
                cursorPos = getCursorPositionOfNextTimePartStart(cursorPos, this._elementRef.nativeElement.value);
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
            const newEditParams = getTimeEditState(cursorPos, this._elementRef.nativeElement.value);
            this._elementRef.nativeElement.selectionStart = newEditParams.cursorStartPosition;
            this._elementRef.nativeElement.selectionEnd = newEditParams.cursorEndPosition;
        });
    }
}
