// tslint:disable:no-magic-numbers
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import {
    DateAdapter,
    MC_DATE_LOCALE,
    IFormatterRangeTemplate,
    IFormatterRelativeTemplate,
    IFormatterAbsoluteTemplate
} from '@ptsecurity/cdk/datetime';
import * as MessageFormat from 'messageformat';
// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable:no-duplicate-imports
// @ts-ignore (look at tsconfig)
import { default as _rollupMoment, Moment } from 'moment';
import { unitOfTime } from 'moment';

import { enUS } from './locales/en-US';
import { ruRU } from './locales/ru-RU';
import { IFormatterConfig } from './locales/IFormatterConfig';


const moment = _rollupMoment || _moment;

/** Configurable options for {@see MomentDateAdapter}. */
export interface IMcMomentDateAdapterOptions {
    /**
     * Turns the use of utc dates on or off.
     * {@default false}
     */
    useUtc: boolean;
    /**
     * whether should parse method try guess date format
     * {@default false}
     */
    findDateFormat: boolean;
}

/** InjectionToken for moment date adapter to configure options. */
export const MC_MOMENT_DATE_ADAPTER_OPTIONS = new InjectionToken<IMcMomentDateAdapterOptions>(
    'MC_MOMENT_DATE_ADAPTER_OPTIONS', {
        providedIn: 'root',
        factory: MC_MOMENT_DATE_ADAPTER_OPTIONS_FACTORY
    });

/** @docs-private */
// tslint:disable:naming-convention
export function MC_MOMENT_DATE_ADAPTER_OPTIONS_FACTORY(): IMcMomentDateAdapterOptions {
    return {
        useUtc: false,
        findDateFormat: false
    };
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
export class MomentDateAdapter extends DateAdapter<Moment> {

    private messageformat: MessageFormat;

    private readonly invalidDateErrorText: string = 'Invalid date';

    private formatterConfig: IFormatterConfig;

    private get momentWithLocale(): Moment {
        return moment().locale(this.locale);
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
        @Optional() @Inject(MC_DATE_LOCALE) dateLocale: string,
        @Optional() @Inject(MC_MOMENT_DATE_ADAPTER_OPTIONS)
        private options?: IMcMomentDateAdapterOptions
    ) {
        super();

        this.setLocale(dateLocale || moment.locale());

        this.configureTranslator(this.locale);
    }

    setLocale(locale: string): void {
        super.setLocale(locale);

        let momentLocaleData = moment.localeData(locale);

        // This is our customs translations
        const i18nLocals = ['en', 'ru'];

        if (i18nLocals.indexOf(locale) !== -1) {
            this.formatterConfig = locale === 'en' ? enUS : ruRU;

            momentLocaleData = moment.updateLocale(locale, {
                monthsShort: {
                    format: this.formatterConfig.monthNames.short.formatted,
                    standalone: this.formatterConfig.monthNames.short.standalone
                },
                weekdaysShort: this.formatterConfig.dayOfWeekNames.short,
                weekdays: this.formatterConfig.dayOfWeekNames.long
            });
        }

        this.localeData = {
            firstDayOfWeek: momentLocaleData.firstDayOfWeek(),
            longMonths: momentLocaleData.months(),
            shortMonths: momentLocaleData.monthsShort(),
            dates: range(31, (i) => this.createDate(2017, 0, i + 1).format('D')),
            longDaysOfWeek: momentLocaleData.weekdays(),
            shortDaysOfWeek: momentLocaleData.weekdaysShort(),
            narrowDaysOfWeek: momentLocaleData.weekdaysMin()
        };
    }

    getYear(date: Moment): number {
        return this.clone(date).year();
    }

    getMonth(date: Moment): number {
        return this.clone(date).month();
    }

    getDate(date: Moment): number {
        return this.clone(date).date();
    }

    getHours(date: Moment): number {
        return this.clone(date).hours();
    }

    getMinutes(date: Moment): number {
        return this.clone(date).minutes();
    }

    getSeconds(date: Moment): number {
        return this.clone(date).seconds();
    }

    getMilliseconds(date: Moment): number {
        return this.clone(date).milliseconds();
    }

    getTime(date: Moment): number {
        return date.valueOf();
    }

    getDayOfWeek(date: Moment): number {
        return this.clone(date).day();
    }

    getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
        // Moment.js doesn't support narrow month names
        return style === 'long' ? this.localeData.longMonths : this.localeData.shortMonths;
    }

    getDateNames(): string[] {
        return this.localeData.dates;
    }

    getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
        if (style === 'long') {
            return this.localeData.longDaysOfWeek;
        }

        if (style === 'short') {
            return this.localeData.shortDaysOfWeek;
        }

        return this.localeData.narrowDaysOfWeek;
    }

    getYearName(date: Moment): string {
        return this.clone(date).format('YYYY');
    }

    getFirstDayOfWeek(): number {
        return this.localeData.firstDayOfWeek;
    }

    getNumDaysInMonth(date: Moment): number {
        return this.clone(date).daysInMonth();
    }

    clone(date: Moment): Moment {
        return date.clone().locale(this.locale);
    }

    createDate(year: number, month: number, date: number): Moment {
        // Moment.js will create an invalid date if any of the components are out of bounds, but we
        // explicitly check each case so we can throw more descriptive errors.
        if (month < 0 || month > 11) {
            throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
        }

        if (date < 1) {
            throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
        }

        const result = this.createMoment({year, month, date}).locale(this.locale);

        // If the result isn't valid, the date must have been out of bounds for this month.
        if (!result.isValid()) {
            throw Error(`Invalid date "${date}" for month with index "${month}".`);
        }

        return result;
    }

    createDateTime(
        year: number, month: number, date: number, hours: number, minutes: number, seconds: number, milliseconds: number
    ): Moment {
        const newDate = this.createDate(year, month, date);

        newDate.hours(hours);
        newDate.minutes(minutes);
        newDate.seconds(seconds);
        newDate.milliseconds(milliseconds);

        return newDate;
    }

    today(): Moment {
        return this.createMoment().locale(this.locale);
    }

    parse(value: any, parseFormat: string | string[]): Moment | null {
        if (value) {
            if (value && typeof value === 'string') {
                if (this.options && this.options.findDateFormat) {
                    return this.findFormat(value);
                }

                return parseFormat
                    ? this.createMoment(value, parseFormat, this.locale)
                    : this.createMoment(value).locale(this.locale);
            }

            return this.createMoment(value).locale(this.locale);
        }

        return null;
    }

    format(date: Moment, displayFormat: string): string {
        // tslint:disable:no-parameter-reassignment
        date = this.clone(date);
        if (!this.isValid(date)) {
            throw Error('MomentDateAdapter: Cannot format invalid date.');
        }

        return date.format(displayFormat);
    }

    addCalendarYears(date: Moment, years: number): Moment {
        return this.clone(date).add({ years });
    }

    addCalendarMonths(date: Moment, months: number): Moment {
        return this.clone(date).add({ months });
    }

    addCalendarDays(date: Moment, days: number): Moment {
        return this.clone(date).add({ days });
    }

    toIso8601(date: Moment): string {
        return this.clone(date).format();
    }

    /** https://www.ietf.org/rfc/rfc3339.txt */
    deserialize(value: any): Moment | null {
        let date;
        if (value instanceof Date) {
            date = this.createMoment(value).locale(this.locale);
        } else if (this.isDateInstance(value)) {
            // Note: assumes that cloning also sets the correct locale.
            return this.clone(value);
        }
        if (typeof value === 'string') {
            if (!value) {
                return null;
            }
            date = this.createMoment(value, moment.ISO_8601).locale(this.locale);
        }
        if (date && this.isValid(date)) {
            return this.createMoment(date).locale(this.locale);
        }

        return super.deserialize(value);
    }

    isDateInstance(obj: any): boolean {
        return moment.isMoment(obj);
    }

    isValid(date: Moment): boolean {
        return this.clone(date).isValid();
    }

    invalid(): Moment {
        return moment.invalid();
    }

    relativeDate(date: Moment, template: IFormatterRelativeTemplate): string {
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

    relativeShortDate(date: Moment): string {
        return this.relativeDate(date, this.formatterConfig.relativeTemplates.short);
    }

    relativeLongDate(date: Moment): string {
        return this.relativeDate(date, this.formatterConfig.relativeTemplates.long);
    }

    absoluteDate(date: Moment, params: IFormatterAbsoluteTemplate, datetime = false): string {
        if (!this.isDateInstance(date)) { throw new Error(this.invalidDateErrorText); }

        const variables = {...this.formatterConfig.variables, ...params.variables};
        const template = datetime ? params.DATETIME : params.DATE;

        return this.messageformat.compile(template)(this.compileVariables(date, variables));
    }

    absoluteShortDate(date: Moment): string {
        return this.absoluteDate(date, this.formatterConfig.absoluteTemplates.short);
    }

    absoluteShortDateTime(date: Moment): string {
        return this.absoluteDate(date, this.formatterConfig.absoluteTemplates.short, true);
    }

    absoluteLongDate(date: Moment): string {
        return this.absoluteDate(date, this.formatterConfig.absoluteTemplates.long);
    }

    absoluteLongDateTime(date: Moment): string {
        return this.absoluteDate(date, this.formatterConfig.absoluteTemplates.long, true);
    }

    openedRangeDate(startDate: Moment | null, endDate: Moment | null, template: IFormatterRangeTemplate) {
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

    openedRangeDateTime(startDate: Moment | null, endDate: Moment | null, template: IFormatterRangeTemplate) {
        console.log('openedRangeDateTime: '); // tslint:disable-line:no-console
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

    rangeDate(startDate: Moment, endDate: Moment, template: IFormatterRangeTemplate): string {
        if (!this.isDateInstance(startDate) || !this.isDateInstance(endDate)) {
            throw new Error(this.invalidDateErrorText);
        }

        const variables = { ...this.formatterConfig.variables, ...template.variables };
        const sameMonth = this.isSame('month', startDate, endDate);

        const startDateVariables = this.compileVariables(startDate, variables);
        startDateVariables.SAME_MONTH = sameMonth;

        const endDateVariables = this.compileVariables(endDate, variables);
        endDateVariables.SAME_MONTH = sameMonth;

        const bothCurrentYear =
            startDateVariables.CURRENT_YEAR === 'yes' &&
            endDateVariables.CURRENT_YEAR === 'yes';
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

    rangeDateTime(startDate: Moment, endDate: Moment, template: IFormatterRangeTemplate): string {
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

        const bothCurrentYear =
            startDateVariables.CURRENT_YEAR === 'yes' &&
            endDateVariables.CURRENT_YEAR === 'yes';
        startDateVariables.CURRENT_YEAR = bothCurrentYear ? 'yes' : 'no';
        endDateVariables.CURRENT_YEAR = bothCurrentYear ? 'yes' : 'no';

        const params = {...variables,
            START_DATETIME: this.messageformat.compile(template.START_DATETIME)(startDateVariables),
            END_DATETIME: this.messageformat.compile(template.END_DATETIME)(endDateVariables),
            SAME_MONTH: sameMonth,
            SAME_DAY: sameDay};

        return this.messageformat.compile(template.DATETIME)(params);
    }

    rangeShortDate(startDate: Moment | null, endDate?: Moment): string {
        const rangeTemplates = this.formatterConfig.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDate(startDate, endDate, rangeTemplates.closedRange.short);
        }

        return this.openedRangeDate(startDate, endDate || null, rangeTemplates.openedRange.short);
    }

    rangeShortDateTime(startDate: Moment | null, endDate?: Moment): string {
        const rangeTemplates = this.formatterConfig.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDateTime(startDate, endDate, rangeTemplates.closedRange.short);
        }

        return this.openedRangeDateTime(startDate, endDate || null, rangeTemplates.openedRange.short);
    }

    rangeLongDate(startDate: Moment | null, endDate?: Moment): string {
        const rangeTemplates = this.formatterConfig.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDate(startDate, endDate, rangeTemplates.closedRange.long);
        }

        return this.openedRangeDate(startDate, endDate || null, rangeTemplates.openedRange.long);
    }

    rangeLongDateTime(startDate: Moment | null, endDate?: Moment): string {
        const rangeTemplates = this.formatterConfig.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDateTime(startDate, endDate, rangeTemplates.closedRange.long);
        }

        return this.openedRangeDateTime(startDate, endDate || null, rangeTemplates.openedRange.long);
    }

    rangeMiddleDateTime(startDate: Moment, endDate: Moment): string {
        return this.rangeDateTime(startDate, endDate, this.formatterConfig.rangeTemplates.closedRange.middle);
    }

    /** Creates a Moment instance while respecting the current UTC settings. */
    private createMoment(...args: any[]): Moment {
        return (this.options && this.options.useUtc) ? moment.utc(...args) : moment(...args);
    }

    private compileVariables(date: Moment, variables: any): any {
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

    private isCurrentYear(value: Moment): 'yes' | 'no' {
        return this.momentWithLocale.isSame(value, 'year') ? 'yes' : 'no';
    }

    private isSame(unit: unitOfTime.StartOf, startDate: Moment, endDate: Moment): string {
        return startDate.isSame(endDate, unit) ? 'yes' : 'no';
    }

    private configureTranslator(locale: string): void {
        this.messageformat = new MessageFormat(locale);
    }

    private isNumeric(value: any): boolean {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    private findFormat(value: string): Moment | null {
        if (!value) {
            return null;
        }

        // default test - iso
        const isoDate =  this.createMoment(value, moment.ISO_8601, this.locale);

        if (isoDate.isValid()) {
            return isoDate;
        }

        if (this.isNumeric(value)) {
            // unix time sec
            return this.createMoment(value, 'X', this.locale);
        }

        // long months naming: D MMM YYYY, MMM Do YYYY with short case support
        if (
            /^\d{1,2}\s\S+\s(\d{2}|\d{4})$/.test(value.trim()) ||
            /^\S+\s\d{1,2}[a-z]{2}\s(\d{2}|\d{4})$/.test(value.trim())
        ) {
            return this.parseWithSpace(value);
        }

        // slash notation: DD/MM/YYYY, MM/DD/YYYY with short case support
        if (/^\d{1,2}\/\d{1,2}\/(\d{2}|\d{4})$/.test(value)) {
            return this.parseWithSlash(value);
        }

        // dash notation: DD-MM-YYYY, YYYY-DD-MM with short case support
        if (/(^(\d{1,2}|\d{4})-\d{1,2}-\d{1,2}$)|(^\d{1,2}-\d{1,2}-(\d{2}|\d{4})$)/.test(value)) {
           return this.parseWithDash(value);
        }

        // dot notation: DD.MM.YYYY with short case support
        if (/^\d{1,2}\.\d{1,2}\.(\d{2}|\d{4})$/.test(value)) {
            return this.parseWithDot(value);
        }

        return null;
    }

    private parseWithSpace(value: string): Moment | null {
        switch (this.locale) {
            case 'ru':
                return this.createMoment(value, 'DD MMMM YYYY', this.locale);
            case 'en':
                // 16 Feb 2019 vs Feb 16th 2019, covers Feb and February cases
                if (this.isNumeric(value[0])) {
                    return this.createMoment(value, 'D MMMM YYYY', this.locale);
                }

                return this.createMoment(value, 'MMMM Do YYYY', this.locale);
            default:
                throw new Error(`Locale ${this.locale} is not supported`);
        }
    }

    private parseWithSlash(value: string): Moment | null {
        switch (this.locale) {
            case 'ru':
                return this.createMoment(value, 'DD/MM/YYYY', this.locale);
            // todo do we use generalized locales? en vs en-US; until not we try to guess
            case 'en':
                // US vs UK
                const parts = value.split('/');
                const datePartsCount = 3;
                if (parts.length !== datePartsCount) {
                    return null;
                }

                const firstPart = parts[0].trim();
                const secondPart = parts[1].trim();

                if (!this.isNumeric(firstPart) || !this.isNumeric(secondPart)) {
                    return null;
                }

                const monthsInYears = 12;

                const canFirstBeMonth = +firstPart <= monthsInYears;
                const canSecondByMonth = +secondPart <= monthsInYears;

                // first two parts cannot be month
                if (!canFirstBeMonth && !canSecondByMonth) {
                    return null;
                }

                const canDetermineWhereMonth = canFirstBeMonth && canSecondByMonth;

                if (canDetermineWhereMonth) {
                    // use US format by default
                    return this.createMoment(value, 'MM/DD/YYYY', this.locale);
                }

                return canFirstBeMonth && !canSecondByMonth
                    ? this.createMoment(value, 'MM/DD/YYYY', this.locale)
                    : this.createMoment(value, 'DD/MM/YYYY', this.locale);
            default:
                throw new Error(`Locale ${this.locale} is not supported`);
        }
    }

    private parseWithDash(value: string): Moment | null {
        // leading year vs finishing year
        const parts = value.split('-');
        if (parts[0].length === 0) {
            return null;
        }

        const maxDayOrMonthCharsCount = 2;

        return parts[0].length <= maxDayOrMonthCharsCount
            ? this.createMoment(value, 'DD-MM-YYYY', this.locale)
            : this.createMoment(value, 'YYYY-MM-DD', this.locale);
    }

    private parseWithDot(value: string): Moment | null {
        // covers two cases YYYY and YY (for current year)
        return this.createMoment(value, 'DD.MM.YYYY', this.locale);
    }
}
