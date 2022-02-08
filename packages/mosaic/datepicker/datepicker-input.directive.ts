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
import { McWarningTooltipTrigger } from '@ptsecurity/mosaic/tooltip';
import { Subject, Subscription } from 'rxjs';

import { createMissingDateImplError } from './datepicker-errors';
import { McDatepicker } from './datepicker.component';


// tslint:disable:naming-convention
enum DateParts {
    year = 'y',
    month = 'm',
    day = 'd'
}

export const MAX_YEAR = 9999;
const YEAR_LENGTH = 4;

class DateDigit {
    maxDays = 31;
    maxMonth = 12;

    parse: (value: string) => number;

    constructor(public value: DateParts, public start: number, public length: number) {
        if (value === DateParts.day) {
            this.parse = this.parseDay;
        } else if (value === DateParts.month) {
            this.parse = this.parseMonth;
        } else if (value === DateParts.year) {
            this.parse = this.parseYear;
        }
    }

    get end(): number {
        return this.start + this.length;
    }

    get isDay(): boolean {
        return this.value === DateParts.day;
    }

    get isMonth(): boolean {
        return this.value === DateParts.month;
    }

    get isYear(): boolean {
        return this.value === DateParts.year;
    }

    get fullName(): string {
        if (this.isDay) { return 'date'; }

        if (this.isMonth) { return 'month'; }

        if (this.isYear) { return 'year'; }
    }

    private parseDay(value: string): number {
        const parsedValue: number = parseInt(value);

        if (parsedValue === 0) { return 1; }

        if (parsedValue > this.maxDays) { return this.maxDays; }

        return parsedValue;
    }

    private parseMonth(value: string): number {
        const parsedValue: number = parseInt(value);

        if (parsedValue === 0) { return 1; }

        if (parsedValue > this.maxMonth) { return this.maxMonth; }

        return parsedValue;
    }

    private parseYear(value: string): number {
        const parsedValue: number = parseInt(value);

        if (parsedValue === 0) { return 1; }

        if (parsedValue > MAX_YEAR) { return parseInt(value.substring(0, YEAR_LENGTH)); }

        return parsedValue;
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

let uniqueComponentIdSuffix = 0;


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
        '[attr.min]': 'min ? toISO8601(min) : null',
        '[attr.max]': 'max ? toISO8601(max) : null',
        '[attr.autocomplete]': '"off"',

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

    private _disabled: boolean = false;

    @Input()
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value || this.uid;
    }

    private _id: string;

    @Input()
    set mcValidationTooltip(tooltip: McWarningTooltipTrigger) {
        if (!tooltip) { return; }

        tooltip.enterDelay = validationTooltipShowDelay;
        tooltip.trigger = 'manual';

        tooltip.initListeners();

        this.incorrectInput.subscribe(() => {
            if (tooltip.isOpen) { return; }

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
    private readonly validator: ValidatorFn | null;

    private separator: string;

    private firstDigit: DateDigit;
    private secondDigit: DateDigit;
    private thirdDigit: DateDigit;

    private separatorPositions: number[];

    constructor(
        public elementRef: ElementRef<HTMLInputElement>,
        private readonly renderer: Renderer2,
        @Optional() private readonly dateAdapter: DateAdapter<D>,
        @Optional() @Inject(MC_DATE_FORMATS) private readonly dateFormats: McDateFormats
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

        this.setFormat(dateFormats.dateInput);

        this.localeSubscription = dateAdapter.localeChanges
            .subscribe(this.updateLocaleParams);
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

        if (this.isLetterKey(event)) {
            event.preventDefault();

            this.incorrectInput.emit();
        } else if (this.isKeyForOpen(event)) {
            event.preventDefault();

            this.datepicker?.open();
        } else if (this.isKeyForClose(event)) {
            event.preventDefault();

            this.datepicker.close();
        } else if (keyCode === TAB) {
            this.datepicker.close(false);
        } else if (this.isKeyForByPass(event)) {
            return;
        } else if (keyCode === SPACE) {
            this.spaceKeyHandler(event);
        } else if ([UP_ARROW, DOWN_ARROW].includes(keyCode)) {
            event.preventDefault();

            this.verticalArrowKeyHandler(keyCode);
        } else if ([LEFT_ARROW, RIGHT_ARROW, HOME, PAGE_UP, END, PAGE_DOWN].includes(keyCode)) {
            event.preventDefault();

            this.changeCaretPosition(keyCode);
        } else if (/^\D$/.test(event.key)) {
            event.preventDefault();

            const newValue = this.getNewValue(event.key, this.selectionStart as number);
            const formattedValue = this.replaceSymbols(newValue);

            if (newValue !== formattedValue) {
                this.setViewValue(formattedValue, true);

                setTimeout(this.onInput);
            } else {
                this.incorrectInput.emit();
            }
        } else {
            setTimeout(this.onInput);
        }
    }

    onInput = () => {
        this.correctCursorPosition();
        const formattedValue = this.replaceSymbols(this.viewValue);

        const newTimeObj = this.getDateFromString(formattedValue);
        this.lastValueValid = !!newTimeObj;

        if (!newTimeObj) {
            if (!this.viewValue) {
                this._value = null;
                this.cvaOnChange(null);
            }
            this.control.updateValueAndValidity({ emitEvent: false });

            return;
        }

        this.setViewValue(this.getTimeStringFromDate(newTimeObj, this.dateFormats.dateInput), true);

        this.selectNextDigitByCursor((this.selectionStart as number));

        this.updateValue(newTimeObj);
    }

    parseOnBlur = () => {
        if (!this.viewValue) { return null; }

        const date = this.getDefaultValue();

        const viewDigits: string[] = this.viewValue
            .split(this.separator)
            .map((value: string) => value)
            .filter((value) => value);

        const [firsViewDigit, secondViewDigit, thirdViewDigit] = viewDigits;

        // tslint:disable-next-line:no-magic-numbers
        if (viewDigits.length !== 3) {
            this.lastValueValid = false;
            this._value = null;

            return setTimeout(() => this.control.updateValueAndValidity());
        }

        date[this.firstDigit.fullName] = this.firstDigit.parse(firsViewDigit);
        date[this.secondDigit.fullName] = this.secondDigit.parse(secondViewDigit);
        date[this.thirdDigit.fullName] = this.thirdDigit.parse(thirdViewDigit);

        const [digitWithYear, viewDigitWithYear] = [this.firstDigit, this.secondDigit, this.thirdDigit]
            .reduce((acc, digit, index) => digit.value === DateParts.year ? [digit, viewDigits[index]] : acc, []);

        // tslint:disable-next-line:no-magic-numbers
        if (viewDigitWithYear.length < 3) {
            // tslint:disable-next-line:no-magic-numbers
            date.year += date.year < 30 ? 2000 : 1900;
        } else if (viewDigitWithYear.length < digitWithYear.length) {
            this.lastValueValid = false;
            this._value = null;

            return setTimeout(() => this.control.updateValueAndValidity());
        }

        if (Object.values(date).some(isNaN)) {
            return;
        }

        const newTimeObj = this.getValidDateOrNull(this.dateAdapter.createDateTime(
            date.year, date.month - 1, date.date, date.hours, date.minutes, date.seconds, date.milliseconds
        ));

        if (!newTimeObj) {
            this.lastValueValid = false;
            this._value = null;
            this.cvaOnChange(null);

            return setTimeout(() => this.control.updateValueAndValidity());
        }

        this.lastValueValid = !!newTimeObj;

        this.setViewValue(this.getTimeStringFromDate(newTimeObj, this.dateFormats.dateInput), true);

        this.updateValue(newTimeObj);
    }

    onChange() {
        this.dateChange.emit(new McDatepickerInputEvent(this, this.elementRef.nativeElement));
    }

    /** Handles blur events on the input. */
    onBlur() {
        // Reformat the input only if we have a valid value.
        this.parseOnBlur();

        this.focusChanged(false);
    }

    onPaste($event) {
        $event.preventDefault();

        let rawValue = $event.clipboardData.getData('text');

        if (rawValue.match(/^\d\D/)) {
            rawValue = `0${rawValue}`;
        }
        rawValue.replace(/[^A-Za-z0-9]+/g, this.separator);

        if (/[a-z]/gi.test(rawValue)) {
            this.incorrectInput.emit();
        }

        const match: RegExpMatchArray | null = rawValue.match(/^(?<first>\d+)\W(?<second>\d+)\W(?<third>\d+)$/);

        if (!match?.groups?.first || !match?.groups?.second || !match?.groups?.third) {
            this.setViewValue(rawValue);

            return rawValue;
        }

        const value = [match.groups.first, match.groups.second, match.groups.third].join(this.separator);

        const newTimeObj = this.getDateFromString(value);

        if (!newTimeObj) {
            this.setViewValue(value);

            return value;
        }

        this.setViewValue(this.getTimeStringFromDate(newTimeObj, this.dateFormats.dateInput));

        this.updateValue(newTimeObj);
    }

    toISO8601(value: D): string {
        return this.dateAdapter.toIso8601(value);
    }

    private updateLocaleParams = () => {
        this.setFormat(this.dateFormats.dateInput);

        this.value = this.value;
    }

    private setFormat(format: string): void {
        this.separator = format.match(/[aA-zZ]+(?<separator>\W|\D)[aA-zZ]+/)!.groups.separator;
        this.separatorPositions = format
            .split('')
            .reduce((acc, item, index: number) => this.separator === item ? [...acc, index + 1] : acc, []);

        this.getDigitPositions(format);
    }

    private updateValue(newValue: D) {
        if (!this.dateAdapter.sameDate(newValue, this.value)) {
            this._value = newValue;
            this.cvaOnChange(newValue);
            this.valueChange.emit(newValue);
            this.dateInput.emit(new McDatepickerInputEvent(this, this.elementRef.nativeElement));
        }

        this.control.updateValueAndValidity({ emitEvent: false });
    }

    private isKeyForClose(event: KeyboardEvent): boolean {
        // tslint:disable-next-line: deprecation
        return (event.altKey && event.keyCode === UP_ARROW) || event.keyCode === ESCAPE;
    }

    private isKeyForOpen(event: KeyboardEvent): boolean {
        // tslint:disable-next-line: deprecation
        return event.altKey && event.keyCode === DOWN_ARROW;
    }

    private isLetterKey(event: KeyboardEvent): boolean {
        return isLetterKey(event) && !event.ctrlKey && !event.metaKey;
    }

    private isKeyForByPass(event: KeyboardEvent): boolean {
        // tslint:disable-next-line: deprecation
        return (hasModifierKey(event) && (isVerticalMovement(event.keyCode) || isHorizontalMovement(event.keyCode))) ||
            event.ctrlKey ||
            event.metaKey;
    }

    private spaceKeyHandler(event: KeyboardEvent) {
        event.preventDefault();

        if (this.selectionStart === this.selectionEnd) {
            const value = this.getNewValue(event.key, this.selectionStart as number);
            this.setViewValue(value);

            setTimeout(this.onInput);
        } else if (this.selectionStart !== this.selectionEnd) {
            this.selectNextDigit(this.selectionStart as number, true);
        }
    }

    private getNewValue(key: string, position: number) {
        return [this.viewValue.slice(0, position), key, this.viewValue.slice(position)].join('');
    }

    private setViewValue(value: string, savePosition: boolean = false) {
        if (savePosition) {
            const selectionStart = this.selectionStart;
            const selectionEnd = this.selectionEnd;

            this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);

            this.selectionStart = selectionStart;
            this.selectionEnd = selectionEnd;
        } else {
            this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);
        }
    }

    private replaceSymbols(value: string): string {
        return value
            .split(this.separator)
            .map((part: string) => part.replace(/^([0-9]+)\W$/, '0$1'))
            .join(this.separator);
    }

    private getDateFromString(timeString: string): D | null {
        if (!timeString || timeString.length < this.firstDigit.length) { return null; }

        const date = this.getDefaultValue();

        const viewDigits: string[] = timeString
            .split(this.separator)
            .map((value: string) => value);

        const [firsViewDigit, secondViewDigit, thirdViewDigit] = viewDigits;

        if (viewDigits.length === 1) {
            if (firsViewDigit.length < this.firstDigit.length) { return null; }


            date[this.firstDigit.fullName] = this.firstDigit.parse(firsViewDigit);
            date.month = 1;
        // tslint:disable-next-line:no-magic-numbers
        } else if (viewDigits.length === 2) {
            if (firsViewDigit.length < this.firstDigit.length || secondViewDigit.length < this.secondDigit.length) {
                return null;
            }

            date[this.firstDigit.fullName] = this.firstDigit.parse(firsViewDigit);
            date[this.secondDigit.fullName] = this.secondDigit.parse(secondViewDigit);
        // tslint:disable-next-line:no-magic-numbers
        } else if (viewDigits.length === 3) {
            if (
                firsViewDigit.length < this.firstDigit.length ||
                secondViewDigit.length < this.secondDigit.length ||
                thirdViewDigit.length < this.thirdDigit.length
            ) { return null; }

            date[this.firstDigit.fullName] = this.firstDigit.parse(firsViewDigit);
            date[this.secondDigit.fullName] = this.secondDigit.parse(secondViewDigit);
            date[this.thirdDigit.fullName] = this.thirdDigit.parse(thirdViewDigit);
        } else {
            return null;
        }

        return this.getValidDateOrNull(this.dateAdapter.createDateTime(
            date.year, date.month - 1, date.date, date.hours, date.minutes, date.seconds, date.milliseconds
        ));
    }

    private getDefaultValue() {
        const defaultValue = this.value || this.dateAdapter.today();

        return {
            year: this.dateAdapter.getYear(defaultValue),
            month: this.dateAdapter.getMonth(defaultValue),
            date: this.dateAdapter.getDate(defaultValue),
            hours: this.dateAdapter.getHours(defaultValue),
            minutes: this.dateAdapter.getMinutes(defaultValue),
            seconds: this.dateAdapter.getSeconds(defaultValue),
            milliseconds: this.dateAdapter.getMilliseconds(defaultValue)
        };
    }

    private getTimeStringFromDate(value: D | null, timeFormat: string): string {
        if (!value || !this.dateAdapter.isValid(value)) { return ''; }

        return this.dateAdapter.format(value, timeFormat);
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

        return [this.thirdDigit.value, this.thirdDigit.start, this.thirdDigit.end];
    }

    private incrementDate(dateVal: D, whatToIncrement: DateParts): D {
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

                if (year > MAX_YEAR) {
                    year = 1;
                }

                break;
            default:
        }

        return this.createDate(year, month, day);
    }

    private getLastDayFor(year: number, month: number): number {
        return this.dateAdapter.getNumDaysInMonth(this.createDate(year, month, 1));
    }

    private decrementDate(dateVal: D, whatToDecrement: DateParts): D {
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

                if (year < 1) {
                    year = MAX_YEAR;
                }

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

        this.cvaOnChange(changedTime);

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

        this.selectDigitByCursor(cursorPos);
    }

    private selectDigitByCursor(cursorPos: number): void {
        setTimeout(() => {
            const [, selectionStart, selectionEnd] = this.getDateEditMetrics(cursorPos);

            this.selectionStart = selectionStart;
            this.selectionEnd = selectionEnd;
        });
    }

    private selectNextDigitByCursor(cursorPos: number): void {
        setTimeout(() => {
            const [, , endPositionOfCurrentDigit] = this.getDateEditMetrics(cursorPos);
            const [, selectionStart, selectionEnd] = this.getDateEditMetrics(endPositionOfCurrentDigit + 1);

            this.selectionStart = selectionStart;
            this.selectionEnd = selectionEnd;
        });
    }

    private selectNextDigit(cursorPos: number, cycle: boolean = false): void {
        setTimeout(() => {
            const lastValue = cycle ? 0 : cursorPos;
            const nextSeparatorPos: number = this.viewValue.indexOf(this.separator, cursorPos);

            const newCursorPos = nextSeparatorPos > 0 ? nextSeparatorPos + 1 : lastValue;

            const [, selectionStart, selectionEnd] = this.getDateEditMetrics(newCursorPos);

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
        return this.focused ||
            this.empty ||
            this.lastValueValid ? null : { mcDatepickerParse: { text: this.elementRef.nativeElement.value } };
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

    private correctCursorPosition() {
        if (this.selectionStart && this.separatorPositions.includes(this.selectionStart)) {
            this.selectionStart = this.selectionStart - 1;
        }
    }
}
