// tslint:disable:no-magic-numbers
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import {
    DateAdapter,
    MC_DATE_LOCALE,
    IFormatterRangeTemplate,
    IFormatterRelativeTemplate,
    IFormatterAbsoluteTemplate,
    IAbsoluteDateTimeOptions
} from '@ptsecurity/cdk/datetime';
import { DateTime } from 'luxon';
import * as MessageFormat from 'messageformat';

import { enUS } from './locales/en-US';
import { ruRU } from './locales/ru-RU';
import { IFormatterConfig } from './locales/IFormatterConfig';


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

/** Creates an array and fills it with values. */
function range<T>(length: number, valueFunction: (index: number) => T): T[] {
    const valuesArray = Array(length);

    for (let i = 0; i < length; i++) {
        valuesArray[i] = valueFunction(i);
    }

    return valuesArray;
}

@Injectable()
export class LuxonDateAdapter extends DateAdapter<DateTime> {
    private messageformat: MessageFormat;

    private readonly invalidDateErrorText: string = 'Invalid date';

    private formatterConfig: IFormatterConfig;

    private get momentWithLocale(): DateTime {
        return DateTime.now().setLocale(this.locale);
    }

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

        this.configureTranslator(this.locale);
    }

    setLocale(locale: string): void {
        super.setLocale(locale);
        //
        // let momentLocaleData = moment.localeData(locale);
        //
        // // This is our customs translations
        // const i18nLocals = ['en', 'ru'];
        //
        // if (i18nLocals.indexOf(locale) !== -1) {
        //     this.formatterConfig = locale === 'en' ? enUS : ruRU;
        //
        //     momentLocaleData = moment.updateLocale(locale, {
        //         monthsShort: {
        //             format: this.formatterConfig.monthNames.short.formatted,
        //             standalone: this.formatterConfig.monthNames.short.standalone
        //         },
        //         weekdaysShort: this.formatterConfig.dayOfWeekNames.short,
        //         weekdays: this.formatterConfig.dayOfWeekNames.long
        //     });
        // }
        //
        // this.localeData = {
        //     firstDayOfWeek: momentLocaleData.firstDayOfWeek(),
        //     longMonths: momentLocaleData.months(),
        //     shortMonths: momentLocaleData.monthsShort(),
        //     dates: range(31, (i) => this.createDate(2017, 0, i + 1).format('D')),
        //     longDaysOfWeek: momentLocaleData.weekdays(),
        //     shortDaysOfWeek: momentLocaleData.weekdaysShort(),
        //     narrowDaysOfWeek: momentLocaleData.weekdaysMin()
        // };
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

    getYear(date: DateTime): number {
        return this.clone(date).year;
    }

    getMonth(date: DateTime): number {
        return this.clone(date).month;
    }

    getDate(date: DateTime): number {
        return this.clone(date).day;
    }

    getHours(date: DateTime): number {
        return this.clone(date).hour;
    }

    getMinutes(date: DateTime): number {
        return this.clone(date).minute;
    }

    getSeconds(date: DateTime): number {
        return this.clone(date).second;
    }

    getMilliseconds(date: DateTime): number {
        return this.clone(date).millisecond;
    }

    getTime(date: DateTime): number {
        return date.valueOf();
    }

    getDayOfWeek(date: DateTime): number {
        return this.clone(date).weekday;
    }

    getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
        // Moment.js doesn't support narrow month names
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
        return this.clone(date).format('YYYY');
    }

    getFirstDayOfWeek(): number {
        return this.localeData.firstDayOfWeek;
    }

    getNumDaysInMonth(date: DateTime): number {
        return this.clone(date).daysInMonth;
    }

    clone(date: DateTime): DateTime {
        return date.clone().locale(this.locale);
    }

    createDate(year: number, month: number, date: number): DateTime {
        // Moment.js will create an invalid date if any of the components are out of bounds, but we
        // explicitly check each case so we can throw more descriptive errors.
        if (month < 0 || month > 11) {
            throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
        }

        if (date < 1) {
            throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
        }

        const result = this.create({year, month, date}).locale(this.locale);

        // If the result isn't valid, the date must have been out of bounds for this month.
        if (!result.isValid()) {
            throw Error(`Invalid date "${date}" for month with index "${month}".`);
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

        newDate.hours(hours);
        newDate.minutes(minutes);
        newDate.seconds(seconds);
        newDate.milliseconds(milliseconds);

        return newDate;
    }

    today(): DateTime {
        return this.create().locale(this.locale);
    }

    parse(value: any, parseFormat: string | string[]): DateTime | null {
        if (value) {
            if (value && typeof value === 'string') {
                return parseFormat
                    ? this.create(value, parseFormat, this.locale)
                    : this.create(value).locale(this.locale);
            }

            return this.create(value).locale(this.locale);
        }

        return null;
    }

    format(date: DateTime, displayFormat: string): string {
        // tslint:disable:no-parameter-reassignment
        date = this.clone(date);
        if (!this.isValid(date)) {
            throw Error('MomentDateAdapter: Cannot format invalid date.');
        }

        return date.format(displayFormat);
    }

    addCalendarYears(date: DateTime, years: number): DateTime {
        return this.clone(date).add({ years });
    }

    addCalendarMonths(date: DateTime, months: number): DateTime {
        return this.clone(date).add({ months });
    }

    addCalendarDays(date: DateTime, days: number): DateTime {
        return this.clone(date).add({ days });
    }

    toIso8601(date: DateTime): string {
        return this.clone(date).format();
    }

    /** https://www.ietf.org/rfc/rfc3339.txt */
    deserialize(value: any): DateTime | null {
        let date;
        if (value instanceof Date) {
            date = this.create(value).locale(this.locale);
        } else if (this.isDateInstance(value)) {
            // Note: assumes that cloning also sets the correct locale.
            return this.clone(value);
        }

        if (typeof value === 'string') {
            if (!value) {
                return null;
            }
            date = this.create(value, moment.ISO_8601).locale(this.locale);
        }

        if (date && this.isValid(date)) {
            return this.create(date).locale(this.locale);
        }

        return super.deserialize(value);
    }

    isDateInstance(obj: any): boolean {
        return moment.isMoment(obj);
    }

    isValid(date: DateTime): boolean {
        return this.clone(date).isValid();
    }

    invalid(): DateTime {
        return moment.invalid();
    }

    relativeDate(date: DateTime, template: IFormatterRelativeTemplate): string {
        if (!this.isDateInstance(date)) { throw new Error(this.invalidDateErrorText); }

        const now = this.momentWithLocale;

        const totalSeconds = now.diff(date, 'seconds');
        const totalMinutes = now.diff(date, 'minutes');

        const isToday = now.isSame(date, 'day');
        const isYesterday = now.add(-1, 'days').isSame(date, 'day');

        const templateVariables = {...this.formatterConfig.variables, ...template.variables};
        const variables = this.compileVariables(date, templateVariables);
        let newTemplate;

        if (totalSeconds <= 59) { // seconds ago
            variables.SECONDS_PASSED = totalSeconds;
            newTemplate = template.SECONDS_AGO;

        } else if (totalMinutes <= 59) { // minutes ago
            variables.MINUTES_PASSED = totalMinutes;
            newTemplate = template.MINUTES_AGO;

        } else if (isToday) { // today
            newTemplate = template.TODAY;

        } else if (isYesterday) { // yesterday
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
        milliseconds = false,
        microseconds = false
    ): string {
        if (!this.isDateInstance(date)) { throw new Error(this.invalidDateErrorText); }

        const variables = this.compileVariables(date, { ...this.formatterConfig.variables, ...params.variables });

        variables.SHOW_MILLISECONDS = milliseconds ? 'yes' : 'no';
        variables.SHOW_MICROSECONDS = microseconds ? 'yes' : 'no';

        const template = datetime ? params.DATETIME : params.DATE;

        return this.messageformat.compile(template)(variables);
    }

    absoluteShortDate(date: DateTime): string {
        return this.absoluteDate(date, this.formatterConfig.absoluteTemplates.short);
    }

    absoluteShortDateTime(date: DateTime, options?: IAbsoluteDateTimeOptions): string {
        return this.absoluteDate(
            date,
            this.formatterConfig.absoluteTemplates.short,
            true,
            options?.milliseconds,
            options?.microseconds
        );
    }

    absoluteLongDate(date: DateTime): string {
        return this.absoluteDate(date, this.formatterConfig.absoluteTemplates.long);
    }

    absoluteLongDateTime(date: DateTime, options?: IAbsoluteDateTimeOptions): string {
        return this.absoluteDate(
            date,
            this.formatterConfig.absoluteTemplates.long,
            true,
            options?.milliseconds,
            options?.microseconds
        );
    }

    openedRangeDate(startDate: DateTime | null, endDate: DateTime | null, template: IFormatterRangeTemplate) {
        if (!moment.isMoment(startDate) && !moment.isMoment(endDate)) {
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
        if (!moment.isMoment(startDate) && !moment.isMoment(endDate)) {
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

        const params = {...variables,
            START_DATETIME: this.messageformat.compile(template.START_DATETIME)(startDateVariables),
            END_DATETIME: this.messageformat.compile(template.END_DATETIME)(endDateVariables),
            SAME_MONTH: sameMonth,
            SAME_DAY: sameDay};

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

    /** Creates a Moment instance while respecting the current UTC settings. */
    private create(...args: any[]): DateTime {
        return (this.options && this.options.useUtc) ? DateTime.utc(...args) : DateTime.now(...args);
    }

    private compileVariables(date: DateTime, variables: any): any {
        const compiledVariables: any = {};

        // tslint:disable-next-line:no-for-in
        for (const key in variables) {
            if (!variables.hasOwnProperty(key)) {
                continue;
            }

            const value = variables[key];
            compiledVariables[key] = date.format(value);
        }

        compiledVariables.CURRENT_YEAR = this.isCurrentYear(date);

        return compiledVariables;
    }

    private isCurrentYear(value: DateTime): 'yes' | 'no' {
        return this.momentWithLocale.isSame(value, 'year') ? 'yes' : 'no';
    }

    private isSame(unit: unitOfTime.StartOf, startDate: DateTime, endDate: DateTime): string {
        return startDate.isSame(endDate, unit) ? 'yes' : 'no';
    }

    private configureTranslator(locale: string): void {
        this.messageformat = new MessageFormat(locale);
    }
}
