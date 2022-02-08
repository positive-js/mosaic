// tslint:disable:no-magic-numbers
// tslint:disable:deprecation
import { getLocaleFirstDayOfWeek } from '@angular/common';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import {
    DateAdapter,
    MC_DATE_LOCALE
} from '@ptsecurity/cdk/datetime';
import { DateTime, DateTimeOptions, DurationUnit, Info, Interval, LocaleOptions } from 'luxon';

import { enUS } from './locales/en-US';
import { ruRU } from './locales/ru-RU';


/** Configurable options for {@see LuxonDateAdapter}. */
// tslint:disable-next-line:naming-convention
export interface McLuxonDateAdapterOptions {
    /**
     * Turns the use of utc dates on or off.
     * {@default false}
     */
    useUtc: boolean;
}

/** InjectionToken for moment date adapter to configure options. */
export const MC_LUXON_DATE_ADAPTER_OPTIONS = new InjectionToken<McLuxonDateAdapterOptions>(
    'MC_MOMENT_DATE_ADAPTER_OPTIONS', {
        providedIn: 'root',
        factory: MC_LUXON_DATE_ADAPTER_OPTIONS_FACTORY
    });

/** @docs-private */
// tslint:disable:naming-convention
export function MC_LUXON_DATE_ADAPTER_OPTIONS_FACTORY(): McLuxonDateAdapterOptions {
    return { useUtc: false };
}

// This is our customs translations
const i18nLocals = ['en', 'ru'];


@Injectable()
export class LuxonDateAdapter extends DateAdapter<DateTime> {
    private localeOptions: LocaleOptions;
    private dateTimeOptions: DateTimeOptions;

    // todo
    private localeData: {
        firstDayOfWeek: number;
        longMonths: string[];
        shortMonths: string[];
        dates: string[];
        longDaysOfWeek: string[];
        shortDaysOfWeek: string[];
        narrowDaysOfWeek: string[];
    };

    constructor(
        @Inject(MC_DATE_LOCALE) dateLocale: string,
        @Optional() @Inject(MC_LUXON_DATE_ADAPTER_OPTIONS) private readonly options?: McLuxonDateAdapterOptions
    ) {
        super();

        this.setLocale(dateLocale);
    }

    setLocale(locale: string): void {
        super.setLocale(locale);

        this.config = locale === 'en' ? enUS : ruRU;

        this.localeOptions = { locale };

        this.dateTimeOptions = {
            zone: this.options?.useUtc ? 'UTC' : undefined
        };

        let localeData: any = {
            dates: Array(31)
                .fill(null)
                .map((_, i) => this.createDate(2000, 0, i + 1).toFormat('d'))
        };

        if (i18nLocals.includes(locale)) {
            localeData = {
                ...localeData,
                firstDayOfWeek: this.config.firstDayOfWeek,

                longMonths: this.config.monthNames.long,
                shortMonths: this.config.monthNames.short.standalone,

                narrowDaysOfWeek: this.config.dayOfWeekNames.narrow,
                shortDaysOfWeek: this.config.dayOfWeekNames.short,
                longDaysOfWeek: this.config.dayOfWeekNames.long
            };
        } else {
            const options = { locale };
            localeData = {
                ...localeData,
                firstDayOfWeek: getLocaleFirstDayOfWeek(locale),
                longMonths: Info.monthsFormat('long', options),
                shortMonths: Info.monthsFormat('short', options),
                narrowDaysOfWeek: Info.weekdaysFormat('narrow', options),
                shortDaysOfWeek: Info.weekdaysFormat('short', options),
                longDaysOfWeek: Info.weekdaysFormat('long', options)
            };
        }

        this.updateLocaleData(localeData);
    }

    getLocaleData() {
        return this.localeData;
    }

    setLocaleData(localeData): void {
        this.localeData = localeData;
    }

    updateLocaleData(localeData): void {
        this.localeData = { ...this.localeData, ...localeData };
    }

    getYear(date: DateTime): number { return date.year; }

    getMonth(date: DateTime): number { return date.month - 1; }

    getDate(date: DateTime): number { return date.day; }

    getHours(date: DateTime): number { return date.hour; }

    getMinutes(date: DateTime): number { return date.minute; }

    getSeconds(date: DateTime): number { return date.second; }

    getMilliseconds(date: DateTime): number { return date.millisecond; }

    getTime(date: DateTime): number { return date.valueOf(); }

    getDayOfWeek(date: DateTime): number {
        if (date.weekday === 7) { return 0; }

        return date.weekday;
    }

    getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
        return style === 'long' ? this.localeData.longMonths : this.localeData.shortMonths;
    }

    getDateNames(): string[] {
        return this.localeData.dates;
    }

    getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
        if (style === 'long') { return this.localeData.longDaysOfWeek; }

        if (style === 'short') { return this.localeData.shortDaysOfWeek; }

        return this.localeData.narrowDaysOfWeek;
    }

    getYearName(date: DateTime): string {
        return date.toFormat('yyyy');
    }

    getFirstDayOfWeek(): number {
        return this.localeData.firstDayOfWeek;
    }

    getNumDaysInMonth(date: DateTime): number {
        return date.daysInMonth;
    }

    clone(date: DateTime): DateTime {
        return date.setLocale(date.locale);
    }

    createDate(year: number, month: number = 0, day: number = 1): DateTime {
        if (month < 0 || month > 11) {
            throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
        }

        if (day < 1) {
            throw Error(`Invalid day "${day}". Date has to be greater than 0.`);
        }

        return this.reconfigure(DateTime.fromObject({ year, month: month + 1, day }));
    }

    createDateTime(
        year: number,
        month: number,
        date: number,
        hour: number,
        minute: number,
        second: number,
        millisecond: number
    ): DateTime {
        return this.createDate(year, month, date).set({ hour, minute, second, millisecond });
    }

    today(): DateTime {
        return this.reconfigure(DateTime.now());
    }

    parse(value: any, parseFormat?: string): DateTime | null {
        if (value) {
            if (typeof value === 'string') {
                if (parseFormat) {
                    return this.reconfigure(DateTime.fromFormat(value, parseFormat));
                } else if (DateTime.fromISO(value).isValid) {
                    return this.reconfigure(DateTime.fromISO(value));
                } else if (DateTime.fromRFC2822(value).isValid) {
                    return this.reconfigure(DateTime.fromRFC2822(value));
                }
            } else if (typeof value === 'number') {
                return this.reconfigure(DateTime.fromMillis(value));
            } else if (value instanceof Date) {
                return this.reconfigure(DateTime.fromJSDate(value));
            }
        }

        return null;
    }

    format(date: DateTime, displayFormat: string): string {
        if (!this.isValid(date)) {
            throw Error('DateTime: Cannot format invalid date.');
        }

        if (this.locale === 'ru' && displayFormat?.search(/([^M]|^)MMM([^M]|$)/) !== -1) {
            return this.formatShortMonthForRULocale(date, displayFormat, this.dateTimeOptions);
        }

        return date.toFormat(displayFormat, this.dateTimeOptions);
    }

    addCalendarYears(date: DateTime, years: number): DateTime {
        return date.plus({ years });
    }

    addCalendarMonths(date: DateTime, months: number): DateTime {
        return date.plus({ months });
    }

    addCalendarDays(date: DateTime, days: number): DateTime {
        return date.plus({ days });
    }

    toIso8601(date: DateTime): string {
        return date.toISO();
    }

    /** https://www.ietf.org/rfc/rfc3339.txt */
    deserialize(value: any): DateTime | null {
        if (this.isDateInstance(value)) { return value.setLocale(this.locale); }

        let date;
        if (value instanceof Date) {
            date = this.reconfigure(DateTime.fromJSDate(value));
        } else if (typeof value === 'string') {
            if (!value) { return null; }

            date = this.reconfigure(DateTime.fromISO(value));
        }

        if (date && this.isValid(date)) { return date; }

        return super.deserialize(value);
    }

    isDateInstance(obj: any): boolean {
        return DateTime.isDateTime(obj);
    }

    isValid(date: DateTime): boolean {
        return date.isValid;
    }

    invalid(): DateTime {
        return DateTime.fromObject({ month: 0 });
    }

    hasSame(startDate: DateTime, endDate: DateTime, unit: DurationUnit): boolean {
        return startDate.hasSame(endDate, unit);
    }

    diffNow(date: DateTime, unit: DurationUnit): number {
        return date.diffNow(unit)[unit];
    }

    daysFromToday(date: DateTime): number {
        const today = this.today();

        if (this.hasSame(date, today, 'days')) {
            return 0;
        } else if (date < today) {
            return Math.round(Interval.fromDateTimes(date, today).length('days')) * -1;
        } else {
            return Math.round(Interval.fromDateTimes(today, date).length('days'));
        }
    }

    private reconfigure(date: DateTime): DateTime {
        return date
            .reconfigure(this.localeOptions)
            .setZone(this.dateTimeOptions.zone as string);
    }

    // we need to do this strange things because Intl has ugly reduction for russian months
    private formatShortMonthForRULocale(date: DateTime, displayFormat: string, options: LocaleOptions) {
        return date
            .toFormat(displayFormat, options)
            .replace('февр', this.config.monthNames.short.formatted[1])
            .replace('июн', this.config.monthNames.short.formatted[5])
            .replace('июл', this.config.monthNames.short.formatted[6])
            .replace('сент', this.config.monthNames.short.formatted[8])
            .replace('нояб', this.config.monthNames.short.formatted[10])
            .replace(/(\W)\./, '$1');
    }
}
