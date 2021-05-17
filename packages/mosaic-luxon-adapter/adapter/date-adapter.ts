// tslint:disable:no-magic-numbers
import { getLocaleFirstDayOfWeek } from '@angular/common';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import {
    DateAdapter,
    MC_DATE_LOCALE,
    IFormatterRangeTemplate,
    IFormatterRelativeTemplate,
    IFormatterAbsoluteTemplate,
    IAbsoluteDateTimeOptions
} from '@ptsecurity/cdk/datetime';
import { DateTime, DateTimeOptions, DurationUnit, Info, LocaleOptions } from 'luxon';
import * as MessageFormat from 'messageformat';

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


@Injectable()
export class LuxonDateAdapter extends DateAdapter<DateTime> {
    private messageformat: MessageFormat;

    private readonly invalidDateErrorText: string = 'Invalid date';

    private formatterConfig: any;

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

        this.localeOptions = { locale };

        this.dateTimeOptions = {
            zone: this.options?.useUtc ? 'UTC' : undefined
        };

        this.configureFormatter(locale);

        let localeData: any = {
            dates: Array(31)
                .fill(null)
                .map((_, i) => this.createDate(2000, 1, i + 1).toFormat('d'))
        };

        if (i18nLocals.includes(locale)) {
            this.formatterConfig = locale === 'en' ? enUS : ruRU;

            localeData = {
                ...localeData,
                firstDayOfWeek: this.formatterConfig.firstDayOfWeek,

                longMonths: this.formatterConfig.monthNames.long,
                shortMonths: this.formatterConfig.monthNames.short.standalone,

                narrowDaysOfWeek: this.formatterConfig.dayOfWeekNames.narrow,
                shortDaysOfWeek: this.formatterConfig.dayOfWeekNames.short,
                longDaysOfWeek: this.formatterConfig.dayOfWeekNames.long
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

    relativeDate(date: DateTime, template: IFormatterRelativeTemplate): string {
        if (!this.isDateInstance(date)) { throw new Error(this.invalidDateErrorText); }

        const totalSeconds = Math.abs(date.diffNow('seconds').seconds);
        const totalMinutes = Math.floor(Math.abs(date.diffNow('minutes').minutes));

        const isToday = DateTime.now().hasSame(date, 'day');
        const isYesterday = DateTime.now().minus({ days: 1 }).hasSame(date, 'day');

        const templateVariables = {...this.formatterConfig.variables, ...template.variables};
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

        return this.messageformat.compile(newTemplate)(variables);
    }

    relativeShortDate(date: DateTime): string {
        return this.relativeDate(date, this.formatterConfig.relativeTemplates.short);
    }

    relativeLongDate(date: DateTime): string {
        return this.relativeDate(date, this.formatterConfig.relativeTemplates.long);
    }

    absoluteDate(
        date: DateTime,
        params: IFormatterAbsoluteTemplate,
        datetime = false,
        milliseconds = false
    ): string {
        if (!this.isDateInstance(date)) { throw new Error(this.invalidDateErrorText); }

        const variables = this.compileVariables(date, { ...this.formatterConfig.variables, ...params.variables });

        variables.SHOW_MILLISECONDS = milliseconds ? 'yes' : 'no';

        const template = datetime ? params.DATETIME : params.DATE;

        return this.messageformat.compile(template)(variables);
    }

    absoluteShortDate(date: DateTime): string {
        return this.absoluteDate(date, this.formatterConfig.absoluteTemplates.short);
    }

    absoluteShortDateTime(date: DateTime, options?: IAbsoluteDateTimeOptions): string {
        return this.absoluteDate(date, this.formatterConfig.absoluteTemplates.short, true, options?.milliseconds);
    }

    absoluteLongDate(date: DateTime): string {
        return this.absoluteDate(date, this.formatterConfig.absoluteTemplates.long);
    }

    absoluteLongDateTime(date: DateTime, options?: IAbsoluteDateTimeOptions): string {
        return this.absoluteDate(date, this.formatterConfig.absoluteTemplates.long, true, options?.milliseconds);
    }

    openedRangeDate(startDate: DateTime | null, endDate: DateTime | null, template: IFormatterRangeTemplate) {
        if (!DateTime.isDateTime(startDate) && !DateTime.isDateTime(endDate)) {
            throw new Error(this.invalidDateErrorText);
        }

        const variables = { ...this.formatterConfig.variables, ...template.variables };
        let params = {};

        if (startDate) {
            const startDateVariables = this.compileVariables(startDate, variables);

            params = {
                ...variables,
                START_DATE: this.messageformat.compile(template.START_DATE)(startDateVariables),
                RANGE_TYPE: 'onlyStart'
            };
        } else if (endDate) {
            const endDateVariables = this.compileVariables(endDate, variables);

            params = {
                ...variables,
                END_DATE: this.messageformat.compile(template.END_DATE)(endDateVariables),
                RANGE_TYPE: 'onlyEnd'
            };
        }

        return this.messageformat.compile(template.DATE)(params);
    }

    openedRangeDateTime(startDate: DateTime | null, endDate: DateTime | null, template: IFormatterRangeTemplate) {
        if (!DateTime.isDateTime(startDate) && !DateTime.isDateTime(endDate)) {
            throw new Error(this.invalidDateErrorText);
        }

        const variables = { ...this.formatterConfig.variables, ...template.variables };
        let params = {};

        if (startDate) {
            const startDateVariables = this.compileVariables(startDate, variables);

            params = {
                ...variables,
                START_DATETIME: this.messageformat.compile(template.START_DATETIME)(startDateVariables),
                RANGE_TYPE: 'onlyStart'
            };
        } else if (endDate) {
            const endDateVariables = this.compileVariables(endDate, variables);

            params = {
                ...variables,
                END_DATETIME: this.messageformat.compile(template.END_DATETIME)(endDateVariables),
                RANGE_TYPE: 'onlyEnd'
            };
        }

        return this.messageformat.compile(template.DATETIME)(params);
    }

    rangeDate(startDate: DateTime, endDate: DateTime, template: IFormatterRangeTemplate): string {
        if (!this.isDateInstance(startDate) || !this.isDateInstance(endDate)) {
            throw new Error(this.invalidDateErrorText);
        }

        const variables = { ...this.formatterConfig.variables, ...template.variables };
        const sameMonth = this.isSame('month', startDate, endDate);

        const startDateVariables = this.compileVariables(startDate, variables);
        startDateVariables.SAME_MONTH = sameMonth;

        const endDateVariables = this.compileVariables(endDate, variables);
        endDateVariables.SAME_MONTH = sameMonth;

        const bothCurrentYear = startDateVariables.CURRENT_YEAR === 'yes' && endDateVariables.CURRENT_YEAR === 'yes';
        startDateVariables.CURRENT_YEAR = bothCurrentYear ? 'yes' : 'no';
        endDateVariables.CURRENT_YEAR = bothCurrentYear ? 'yes' : 'no';

        const params = {
            ...variables,
            START_DATE: this.messageformat.compile(template.START_DATE)(startDateVariables),
            END_DATE: this.messageformat.compile(template.END_DATE)(endDateVariables),
            SAME_MONTH: sameMonth
        };

        return this.messageformat.compile(template.DATE)(params);
    }

    rangeDateTime(startDate: DateTime, endDate: DateTime, template: IFormatterRangeTemplate): string {
        if (!this.isDateInstance(startDate) || !this.isDateInstance(endDate)) {
            throw new Error(this.invalidDateErrorText);
        }

        const variables = {...this.formatterConfig.variables, ...template.variables};
        const sameMonth = this.isSame('month', startDate, endDate);
        const sameDay = this.isSame('day', startDate, endDate);

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
            START_DATETIME: this.messageformat.compile(template.START_DATETIME)(startDateVariables),
            END_DATETIME: this.messageformat.compile(template.END_DATETIME)(endDateVariables),
            SAME_MONTH: sameMonth,
            SAME_DAY: sameDay
        };

        return this.messageformat.compile(template.DATETIME)(params);
    }

    rangeShortDate(startDate: DateTime | null, endDate?: DateTime): string {
        const rangeTemplates = this.formatterConfig.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDate(startDate, endDate, rangeTemplates.closedRange.short);
        }

        return this.openedRangeDate(startDate, endDate || null, rangeTemplates.openedRange.short);
    }

    rangeShortDateTime(startDate: DateTime | null, endDate?: DateTime): string {
        const rangeTemplates = this.formatterConfig.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDateTime(startDate, endDate, rangeTemplates.closedRange.short);
        }

        return this.openedRangeDateTime(startDate, endDate || null, rangeTemplates.openedRange.short);
    }

    rangeLongDate(startDate: DateTime | null, endDate?: DateTime): string {
        const rangeTemplates = this.formatterConfig.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDate(startDate, endDate, rangeTemplates.closedRange.long);
        }

        return this.openedRangeDate(startDate, endDate || null, rangeTemplates.openedRange.long);
    }

    rangeLongDateTime(startDate: DateTime | null, endDate?: DateTime): string {
        const rangeTemplates = this.formatterConfig.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDateTime(startDate, endDate, rangeTemplates.closedRange.long);
        }

        return this.openedRangeDateTime(startDate, endDate || null, rangeTemplates.openedRange.long);
    }

    rangeMiddleDateTime(startDate: DateTime, endDate: DateTime): string {
        return this.rangeDateTime(startDate, endDate, this.formatterConfig.rangeTemplates.closedRange.middle);
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
            .replace('февр', this.formatterConfig.monthNames.short.formatted[1])
            .replace('июн', this.formatterConfig.monthNames.short.formatted[5])
            .replace('июл', this.formatterConfig.monthNames.short.formatted[6])
            .replace('сент', this.formatterConfig.monthNames.short.formatted[8])
            .replace('нояб', this.formatterConfig.monthNames.short.formatted[10])
            .replace(/(\W)\./, '$1');
    }

    private compileVariables(date: DateTime, variables: any): any {
        const compiledVariables: any = {};

        // tslint:disable-next-line:no-for-in
        for (const key in variables) {
            if (!variables.hasOwnProperty(key)) { continue; }

            const value = variables[key];
            compiledVariables[key] = this.format(date, value);
        }

        compiledVariables.CURRENT_YEAR = this.isCurrentYear(date);

        return compiledVariables;
    }

    private isCurrentYear(value: DateTime): 'yes' | 'no' {
        return this.today().hasSame(value, 'year') ? 'yes' : 'no';
    }

    private isSame(unit: DurationUnit, startDate: DateTime, endDate: DateTime): string {
        return startDate.hasSame(endDate, unit) ? 'yes' : 'no';
    }

    private configureFormatter(locale: string): void {
        this.messageformat = new MessageFormat(locale);
    }
}
