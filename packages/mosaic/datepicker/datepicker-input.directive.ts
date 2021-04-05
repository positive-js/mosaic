// @ts-nocheck

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
    Output,
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
import { DateAdapter, MC_DATE_FORMATS, McDateFormats } from '@ptsecurity/cdk/datetime';
import {
    BACKSPACE,
    DELETE,
    UP_ARROW,
    RIGHT_ARROW,
    DOWN_ARROW,
    LEFT_ARROW,
    END,
    PAGE_DOWN,
    HOME,
    PAGE_UP,
    SPACE,
    TAB,
    ESCAPE,
    hasModifierKey,
    isHorizontalMovement,
    isLetterKey,
    isVerticalMovement
} from '@ptsecurity/cdk/keycodes';
import { validationTooltipHideDelay, validationTooltipShowDelay } from '@ptsecurity/mosaic/core';
import { McFormFieldControl } from '@ptsecurity/mosaic/form-field';
import { McTooltip } from '@ptsecurity/mosaic/tooltip';
import { Subject, Subscription } from 'rxjs';

import { createMissingDateImplError } from './datepicker-errors';
import { McDatepicker } from './datepicker.component';


// tslint:disable:naming-convention
export enum DateParts {
    year = 'y',
    month = 'm',
    day = 'd'
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
        let newValue = this.dateAdapter.deserialize(value);

        this.lastValueValid = !newValue || this.dateAdapter.isValid(newValue);

        newValue = this.getValidDateOrNull(newValue);

        const oldDate = this.value;
        this._value = newValue;
        this.formatValue(newValue);

        if (!this.dateAdapter.sameDate(oldDate, newValue)) {
            this.valueChange.emit(newValue);
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

    @Input()
    set mcValidationTooltip(tooltip: McTooltip) {
        if (!tooltip) { return; }

        tooltip.mcMouseEnterDelay = validationTooltipShowDelay;
        tooltip.mcTrigger = 'manual';
        tooltip.mcTooltipClass = 'mc-tooltip_warning';

        tooltip.initElementRefListeners();

        this.incorrectInput.subscribe(() => {
            if (tooltip.isTooltipOpen) { return; }

            tooltip.show();

            setTimeout(() => tooltip.hide(), validationTooltipHideDelay);
        });
    }

    @Output() incorrectInput = new EventEmitter<void>();

    /** Emits when a `change` event is fired on this `<input>`. */
    @Output() readonly dateChange = new EventEmitter<McDatepickerInputEvent<D>>();

    /** Emits when an `input` event is fired on this `<input>`. */
    @Output() readonly dateInput = new EventEmitter<McDatepickerInputEvent<D>>();

    get empty(): boolean {
        return !this.viewValue && !this.isBadInput();
    }

    get viewValue(): string {
        return this.elementRef.nativeElement.value;
    }

    get ngControl(): any {
        return this.control;
    }

    get isReadOnly(): boolean {
        return this.elementRef.nativeElement.readOnly;
    }

    private get selectionStart(): number | null {
        return this.elementRef.nativeElement.selectionStart;
    }

    private set selectionStart(value: number | null) {
        this.elementRef.nativeElement.selectionStart = value;
    }

    private get selectionEnd(): number | null {
        return this.elementRef.nativeElement.selectionEnd;
    }

    private set selectionEnd(value: number | null) {
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

    private separator: string;

    private positionOfDay: number;
    private positionOfMonth: number;
    private positionOfYear: number;

    private firstDigit: DateParts;
    private secondDigit: DateParts;
    private thirdDigit: DateParts;

    constructor(
        public elementRef: ElementRef<HTMLInputElement>,
        @Optional() public dateAdapter: DateAdapter<D>,
        private renderer: Renderer2,
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

        this.separator = dateFormats.dateInput.match(/[aA-zZ]+(?<separator>\W|\D)[aA-zZ]+/).groups.separator;

        this.getDigitPositions(dateFormats.dateInput);

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
        if (this.isReadOnly) { return; }

        // tslint:disable-next-line: deprecation
        const keyCode = event.keyCode;

        if (isLetterKey(event) && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();

            this.incorrectInput.emit();
        } else if (
            (event.altKey && [UP_ARROW, DOWN_ARROW].includes(keyCode)) ||
            [TAB, ESCAPE].includes(keyCode)
        ) {
            this.datepickerStateHandler(keyCode);
        } else if (
            (hasModifierKey(event) && (isVerticalMovement(keyCode) || isHorizontalMovement(keyCode))) ||
            event.ctrlKey || event.metaKey ||
            [DELETE, BACKSPACE].includes(keyCode)
        ) {
            return;
        } else if (keyCode === SPACE) {
            // this.spaceKeyHandler(event);
        } else if ([UP_ARROW, DOWN_ARROW].includes(keyCode)) {
            event.preventDefault();

            this.verticalArrowKeyHandler(keyCode);
        } else if ([LEFT_ARROW, RIGHT_ARROW, HOME, PAGE_UP, END, PAGE_DOWN].includes(keyCode)) {
            event.preventDefault();

            this.changeCaretPosition(keyCode);
        } else if (/^\D$/.test(event.key)) {
            console.log('/^\\D$/.test(event.key): '); // tslint:disable-line:no-console
            event.preventDefault();

            const newValue = this.getNewValue(event.key, this.selectionStart as number);
            const formattedValue = this.replaceSymbols(newValue);

            if (newValue !== formattedValue) {
                this.setViewValue(formattedValue);

                setTimeout(this.onInput);
            } else {
                this.incorrectInput.emit();
            }
        } else {
            setTimeout(this.onInput);
        }
    }

    onInput = () => {
        console.log('onInput: '); // tslint:disable-line:no-console
        const formattedValue = this.formatUserInput(this.viewValue);

        const newTimeObj = this.getDateFromString(formattedValue);
        this.lastValueValid = !!newTimeObj;

        if (!newTimeObj) {
            this.control.updateValueAndValidity();

            return;
        }

        const selectionStart = this.selectionStart;
        const selectionEnd = this.selectionEnd;

        this.setViewValue(this.getTimeStringFromDate(newTimeObj, this.dateFormats.dateInput));

        this.selectionStart = selectionStart;
        this.selectionEnd = selectionEnd;

        this.createSelectionOfTimeComponentInInput((selectionStart as number) + 1);

        this.value = newTimeObj;
        this.onChange();
        this.stateChanges.next();
    }

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

    private getNewValue(key: string, position: number) {
        return [this.viewValue.slice(0, position), key, this.viewValue.slice(position)].join('');
    }

    private setViewValue(value: string) {
        this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);
    }

    private replaceSymbols(value: string): string {
        let formattedValue: string = value;

        const match: RegExpMatchArray | null = value.match(/^(\d\d:){0,2}(?<number>[0-9])(?<symbol>\W)(:\d\d){0,2}$/);

        if (match?.groups) {
            const { number, symbol } = match.groups;

            formattedValue = value.replace(number + symbol, `0${number}`);
        }

        return formattedValue;
    }

    private formatUserInput(value: string): string {
        return this.replaceNumbers(this.replaceSymbols(value));
    }

    private replaceNumbers(value: string): string {

        return value;
        // let formattedValue: string = value;

        // const match: RegExpMatchArray | null = value.match(/^(?<hours>\d{0,4}):?(?<minutes>\d{0,4}):?(?<seconds>\d{0,4})$/);
        //
        // if (match?.groups) {
        //     const { hours, minutes, seconds } = match.groups;
        //
        //     if (hours.length && parseInt(hours) > HOURS_PER_DAY) {
        //         formattedValue = formattedValue.replace(hours, HOURS_PER_DAY.toString());
        //     }
        //
        //     if (minutes.length && parseInt(minutes) > MINUTES_PER_HOUR) {
        //         formattedValue = formattedValue.replace(minutes, MINUTES_PER_HOUR.toString());
        //     }
        //
        //     if (seconds.length && parseInt(seconds) > SECONDS_PER_MINUTE) {
        //         formattedValue = formattedValue.replace(seconds, SECONDS_PER_MINUTE.toString());
        //     }
        // }
        //
        // return formattedValue;
    }

    private getDateFromString(timeString: string): D | null {
        console.log('getDateFromString: '); // tslint:disable-line:no-console
        if (!timeString) { return null; }

        let resultDate;

        if (this.firstDigit === DateParts.day) {
            if (timeString.length < 2) { return null; }

            resultDate = this.dateAdapter.createDateTime(
                this.dateAdapter.getYear(this.value as D),
                this.dateAdapter.getMonth(this.value as D),
                timeString as number,
                this.dateAdapter.getHours(this.value as D),
                this.dateAdapter.getMinutes(this.value as D),
                this.dateAdapter.getSeconds(this.value as D),
                this.dateAdapter.getMilliseconds(this.value as D)
            );
        } else if (this.firstDigit === DateParts.month) {
            if (timeString.length < 2) { return null; }

            resultDate = this.dateAdapter.createDateTime(
                this.dateAdapter.getYear(this.value as D),
                timeString as number,
                this.dateAdapter.getDate(this.value as D),
                this.dateAdapter.getHours(this.value as D),
                this.dateAdapter.getMinutes(this.value as D),
                this.dateAdapter.getSeconds(this.value as D),
                this.dateAdapter.getMilliseconds(this.value as D)
            );
        } else if (this.firstDigit === DateParts.year) {
            if (timeString.length < 2) { return null; }

            resultDate = this.dateAdapter.createDateTime(
                timeString as number,
                this.dateAdapter.getMonth(this.value as D),
                this.dateAdapter.getDate(this.value as D),
                this.dateAdapter.getHours(this.value as D),
                this.dateAdapter.getMinutes(this.value as D),
                this.dateAdapter.getSeconds(this.value as D),
                this.dateAdapter.getMilliseconds(this.value as D)
            );
        }

        return this.getValidDateOrNull(resultDate);
    }

    private getTimeStringFromDate(value: D | null, timeFormat: string): string {
        if (!value || !this.dateAdapter.isValid(value)) { return ''; }

        return this.dateAdapter.format(value, timeFormat);
    }

    // @ts-ignore
    private updateView() {
        const formattedValue = this.getTimeStringFromDate(this.value, this.dateFormats.dateInput);

        this.setViewValue(formattedValue);
    }

    private getDateEditMetrics(cursorPosition: number): {
        modifiedTimePart: DateParts;
        cursorStartPosition: number;
        cursorEndPosition: number;
    } {
        const timeString: string = this.viewValue;
        let modifiedTimePart: DateParts;
        let cursorStartPosition: number;
        let cursorEndPosition: number;

        const hoursIndex = 0;
        const minutesIndex = timeString.indexOf(this.separator, hoursIndex + 1);
        const secondsIndex = minutesIndex !== -1 ? timeString.indexOf(this.separator, minutesIndex + 1) : -1;

        if (secondsIndex !== -1 && cursorPosition > secondsIndex) {
            modifiedTimePart = DateParts.day;
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

    private incrementTime(dateVal: D, whatToIncrement: DateParts): D {
        console.log('incrementTime: '); // tslint:disable-line:no-console
        let year = this.dateAdapter.getYear(dateVal);
        let month = this.dateAdapter.getMonth(dateVal);
        let date = this.dateAdapter.getDate(dateVal);

        switch (whatToIncrement) {
            case DateParts.day:
                year++;
                break;
            case DateParts.month:
                month++;

                // tslint:disable-next-line:no-magic-numbers
                if (month > 11) {
                    month = 0;
                }

                break;
            case DateParts.year:
                date++;

                if (date > this.dateAdapter.getNumDaysInMonth(dateVal)) {
                    date = 1;
                }

                break;
            default:
        }

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

    private decrementTime(dateVal: D, whatToDecrement: DateParts): D {
        console.log('decrementTime: '); // tslint:disable-line:no-console
        let year = this.dateAdapter.getYear(dateVal);
        let month = this.dateAdapter.getMonth(dateVal);
        let date = this.dateAdapter.getDate(dateVal);

        switch (whatToDecrement) {
            case DateParts.day:
                year--;
                break;
            case DateParts.month:
                month--;

                // tslint:disable-next-line:no-magic-numbers
                if (month < 0) { month = 11; }

                break;
            case DateParts.year:
                date--;

                if (date < 1) { date = this.dateAdapter.getNumDaysInMonth(dateVal); }

                break;
            default:
        }

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

        const newEditParams = this.getDateEditMetrics(this.selectionStart as number);

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

    private changeCaretPosition(keyCode: number): void {
        if (!this.value) { return; }

        let cursorPos = this.selectionStart as number;

        if ([HOME, PAGE_UP].includes(keyCode)) {
            cursorPos = 0;
        } else if ([END, PAGE_DOWN].includes(keyCode)) {
            cursorPos = this.viewValue.length;
        } else if (keyCode === LEFT_ARROW) {
            cursorPos = cursorPos === 0 ? this.viewValue.length : cursorPos - 1;
        } else if (keyCode === RIGHT_ARROW) {
            const nextSeparatorPos: number = this.viewValue.indexOf(this.separator, cursorPos);

            cursorPos = nextSeparatorPos ? nextSeparatorPos + 1 : 0;
        }

        this.createSelectionOfTimeComponentInInput(cursorPos);
    }

    private createSelectionOfTimeComponentInInput(cursorPos: number): void {
        setTimeout(() => {
            const newEditParams = this.getDateEditMetrics(cursorPos);

            this.selectionStart = newEditParams.cursorStartPosition;
            this.selectionEnd = newEditParams.cursorEndPosition;
        });
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
        const formattedValue = value ? this.dateAdapter.format(value, this.dateFormats.dateInput) : '';

        this.setViewValue(formattedValue);
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

    private datepickerStateHandler(keyCode: number) {
        if ([DOWN_ARROW].includes(keyCode)) {
            this.datepicker.open();
        } else if (keyCode === TAB) {
            this.datepicker.close(false);
        } else if ([UP_ARROW, ESCAPE].includes(keyCode)) {
            this.datepicker.close();
        }
    }

    private getDigitPositions(format: string) {
        const formatInLowerCase = format.toLowerCase();

        this.positionOfDay = formatInLowerCase.search('d');


        if (this.positionOfDay === -1) {
            Error('Format should have day');
        }

        this.positionOfMonth = formatInLowerCase.search('m');

        if (this.positionOfMonth === -1) {
            Error('Format should have month');
        }

        this.positionOfYear = formatInLowerCase.search('y');

        if (this.positionOfYear === -1) {
            Error('Format should have year');
        }

        [this.firstDigit, this.secondDigit, this.thirdDigit] = [
            ...Array.from(new Set(formatInLowerCase as DateParts[]))
            .filter((char: DateParts) => [DateParts.year, DateParts.month, DateParts.day].includes(char))
        ];
    }
}
