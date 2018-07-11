import { noop } from 'rxjs';

import {
    Directive,
    ElementRef,
    forwardRef,
    Input
} from '@angular/core';
import {
    AbstractControl,
    NG_VALIDATORS,
    ValidationErrors,
    Validator,
    ValidatorFn,
    Validators
} from '@angular/forms';

import {
    DEFAULT_TIME_FORMAT,
    getDateFromTimeString,
    isTimeGreaterThenMax,
    isTimeLowerThenMin,
    TimeFormats
} from './timepicker.helpers';


@Directive({
    selector: 'input[mcTimepicker]',
    host: {
        '[attr.min-time]': 'minTime',
        '[attr.max-time]': 'maxTime'
    },
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => McTimepickerValidator),
        multi: true
    }]
})
export class McTimepickerValidator implements Validator {
    @Input('min-time')
    get minTime(): string | null { return this._minTime; }

    set minTime(minValue: string | null) {
        this._minTime = minValue !== null && getDateFromTimeString(minValue) !== undefined ?
            minValue :
            null;
        this._validatorOnChange();
    }

    @Input('max-time')
    get maxTime(): string | null { return this._maxTime; }

    set maxTime(maxValue: string | null) {
        this._maxTime = maxValue !== null && getDateFromTimeString(maxValue) !== undefined ?
            maxValue :
            null;
        this._validatorOnChange();
    }

    @Input('time-format')
    get timeFormat(): TimeFormats { return this._timeFormat; }

    set timeFormat(formatValue: TimeFormats) {
        this._timeFormat = Object
            .keys(TimeFormats)
            .map((timeFormatKey) => TimeFormats[timeFormatKey])
            .indexOf(formatValue) > -1 ? formatValue : DEFAULT_TIME_FORMAT;
        this._validatorOnChange();
    }

    private _validator: ValidatorFn | null = Validators.compose([
        this._parseValidator.bind(this),
        this._minTimeValidator.bind(this),
        this._maxTimeValidator.bind(this)
    ]);

    private _minTime: string | null = null;
    private _maxTime: string | null = null;
    private _validatorOnChange: () => void;
    private _timeFormat: TimeFormats;

    constructor(private readonly _elementRef: ElementRef) {
        this._validatorOnChange = () => noop;
    }

    registerOnValidatorChange(fn: () => void): void {
        this._validatorOnChange = fn;
    }

    validate(c: AbstractControl): ValidationErrors | null {
        return this._validator ? this._validator(c) : null;
    }

    private _parseValidator(): ValidationErrors | null {
        const dateRepresentationOfCurrentInputValue: Date | undefined =
            getDateFromTimeString(this._elementRef.nativeElement.value);

        return dateRepresentationOfCurrentInputValue === undefined ?
            { mcTimepickerParse: { text: this._elementRef.nativeElement.value } } :
            null;
    }

    private _minTimeValidator(): ValidationErrors | null {
        const dateRepresentationOfCurrentInputValue: Date | undefined =
            getDateFromTimeString(this._elementRef.nativeElement.value);

        return (dateRepresentationOfCurrentInputValue !== undefined && this.minTime !== null &&
            isTimeLowerThenMin(dateRepresentationOfCurrentInputValue, this.minTime)) ?
            { mcTimepickerLowerThenMintime: { text: this._elementRef.nativeElement.value } } :
            null;
    }

    private _maxTimeValidator(): ValidationErrors | null {
        const dateRepresentationOfCurrentInputValue: Date | undefined =
            getDateFromTimeString(this._elementRef.nativeElement.value);

        return (dateRepresentationOfCurrentInputValue !== undefined && this.maxTime !== null &&
            isTimeGreaterThenMax(dateRepresentationOfCurrentInputValue, this.maxTime)) ?
            { mcTimepickerHigherThenMaxtime: { text: this._elementRef.nativeElement.value } } :
            null;
    }
}
