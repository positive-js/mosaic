// tslint:disable:no-magic-numbers
import { Inject, Injectable } from '@angular/core';
// tslint:disable:import-name
import MessageFormat from '@messageformat/core';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';

import { enUS } from './templates/en-US';
import { ruRU } from './templates/ru-RU';


/**
 * interface for absolute date or datetime formatter template
 */
// tslint:disable-next-line:naming-convention
export interface FormatterAbsoluteTemplate {
    variables?: { [name: string]: string };
    DATE: string;
    DATETIME: string;
}

/**
 * interface for range date or datetime formatter template
 */
// tslint:disable-next-line:naming-convention
export interface FormatterRangeTemplate {
    variables?: { [name: string]: string };
    START_DATE: string;
    END_DATE: string;
    DATE: string;
    START_DATETIME: string;
    END_DATETIME: string;
    DATETIME: string;
}

/**
 * interface for relative date or datetime formatter template
 */
// tslint:disable-next-line:naming-convention
export interface FormatterRelativeTemplate {
    variables?: { [name: string]: string };
    BEFORE_YESTERDAY: string;
    YESTERDAY: string;
    TODAY: string;
    TOMORROW: string;
    AFTER_TOMORROW: string;
}

// tslint:disable-next-line:naming-convention
export interface DateTimeOptions {
    seconds?: boolean;
    milliseconds?: boolean;
}

// tslint:disable-next-line:naming-convention
export interface FormatterConfig {
    relativeTemplates: {
        short: FormatterRelativeTemplate;
        long: FormatterRelativeTemplate;
    };
    absoluteTemplates: {
        short: FormatterAbsoluteTemplate;
        long: FormatterAbsoluteTemplate;
    };
    rangeTemplates: {
        closedRange: {
            short: FormatterRangeTemplate;
            middle: FormatterRangeTemplate;
            long: FormatterRangeTemplate;
        };
        openedRange: {
            short: FormatterRangeTemplate;
            long: FormatterRangeTemplate;
        };
    };
}


@Injectable()
export class DateFormatter<D> {
    config: FormatterConfig;

    private readonly invalidDateErrorText: string = 'Invalid date';

    private messageFormat: MessageFormat;

    constructor(
        private readonly adapter: DateAdapter<D>,
        @Inject(MC_DATE_LOCALE) locale: string
    ) {
        this.config = locale === 'en' ? enUS : ruRU;

        this.messageFormat = new MessageFormat(locale);
    }

    setLocale(locale: string): void {
        this.config = locale === 'en' ? enUS : ruRU;

        this.adapter.setLocale(locale);
    }

    /**
     * @param date - date
     * @param template - template
     * @returns relative date by template
     */
    relativeDate(
        date: D,
        template: FormatterRelativeTemplate,
        seconds = false,
        milliseconds = false
    ): string {
        if (!this.adapter.isDateInstance(date)) { throw new Error(this.invalidDateErrorText); }

        let newTemplate;

        const templateVariables = {...this.adapter.config.variables, ...template.variables};

        if (this.isBeforeYesterday(date)) {
            newTemplate = template.BEFORE_YESTERDAY;
        } else if (this.isYesterday(date)) {
            newTemplate = template.YESTERDAY;
        } else if (this.isToday(date)) {
            newTemplate = template.TODAY;
        } else if (this.isTomorrow(date)) {
            newTemplate = template.TOMORROW;
        } else if (this.isAfterTomorrow(date)) {
            newTemplate = template.AFTER_TOMORROW;
        }

        const variables = this.compileVariables(date, templateVariables);

        variables.SHOW_SECONDS = seconds ? 'yes' : 'no';
        variables.SHOW_MILLISECONDS = milliseconds ? 'yes' : 'no';

        return this.messageFormat.compile(newTemplate)(variables);
    }

    /**
     * @param date - date
     * @returns relative date in short format
     */
    relativeShortDate(date: D): string {
        return this.relativeDate(date, this.config.relativeTemplates.short);
    }

    /**
     * @param date - date
     * @returns relative date in long format
     */
    relativeLongDate(date: D): string {
        return this.relativeDate(date, this.config.relativeTemplates.long);
    }

    /**
     * @param date - date
     * @param options - DateTimeOptions
     * @returns relative date in short format with time
     */
    relativeShortDateTime(date: D, options?: DateTimeOptions): string {
        return this.relativeDate(date, this.config.relativeTemplates.short, options?.seconds, options?.milliseconds);
    }

    /**
     * @param date - date
     * @param options - DateTimeOptions
     * @returns relative date in long format with time
     */
    relativeLongDateTime(date: D, options?: DateTimeOptions): string {
        return this.relativeDate(date, this.config.relativeTemplates.long, options?.seconds, options?.milliseconds);
    }

    /**
     * @param date - date
     * @param params - parameters
     * @param datetime - should time be shown as well
     * @param seconds - should time with seconds be shown as well
     * @param milliseconds - should time with milliseconds be shown as well
     * @returns absolute date in common format
     */
    absoluteDate(
        date: D,
        params: FormatterAbsoluteTemplate,
        datetime = false,
        seconds = false,
        milliseconds = false
    ): string {
        if (!this.adapter.isDateInstance(date)) { throw new Error(this.invalidDateErrorText); }

        const variables = this.compileVariables(date, { ...this.adapter.config.variables, ...params.variables });

        variables.SHOW_SECONDS = seconds ? 'yes' : 'no';
        variables.SHOW_MILLISECONDS = milliseconds ? 'yes' : 'no';

        const template = datetime ? params.DATETIME : params.DATE;

        return this.messageFormat.compile(template)(variables);
    }

    /**
     * @param date - date
     * @returns absolute date in short format
     */
    absoluteShortDate(date: D): string {
        return this.absoluteDate(date, this.config.absoluteTemplates.short);
    }

    /**
     * @param date - date
     * @param options - DateTimeOptions
     * @returns absolute date in short format with time
     */
    absoluteShortDateTime(date: D, options?: DateTimeOptions): string {
        return this.absoluteDate(date, this.config.absoluteTemplates.short, true, options?.seconds, options?.milliseconds);
    }

    /**
     * @param date - date
     * @returns absolute date in long format
     */
    absoluteLongDate(date: D): string {
        return this.absoluteDate(date, this.config.absoluteTemplates.long);
    }

    /**
     * @param date - date
     * @param options - DateTimeOptions
     * @returns absolute date in long format with time
     */
    absoluteLongDateTime(date: D, options?: DateTimeOptions): string {
        return this.absoluteDate(date, this.config.absoluteTemplates.long, true, options?.seconds, options?.milliseconds);
    }

    /**
     * @param startDate - start date
     * @param endDate - end date
     * @param template - template
     * @returns opened date
     */
    openedRangeDate(startDate: D | null, endDate: D | null, template: FormatterRangeTemplate) {
        if (!this.adapter.isDateInstance(startDate) && !this.adapter.isDateInstance(endDate)) {
            throw new Error(this.invalidDateErrorText);
        }

        const variables = { ...this.adapter.config.variables, ...template.variables };
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

    /**
     * @param startDate - start date
     * @param endDate - end date
     * @param template - template
     * @param seconds - should time with seconds be shown as well
     * @param milliseconds - should time with milliseconds be shown as well
     * @returns opened date
     */
    openedRangeDateTime(
        startDate: D | null,
        endDate: D | null,
        template: FormatterRangeTemplate,
        seconds = false,
        milliseconds = false
    ) {
        if (!this.adapter.isDateInstance(startDate) && !this.adapter.isDateInstance(endDate)) {
            throw new Error(this.invalidDateErrorText);
        }

        const variables = { ...this.adapter.config.variables, ...template.variables };
        let params = {};

        if (startDate) {
            const startDateVariables = this.compileVariables(startDate, variables);
            startDateVariables.SHOW_SECONDS = seconds ? 'yes' : 'no';
            startDateVariables.SHOW_MILLISECONDS = milliseconds ? 'yes' : 'no';

            params = {
                ...variables,
                START_DATETIME: this.messageFormat.compile(template.START_DATETIME)(startDateVariables),
                RANGE_TYPE: 'onlyStart'
            };
        } else if (endDate) {
            const endDateVariables = this.compileVariables(endDate, variables);
            endDateVariables.SHOW_SECONDS = seconds ? 'yes' : 'no';
            endDateVariables.SHOW_MILLISECONDS = milliseconds ? 'yes' : 'no';

            params = {
                ...variables,
                END_DATETIME: this.messageFormat.compile(template.END_DATETIME)(endDateVariables),
                RANGE_TYPE: 'onlyEnd'
            };
        }

        return this.messageFormat.compile(template.DATETIME)(params);
    }

    /**
     * @param startDate - start date
     * @param endDate - end date
     * @param template - template
     * @returns range date in template format
     */
    rangeDate(startDate: D, endDate: D, template: FormatterRangeTemplate): string {
        if (!this.adapter.isDateInstance(startDate) || !this.adapter.isDateInstance(endDate)) {
            throw new Error(this.invalidDateErrorText);
        }

        const variables = { ...this.adapter.config.variables, ...template.variables };
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

    /**
     * @param startDate - start date
     * @param endDate - end date
     * @param template - template
     * @returns range date in template format with time
     */
    rangeDateTime(startDate: D, endDate: D, template: FormatterRangeTemplate, seconds = false, milliseconds = false): string {
        if (!this.adapter.isDateInstance(startDate) || !this.adapter.isDateInstance(endDate)) {
            throw new Error(this.invalidDateErrorText);
        }

        const variables = {...this.adapter.config.variables, ...template.variables};

        const sameMonth = this.hasSame(startDate, endDate, 'month');
        const sameDay = this.hasSame(startDate, endDate, 'day');

        const startDateVariables = this.compileVariables(startDate, variables);
        startDateVariables.SAME_MONTH = sameMonth;
        startDateVariables.SAME_DAY = sameDay;
        startDateVariables.SHOW_SECONDS = seconds ? 'yes' : 'no';
        startDateVariables.SHOW_MILLISECONDS = milliseconds ? 'yes' : 'no';

        const endDateVariables = this.compileVariables(endDate, variables);
        endDateVariables.SAME_MONTH = sameMonth;
        endDateVariables.SAME_DAY = sameDay;
        endDateVariables.SHOW_SECONDS = seconds ? 'yes' : 'no';
        endDateVariables.SHOW_MILLISECONDS = milliseconds ? 'yes' : 'no';

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

    /**
     * @param startDate - start date
     * @param endDate - end date
     * @returns range date in short format
     */
    rangeShortDate(startDate: D | null, endDate?: D): string {
        const rangeTemplates = this.config.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDate(startDate, endDate, rangeTemplates.closedRange.short);
        }

        return this.openedRangeDate(startDate, endDate || null, rangeTemplates.openedRange.short);
    }

    /**
     * @param startDate - start date
     * @param endDate - end date
     * @param options - DateTimeOptions
     * @returns range date in short format with time
     */
    rangeShortDateTime(startDate: D | null, endDate?: D | null, options?: DateTimeOptions): string {
        const rangeTemplates = this.config.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDateTime(startDate, endDate, rangeTemplates.closedRange.short, options?.seconds, options?.milliseconds);
        }

        return this.openedRangeDateTime(
            startDate,
            endDate || null,
            rangeTemplates.openedRange.short,
            options?.seconds,
            options?.milliseconds
        );
    }

    /**
     * @param startDate - start date
     * @param endDate - end date
     * @returns range date in long format
     */
    rangeLongDate(startDate: D | null, endDate?: D | null): string {
        const rangeTemplates = this.config.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDate(startDate, endDate, rangeTemplates.closedRange.long);
        }

        return this.openedRangeDate(startDate, endDate || null, rangeTemplates.openedRange.long);
    }

    /**
     * @param startDate - start date
     * @param endDate - end date
     * @param options - DateTimeOptions
     * @returns range date in long format with time
     */
    rangeLongDateTime(startDate: D | null, endDate?: D, options?: DateTimeOptions): string {
        const rangeTemplates = this.config.rangeTemplates;

        if (startDate && endDate) {
            return this.rangeDateTime(startDate, endDate, rangeTemplates.closedRange.long, options?.seconds, options?.milliseconds);
        }

        return this.openedRangeDateTime(startDate, endDate || null, rangeTemplates.openedRange.long);
    }

    /**
     * @param startDate - start date
     * @param endDate - end date
     * @param options - DateTimeOptions
     * @returns range middle date with time
     */
    rangeMiddleDateTime(startDate: D, endDate: D, options?: DateTimeOptions): string {
        return this.rangeDateTime(
            startDate,
            endDate,
            this.config.rangeTemplates.closedRange.middle,
            options?.seconds,
            options?.milliseconds
        );
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

    private isBeforeYesterday(date: D): boolean {
        return this.adapter.daysFromToday(date) <= -2;
    }

    private isYesterday(date: D): boolean {
        const interval = this.adapter.daysFromToday(date);

        return interval > -2 && interval <= -1;
    }

    private isToday(date: D): boolean {
        return this.adapter.daysFromToday(date) === 0;
    }

    private isTomorrow(date: any): boolean {
        const interval = this.adapter.daysFromToday(date);

        return interval >= 1 && interval < 2;
    }

    private isAfterTomorrow(date: D): boolean {
        return this.adapter.daysFromToday(date) >= 2;
    }

    private hasSame(startDate: D, endDate: D, unit: string): string {
        return this.adapter.hasSame(startDate, endDate, unit) ? 'yes' : 'no';
    }
}
