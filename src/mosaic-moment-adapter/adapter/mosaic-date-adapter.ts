// tslint:disable:no-magic-numbers
import { Inject, Injectable, Optional } from '@angular/core';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';

import { createMissingDateForamtterError } from './mosaic-date-adapter-errors';
import {
    McDateFormatter,
    MomentType
} from './mosaic-date-formatter';
import {
    IFormatterConfig, MC_DATE_FORMATTER_CONFIGS_SET,
    McDateFormatterConfigSet
} from './mosaic-date-formatter-configs';


/** https://tools.ietf.org/html/rfc3339 */
const ISO_8601_REGEX =
    /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:(?:\+|-)\d{2}:\d{2}))?)?$/;

/** The default date names to use if Intl API is not available. */
const DEFAULT_DATE_NAMES = range(31, (i) => String(i + 1));

/** Creates an array and fills it with values. */
function range<T>(length: number, valueFunction: (index: number) => T): T[] {
    const valuesArray = Array(length);

    for (let i = 0; i < length; i++) {
        valuesArray[i] = valueFunction(i);
    }

    return valuesArray;
}

@Injectable()
export class MosaicDateAdapter extends DateAdapter<Date> {

    private readonly moment: MomentType;

    private get formatterConfig(): IFormatterConfig {
        const config = this.formatterConfigsSet[this.locale];

        if (!config) {
            throw Error(`There is no formatter config for locale: ${this.locale}`);
        }

        return config;
    }

    constructor(
        @Optional() @Inject(MC_DATE_LOCALE) mcDateLocale: string,
        @Optional() @Inject(MC_DATE_FORMATTER_CONFIGS_SET) private formatterConfigsSet: McDateFormatterConfigSet
    ) {
        super();
        super.setLocale(mcDateLocale);

        if (!this.formatterConfigsSet) {
            throw createMissingDateForamtterError('MC_DATE_FORMATTER_CONFIGS_SET');
        }

        const formatter = new McDateFormatter(this.formatterConfig, this.locale);
        this.moment = formatter.moment;
    }

    getYear(date: Date): number {
        return date.getFullYear();
    }

    getMonth(date: Date): number {
        return date.getMonth();
    }

    getDate(date: Date): number {
        return date.getDate();
    }

    getDayOfWeek(date: Date): number {
        return date.getDay();
    }

    getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
        return this.formatterConfig.monthNames[style];
    }

    getDateNames(): string[] {
        return DEFAULT_DATE_NAMES;
    }

    getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
        return this.formatterConfig.dayOfWeekNames[style];
    }

    getYearName(date: Date): string {
        return String(this.getYear(date));
    }

    getFirstDayOfWeek(): number {
        switch (this.locale) {
            case 'ru-RU':
                return 1;
            case 'en-US':
                return 0;
            default:
                return 1;
        }
    }

    getNumDaysInMonth(date: Date): number {
        return this.getDate(this.createDateWithOverflow(
            this.getYear(date), this.getMonth(date) + 1, 0));
    }

    clone(date: Date): Date {
        return new Date(date.getTime());
    }

    createDate(year: number, month: number, date: number): Date {
        if (month < 0 || month > 11) {
            throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
        }

        if (date < 1) {
            throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
        }

        const result = this.createDateWithOverflow(year, month, date);

        if (result.getMonth() !== month) {
            throw Error(`Invalid date "${date}" for month with index "${month}".`);
        }

        return result;
    }

    today(): Date {
        return new Date();
    }

    parse(value: any, parseFormat: string | string[]): Date | null {
        if (value && typeof value === 'string') {
            return this.moment(value, parseFormat).toDate();
        }

        return value ? this.moment(value).toDate() : null;
    }

    format(date: Date, displayFormat: string): string {
        if (!this.isValid(date)) {
            throw Error('MosaicDateAdapter: Cannot format invalid date.');
        }

        return this.moment(date).format(displayFormat);
    }

    addCalendarYears(date: Date, years: number): Date {
        return this.addCalendarMonths(date, years * 12);
    }

    addCalendarMonths(date: Date, months: number): Date {
        let newDate = this.createDateWithOverflow(
            this.getYear(date), this.getMonth(date) + months, this.getDate(date));

        if (this.getMonth(newDate) !== ((this.getMonth(date) + months) % 12 + 12) % 12) {
            newDate = this.createDateWithOverflow(this.getYear(newDate), this.getMonth(newDate), 0);
        }

        return newDate;
    }

    addCalendarDays(date: Date, days: number): Date {
        return this.createDateWithOverflow(
            this.getYear(date), this.getMonth(date), this.getDate(date) + days);
    }

    toIso8601(date: Date): string {
        return [
            date.getUTCFullYear(),
            this.toDigit(date.getUTCMonth() + 1),
            this.toDigit(date.getUTCDate())
        ].join('-');
    }

    /** https://www.ietf.org/rfc/rfc3339.txt */
    deserialize(value: any): Date | null {
        if (typeof value === 'string') {
            if (!value) {
                return null;
            }
            // The `Date` constructor accepts formats other than ISO 8601, so we need to make sure the
            // string is the right format first.
            if (ISO_8601_REGEX.test(value)) {
                const date = new Date(value);
                if (this.isValid(date)) {
                    return date;
                }
            }
        }

        return super.deserialize(value);
    }

    isDateInstance(obj: any) {
        return obj instanceof Date;
    }

    isValid(date: Date) {
        return !isNaN(date.getTime());
    }

    invalid(): Date {
        return new Date(NaN);
    }

    /** Creates a date but allows the month and date to overflow. */
    private createDateWithOverflow(year: number, month: number, date: number) {
        const result = new Date(year, month, date);

        // We need to correct for the fact that JS native Date treats years in range [0, 99] as
        // abbreviations for 19xx.
        if (year >= 0 && year < 100) {
            result.setFullYear(this.getYear(result) - 1900);
        }

        return result;
    }

    private toDigit(n: number) {
        return (`00${n}`).slice(-2);
    }
}
