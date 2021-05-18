// tslint:disable:no-magic-numbers
import { getLocaleFirstDayOfWeek } from '@angular/common';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import {
    MC_DATE_LOCALE,
    IFormatterRangeTemplate,
    IFormatterRelativeTemplate,
    IFormatterAbsoluteTemplate,
    IAbsoluteDateTimeOptions
} from '@ptsecurity/cdk/datetime';
import { DateTime, DateTimeOptions, DurationUnit, Info, LocaleOptions } from 'luxon';
import * as MessageFormat from 'messageformat';

import { DateAdapter } from '../../cdk/datetime';

// todo
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

class DateFormatter<D> {
    config: any;

    private readonly invalidDateErrorText: string = 'Invalid date';

    private messageFormat: MessageFormat;

    constructor(readonly adapter: DateAdapter<D>, locale: string) {
        this.config = locale === 'en' ? enUS : ruRU;

        this.messageFormat = new MessageFormat(locale);
    }

    relativeDate(date: D, template: IFormatterRelativeTemplate): string {
        if (!this.adapter.isDateInstance(date)) { throw new Error(this.invalidDateErrorText); }

        const totalSeconds = Math.abs(this.adapter.diffNow(date, 'seconds'));
        const totalMinutes = Math.floor(Math.abs(this.adapter.diffNow(date, 'minutes')));

        const isToday = this.adapter.hasSame(this.adapter.today(), date, 'days');
        const isYesterday = this.adapter.diffNow(date, 'days') <= -1 && this.adapter.diffNow(date, 'days') > -2;

        const templateVariables = {...this.config.variables, ...template.variables};
        const variables = this.compileVariables(date, templateVariables);
        let newTemplate;

        if (totalSeconds <= 59) { // seconds ago
            variables.SECONDS_PASSED = totalSeconds;
            newTemplate = template.SECONDS_AGO;
        } else if (totalMinutes <= 59) { // minutes ago
            variables.MINUTES_PASSED = totalMinutes;
            newTemplate = template.MINUTES_AGO;
        } else if (isToday) {
            newTemplate = template.TODAY;
        } else if (isYesterday) {
            newTemplate = template.YESTERDAY;
        } else { // before yesterday
            newTemplate = template.BEFORE_YESTERDAY;
        }

        return this.messageFormat.compile(newTemplate)(variables);
    }

    relativeShortDate(date: D): string {
        return this.relativeDate(date, this.config.relativeTemplates.short);
    }

    relativeLongDate(date: D): string {
        return this.relativeDate(date, this.config.relativeTemplates.long);
    }

    absoluteDate(
        date: D,
        params: IFormatterAbsoluteTemplate,
        datetime = false,
        milliseconds = false
    ): string {
        if (!this.adapter.isDateInstance(date)) { throw new Error(this.invalidDateErrorText); }

        const variables = this.compileVariables(date, { ...this.config.variables, ...params.variables });

        variables.SHOW_MILLISECONDS = milliseconds ? 'yes' : 'no';

        const template = datetime ? params.DATETIME : params.DATE;

        return this.messageFormat.compile(template)(variables);
    }

    absoluteShortDate(date: D): string {
        return this.absoluteDate(date, this.config.absoluteTemplates.short);
    }

    absoluteShortDateTime(date: D, options?: IAbsoluteDateTimeOptions): string {
        return this.absoluteDate(date, this.config.absoluteTemplates.short, true, options?.milliseconds);
    }

    absoluteLongDate(date: D): string {
        return this.absoluteDate(date, this.config.absoluteTemplates.long);
    }

    absoluteLongDateTime(date: D, options?: IAbsoluteDateTimeOptions): string {
        return this.absoluteDate(date, this.config.absoluteTemplates.long, true, options?.milliseconds);
    }

    openedRangeDate(startDate: D | null, endDate: D | null, template: IFormatterRangeTemplate) {
        if (!this.adapter.isDateInstance(startDate) && !this.adapter.isDateInstance(endDate)) {
            throw new Error(this.invalidDateErrorText);
        }

        const variables = { ...this.config.variables, ...template.variables };
        let params = {};

        if (startDate) {
            const startDateVariables = this.compileVariables(startDate, variables);

            params = {
                ...variables,
                START_DATE: this.messageFormat.compile(template.START_DATE)(startDateVariables),
                RANGE_TYPE: 'onlyStart'
            };
        } else if (endDate) {
            const endDateVariables = this.compileVariables(endDate, variables);

            params = {
                ...variables,
                END_DATE: this.messageFormat.compile(template.END_DATE)(endDateVariables),
                RANGE_TYPE: 'onlyEnd'
            };
        }

        return this.messageFormat.compile(template.DATE)(params);
    }

    openedRangeDateTime(startDate: D | null, endDate: D | null, template: IFormatterRangeTemplate) {
        if (!this.adapter.isDateInstance(startDate) && !this.adapter.isDateInstance(endDate)) {
            throw new Error(this.invalidDateErrorText);
        }

        const variables = { ...this.config.variables, ...template.variables };
        let params = {};

        if (startDate) {
            const startDateVariables = this.compileVariables(startDate, variables);

            params = {
                ...variables,
                START_DATETIME: this.messageFormat.compile(template.START_DATETIME)(startDateVariables),
                RANGE_TYPE: 'onlyStart'
            };
        } else if (endDate) {
            const endDateVariables = this.compileVariables(endDate, variables);

            params = {
                ...variables,
                END_DATETIME: this.messageFormat.compile(template.END_DATETIME)(endDateVariables),
                RANGE_TYPE: 'onlyEnd'
            };
        }

        return this.messageFormat.compile(template.DATETIME)(params);
    }

    rangeDate(startDate: D, endDate: D, template: IFormatterRangeTemplate): string {
        if (!this.adapter.isDateInstance(startDate) || !this.adapter.isDateInstance(endDate)) {
            throw new Error(this.invalidDateErrorText);
        }

        const variables = { ...this.config.variables, ...template.variables };
        const sameMonth = this.hasSame(startDate, endDate, 'month');

        const startDateVariables = this.compileVariables(startDate, variables);
        startDateVariables.SAME_MONTH = sameMonth;

        const endDateVariables = this.compileVariables(endDate, variables);
        endDateVariables.SAME_MONTH = sameMonth;

        const bothCurrentYear = startDateVariables.CURRENT_YEAR === 'yes' && endDateVariables.CURRENT_YEAR === 'yes';
        startDateVariables.CURRENT_YEAR = bothCurrentYear ? 'yes' : 'no';
        endDateVariables.CURRENT_YEAR = bothCurrentYear ? 'yes' : 'no';

        const params = {
            ...variables,
            START_DATE: this.messageFormat.compile(template.START_DATE)(startDateVariables),
            END_DATE: this.messageFormat.compile(template.END_DATE)(endDateVariables),
            SAME_MONTH: sameMonth
        };

        return this.messageFormat.compile(template.DATE)(params);
    }

    rangeDateTime(startDate: D, endDate: D, template: IFormatterRangeTemplate): string {
        if (!this.adapter.isDateInstance(startDate) || !this.adapter.isDateInstance(endDate)) {
            throw new Error(this.invalidDateErrorText);
        }

        const variables = {...this.config.variables, ...template.variables};
        const sameMonth = this.hasSame(startDate, endDate, 'month');
        const sameDay = this.hasSame(startDate, endDate, 'day');

        const startDateVariables = this.compileVariables(startDate, variables);
        startDateVariables.SAME_MONTH = sameMonth;
        startDateVariables.SAME_DAY = sameDay;

        const endDateVariables = this.compileVariables(endDate, variables);
        endDateVariables.SAME_MONTH = sameMonth;
        endDateVariables.SAME_DAY = sameDay;

        const bothCurrentYear = startDateVariables.CURRENT_YEAR === 'yes' && endDateVariables.CURRENT_YEAR === 'yes';
        startDateVariables.CURRENT_YEAR = bothCurrentYear ? 'yes' : 'no';
        endDateVariables.CURRENT_YEAR = bothCurrentYear ? 'yes' : 'no';

        const params = {
            ...variables,
            START_DATETIME: this.messageFormat.compile(template.START_DATETIME)(startDateVariables),
            END_DATETIME: this.messageFormat.compile(template.END_DATETIME)(endDateVariables),
            SAME_MONTH: sameMonth,
            SAME_DAY: sameDay
        };

        return this.messageFormat.compile(template.DATETIME)(params);
    }

    rangeShortDate(startDate: D | null, endDate?: D): string {
        const rangeTemplates = this.config.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDate(startDate, endDate, rangeTemplates.closedRange.short);
        }

        return this.openedRangeDate(startDate, endDate || null, rangeTemplates.openedRange.short);
    }

    rangeShortDateTime(startDate: D | null, endDate?: D): string {
        const rangeTemplates = this.config.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDateTime(startDate, endDate, rangeTemplates.closedRange.short);
        }

        return this.openedRangeDateTime(startDate, endDate || null, rangeTemplates.openedRange.short);
    }

    rangeLongDate(startDate: D | null, endDate?: D): string {
        const rangeTemplates = this.config.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDate(startDate, endDate, rangeTemplates.closedRange.long);
        }

        return this.openedRangeDate(startDate, endDate || null, rangeTemplates.openedRange.long);
    }

    rangeLongDateTime(startDate: D | null, endDate?: D): string {
        const rangeTemplates = this.config.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDateTime(startDate, endDate, rangeTemplates.closedRange.long);
        }

        return this.openedRangeDateTime(startDate, endDate || null, rangeTemplates.openedRange.long);
    }

    rangeMiddleDateTime(startDate: D, endDate: D): string {
        return this.rangeDateTime(startDate, endDate, this.config.rangeTemplates.closedRange.middle);
    }

    private compileVariables(date: D, variables: any): any {
        const compiledVariables: any = {};

        // tslint:disable-next-line:no-for-in
        for (const key in variables) {
            if (!variables.hasOwnProperty(key)) { continue; }

            const value = variables[key];
            compiledVariables[key] = this.adapter.format(date, value);
        }

        compiledVariables.CURRENT_YEAR = this.hasSame(date, this.adapter.today(), 'year');

        return compiledVariables;
    }

    private hasSame(startDate: D, endDate: D, unit: DurationUnit): string {
        return this.adapter.hasSame(startDate, endDate, unit) ? 'yes' : 'no';
    }
}

@Injectable()
export class LuxonDateAdapter extends DateAdapter<DateTime> {
    private localeOptions: LocaleOptions;
    private dateTimeOptions: DateTimeOptions;
    private dateFormatter: DateFormatter<DateTime>;

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

        this.dateFormatter = new DateFormatter<DateTime>(this, locale);

        this.localeOptions = { locale };

        this.dateTimeOptions = {
            zone: this.options?.useUtc ? 'UTC' : undefined
        };

        let localeData: any = {
            dates: Array(31)
                .fill(null)
                .map((_, i) => this.createDate(2000, 1, i + 1).toFormat('d'))
        };

        if (i18nLocals.includes(locale)) {
            localeData = {
                ...localeData,
                firstDayOfWeek: this.dateFormatter.config.firstDayOfWeek,

                longMonths: this.dateFormatter.config.monthNames.long,
                shortMonths: this.dateFormatter.config.monthNames.short.standalone,

                narrowDaysOfWeek: this.dateFormatter.config.dayOfWeekNames.narrow,
                shortDaysOfWeek: this.dateFormatter.config.dayOfWeekNames.short,
                longDaysOfWeek: this.dateFormatter.config.dayOfWeekNames.long
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

    getMonth(date: DateTime): number { return date.month; }

    getDate(date: DateTime): number { return date.day; }

    getHours(date: DateTime): number { return date.hour; }

    getMinutes(date: DateTime): number { return date.minute; }

    getSeconds(date: DateTime): number { return date.second; }

    getMilliseconds(date: DateTime): number { return date.millisecond; }

    getTime(date: DateTime): number { return date.valueOf(); }

    getDayOfWeek(date: DateTime): number { return date.weekday; }

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

    createDate(year: number, month: number, day: number): DateTime {
        if (month < 1 || month > 12) {
            throw Error(`Invalid month index "${month}". Month index has to be between 1 and 12.`);
        }

        if (day < 1) {
            throw Error(`Invalid day "${day}". Date has to be greater than 0.`);
        }

        const result = this.reconfigure(DateTime.fromObject({ year, month, day }));

        // If the result isn't valid, the day must have been out of bounds for this month.
        if (!result.isValid) {
            throw Error(`Invalid day "${day}" for month with index "${month}".`);
        }

        return result;
    }

    createDateTime(
        year: number,
        month: number,
        date: number,
        hours: number,
        minutes: number,
        seconds: number,
        milliseconds: number
    ): DateTime {
        const newDate = this.createDate(year, month, date);

        newDate.hour = hours;
        newDate.minute = minutes;
        newDate.second = seconds;
        newDate.millisecond = milliseconds;

        return newDate;
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

    absoluteDate(date: DateTime, params: IFormatterAbsoluteTemplate, datetime: boolean, milliseconds: boolean): string {
        return this.dateFormatter.absoluteDate(date, params, datetime, milliseconds);
    }

    absoluteLongDate(date: DateTime): string {
        return this.dateFormatter.absoluteLongDate(date);
    }

    absoluteLongDateTime(date: DateTime, options?: IAbsoluteDateTimeOptions): string {
        return this.dateFormatter.absoluteLongDateTime(date, options);
    }

    absoluteShortDate(date: DateTime): string {
        return this.dateFormatter.absoluteShortDate(date);
    }

    absoluteShortDateTime(date: DateTime, options?: IAbsoluteDateTimeOptions): string {
        return this.dateFormatter.absoluteShortDateTime(date, options);
    }

    openedRangeDate(startDate: DateTime, endDate: DateTime, template: IFormatterRangeTemplate): string {
        return this.dateFormatter.openedRangeDate(startDate, endDate, template);
    }

    openedRangeDateTime(startDate: DateTime, endDate: DateTime, template: IFormatterRangeTemplate): string {
        return this.dateFormatter.openedRangeDateTime(startDate, endDate, template);
    }

    rangeDate(startDate: DateTime, endDate: DateTime, template: IFormatterRangeTemplate): string {
        return this.dateFormatter.rangeDate(startDate, endDate, template);
    }

    rangeDateTime(startDate: DateTime, endDate: DateTime, template: IFormatterRangeTemplate): string {
        return this.dateFormatter.rangeDateTime(startDate, endDate, template);
    }

    rangeLongDate(startDate: DateTime, endDate: DateTime): string {
        return this.dateFormatter.rangeLongDate(startDate, endDate);
    }

    rangeLongDateTime(startDate: DateTime, endDate: DateTime): string {
        return this.dateFormatter.rangeLongDateTime(startDate, endDate);
    }

    rangeMiddleDateTime(startDate: DateTime, endDate: DateTime): string {
        return this.dateFormatter.rangeMiddleDateTime(startDate, endDate);
    }

    rangeShortDate(startDate: DateTime, endDate: DateTime): string {
        return this.dateFormatter.rangeShortDate(startDate, endDate);
    }

    rangeShortDateTime(startDate: DateTime, endDate: DateTime): string {
        return this.dateFormatter.rangeShortDateTime(startDate, endDate);
    }

    relativeDate(date: DateTime, template: IFormatterRelativeTemplate): string {
        return this.dateFormatter.relativeDate(date, template);
    }

    relativeLongDate(date: DateTime): string {
        return this.dateFormatter.relativeLongDate(date);
    }

    relativeShortDate(date: DateTime): string {
        return this.dateFormatter.relativeShortDate(date);
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
            .replace('февр', this.dateFormatter.config.monthNames.short.formatted[1])
            .replace('июн', this.dateFormatter.config.monthNames.short.formatted[5])
            .replace('июл', this.dateFormatter.config.monthNames.short.formatted[6])
            .replace('сент', this.dateFormatter.config.monthNames.short.formatted[8])
            .replace('нояб', this.dateFormatter.config.monthNames.short.formatted[10])
            .replace(/(\W)\./, '$1');
    }
}
