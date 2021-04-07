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

export class DateDigit {
    constructor(public value: DateParts, public start: number, public length: number) {}

    get end(): number {
        return this.start + this.length;
    }
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

    private firstDigit: DateDigit;
    private secondDigit: DateDigit;
    private thirdDigit: DateDigit;

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
        return value
            .split(this.separator)
            .map((part: string) => part.replace(/^([0-9])\W$/, '0$1'))
            .join(this.separator);
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
        if (!timeString || timeString.length < this.firstDigit.length) { return null; }

        const defaultValue = this.value || this.dateAdapter.today();

        let year = this.dateAdapter.getYear(defaultValue);
        let month = this.dateAdapter.getMonth(defaultValue);
        let day = this.dateAdapter.getDate(defaultValue);
        const hours = this.dateAdapter.getHours(defaultValue);
        const minutes = this.dateAdapter.getMinutes(defaultValue);
        const seconds = this.dateAdapter.getSeconds(defaultValue);
        const milliseconds = this.dateAdapter.getMilliseconds(defaultValue);

        if (timeString.length === this.firstDigit.length) {
            if (this.firstDigit.value === DateParts.day) {
                day = parseInt(timeString);
            } else if (this.firstDigit.value === DateParts.month) {
                month = parseInt(timeString) - 1;
            } else if (this.firstDigit.value === DateParts.year) {
                year = parseInt(timeString);
            }
        } else if (timeString.length < this.dateFormats.dateInput.length) {
            return null;
        } else {
            const digits: number[] = timeString
                .split(this.separator)
                .map((value: string) => parseInt(value));

            day = digits[this.getDatePartPosition(DateParts.day)];
            month = digits[this.getDatePartPosition(DateParts.month)] - 1;
            year = digits[this.getDatePartPosition(DateParts.year)];
        }

        return this.getValidDateOrNull(
            this.dateAdapter.createDateTime(year, month, day, hours, minutes, seconds, milliseconds)
        );
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

    private getDateEditMetrics(cursorPosition: number): [
        modifiedTimePart: DateParts,
        cursorStartPosition: number,
        cursorEndPosition: number
    ] {
        for (const digit of [this.firstDigit, this.secondDigit, this.thirdDigit]) {
            if (cursorPosition >= digit.start && cursorPosition <= digit.end) {
                return [digit.value, digit.start, digit.end];
            }
        }
    }

    private incrementDate(dateVal: D, whatToIncrement: DateParts): D {
        console.log('incrementDate: '); // tslint:disable-line:no-console
        let year = this.dateAdapter.getYear(dateVal);
        let month = this.dateAdapter.getMonth(dateVal);
        let day = this.dateAdapter.getDate(dateVal);

        switch (whatToIncrement) {
            case DateParts.day:
                day++;

                if (day > this.dateAdapter.getNumDaysInMonth(dateVal)) {
                    day = 1;
                }

                break;
            case DateParts.month:
                month++;

                // tslint:disable-next-line:no-magic-numbers
                if (month > 11) {
                    month = 0;
                }

                const lastDay = this.getLastDayFor(year, month);

                if (day > lastDay) {
                    day = lastDay;
                }

                break;
            case DateParts.year:
                year++;

                break;
            default:
        }

        return this.createDate(year, month, day);
    }

    private getLastDayFor(year: number, month: number): number {
        return this.dateAdapter.getNumDaysInMonth(this.createDate(year, month, 1));
    }

    private decrementDate(dateVal: D, whatToDecrement: DateParts): D {
        console.log('decrementDate: '); // tslint:disable-line:no-console
        let year = this.dateAdapter.getYear(dateVal);
        let month = this.dateAdapter.getMonth(dateVal);
        let day = this.dateAdapter.getDate(dateVal);

        switch (whatToDecrement) {
            case DateParts.day:
                day--;

                if (day < 1) {
                    day = this.dateAdapter.getNumDaysInMonth(dateVal);
                }

                break;
            case DateParts.month:
                month--;

                if (month < 0) {
                    // tslint:disable-next-line:no-magic-numbers
                    month = 11;
                }

                const lastDay = this.getLastDayFor(year, month);

                if (day > lastDay) {
                    day = lastDay;
                }

                break;
            case DateParts.year:
                year--;

                break;
            default:
        }

        return this.createDate(year, month, day);
    }

    private verticalArrowKeyHandler(keyCode: number): void {
        if (!this.value) { return; }

        let changedTime;

        const [modifiedTimePart, selectionStart, selectionEnd] = this.getDateEditMetrics(this.selectionStart as number);

        if (keyCode === UP_ARROW) {
            changedTime = this.incrementDate(this.value, modifiedTimePart);
        }

        if (keyCode === DOWN_ARROW) {
            changedTime = this.decrementDate(this.value, modifiedTimePart);
        }

        this.value = changedTime;

        this.selectionStart = selectionStart;
        this.selectionEnd = selectionEnd;

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
            const [, selectionStart, selectionEnd] = this.getDateEditMetrics(cursorPos);

            this.selectionStart = selectionStart;
            this.selectionEnd = selectionEnd;
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

        formatInLowerCase
            .split('')
            .reduce(
                ({ prev, length, start }, value: string, index: number, arr) => {
                    if (value === this.separator || (arr.length - 1) === index) {
                        if (!this.firstDigit) {
                            this.firstDigit = new DateDigit(prev, start, length);
                        } else if (!this.secondDigit) {
                            this.secondDigit = new DateDigit(prev, start, length);
                        } else if (!this.thirdDigit) {
                            this.thirdDigit = new DateDigit(prev, start, arr.length - start);
                        }

                        // tslint:disable:no-parameter-reassignment
                        length = 0;
                        start = index + 1;
                    } else {
                        length++;
                    }

                    return { prev: value, length, start };
                },
                { length: 0, start: 0 }
            );

        if (!this.firstDigit || !this.secondDigit || !this.thirdDigit) {
            Error(`Can' t use this format: ${format}`);
        }
    }

    private getDatePartPosition(part: DateParts): number {
        return [this.firstDigit.value, this.secondDigit.value, this.thirdDigit.value].indexOf(part);
    }

    private createDate(year: number, month: number, day: number): D {
        return this.dateAdapter.createDateTime(
            year,
            month,
            day,
            this.dateAdapter.getHours(this.value as D),
            this.dateAdapter.getMinutes(this.value as D),
            this.dateAdapter.getSeconds(this.value as D),
            this.dateAdapter.getMilliseconds(this.value as D)
        );
    }
}
