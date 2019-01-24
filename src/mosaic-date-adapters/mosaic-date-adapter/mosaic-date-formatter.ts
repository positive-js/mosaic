// tslint:disable:no-magic-numbers
import * as MessageFormat from 'messageformat';
// tslint:disable-next-line:no-duplicate-imports
import * as _moment from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment, unitOfTime } from 'moment';

import {
    IFormatterConfig,
    IFormatterRangeTemplate,
    IFormatterRelativeTemplate,
    IFormatterVariables
} from './mosaic-date-formatter-configs';


const moment = _rollupMoment || _moment;

type YesNoType = 'yes' | 'no';

interface ICompiledVariables {
    CURRENT_YEAR?: YesNoType;
    SECONDS_PASSED?: number;
    MINUTES_PASSED?: number;
    SAME_MONTH?: YesNoType;
    SAME_DAY?: YesNoType;
}

// todo extract moment types (as function, as namespace and as Moment) if it is possible
export type MomentType = any | ((...args: any[]) => Moment);

export class McDateFormatter {
    private readonly errorText: string = 'Invalid date';

    private messageformat: MessageFormat;

    get moment(): MomentType {
        return this._moment;
    }

    private _moment: MomentType;

    constructor(private config: IFormatterConfig, private locale) {
        this.configure();
    }

    compileVariables(date: Moment, variables: IFormatterVariables): ICompiledVariables {
        const compiledVariables: ICompiledVariables = {};

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

    relativeDate(value: Moment, template: IFormatterRelativeTemplate) {
        if (!this._moment.isMoment(value)) { throw new Error(this.errorText); }

        const now = this.momentWithLocale();

        const totalSeconds = now.diff(value, 'seconds');
        const totalMinutes = now.diff(value, 'minutes');

        const isToday = now.isSame(value, 'day');
        const isYesterday = now.add(-1, 'days').isSame(value, 'day');

        const templateVariables: IFormatterVariables = {...this.config.variables, ...template.variables};
        const variables = this.compileVariables(value, templateVariables);
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

    relativeShortDate(date: Moment) {
        return this.relativeDate(date, this.config.relativeTemplates.short);
    }

    relativeLongDate(date: Moment) {
        return this.relativeDate(date, this.config.relativeTemplates.long);
    }

    absoluteDate(date: Moment, params, datetime = false) {
        if (!this._moment.isMoment(date)) { throw new Error(this.errorText); }

        const variables = {...this.config.variables, ...params.variables};
        const template = datetime ? params.DATETIME : params.DATE;

        return this.messageformat.compile(template)(this.compileVariables(date, variables));
    }

    absoluteShortDate(date) {
        return this.absoluteDate(date, this.config.absoluteTemplates.short);
    }

    absoluteShortDateTime(date) {
        return this.absoluteDate(date, this.config.absoluteTemplates.short, true);
    }

    absoluteLongDate(date) {
        return this.absoluteDate(date, this.config.absoluteTemplates.long);
    }

    absoluteLongDateTime(date) {
        return this.absoluteDate(date, this.config.absoluteTemplates.long, true);
    }

    rangeDate(startDate: Moment, endDate: Moment, template: IFormatterRangeTemplate) {
        if (!this._moment.isMoment(startDate) || !this._moment.isMoment(endDate)) { throw new Error(this.errorText); }

        const variables = {...this.config.variables, ...template.variables};
        const sameMonth = this.isSame('month', startDate, endDate);

        const startDateVariables = this.compileVariables(startDate, variables);
        startDateVariables.SAME_MONTH = sameMonth;

        const endDateVariables = this.compileVariables(endDate, variables);
        endDateVariables.SAME_MONTH = sameMonth;

        const params = {...variables,
            START_DATE: this.messageformat.compile(template.START_DATE)(startDateVariables),
            END_DATE: this.messageformat.compile(template.END_DATE)(endDateVariables),
            SAME_MONTH: sameMonth};

        return this.messageformat.compile(template.DATE)(params);
    }

    rangeDateTime(startDate: Moment, endDate: Moment, template: IFormatterRangeTemplate) {
        if (!this._moment.isMoment(startDate) || !this._moment.isMoment(endDate)) { throw new Error(this.errorText); }

        const variables = {...this.config.variables, ...template.variables};
        const sameMonth = this.isSame('month', startDate, endDate);
        const sameDay = this.isSame('day', startDate, endDate);

        const startDateVariables = this.compileVariables(startDate, variables);
        startDateVariables.SAME_MONTH = sameMonth;
        startDateVariables.SAME_DAY = sameDay;

        const endDateVariables = this.compileVariables(endDate, variables);
        endDateVariables.SAME_MONTH = sameMonth;
        endDateVariables.SAME_DAY = sameDay;

        const params = {...variables,
            START_DATETIME: this.messageformat.compile(template.START_DATETIME)(startDateVariables),
            END_DATETIME: this.messageformat.compile(template.END_DATETIME)(endDateVariables),
            SAME_MONTH: sameMonth,
            SAME_DAY: sameDay};

        return this.messageformat.compile(template.DATETIME)(params);
    }

    rangeShortDate(startDate: Moment, endDate: Moment) {
        return this.rangeDate(startDate, endDate, this.config.rangeTemplates.short);
    }

    rangeShortDateTime(startDate: Moment, endDate: Moment) {
        return this.rangeDateTime(startDate, endDate, this.config.rangeTemplates.short);
    }

    rangeLongDate(startDate: Moment, endDate: Moment) {
        return this.rangeDate(startDate, endDate, this.config.rangeTemplates.long);
    }

    rangeLongDateTime(startDate: Moment, endDate: Moment) {
        return this.rangeDateTime(startDate, endDate, this.config.rangeTemplates.long);
    }

    rangeMiddleDateTime(startDate: Moment, endDate: Moment) {
        return this.rangeDateTime(startDate, endDate, this.config.rangeTemplates.middle);
    }

    private isCurrentYear(value: Moment) {
        return this.momentWithLocale().isSame(value, 'year') ? 'yes' : 'no';
    }

    private isSame(unit: unitOfTime.StartOf, startDate: Moment, endDate: Moment): YesNoType {
        return startDate.isSame(endDate, unit) ? 'yes' : 'no';
    }

    private momentWithLocale() {
        return this.moment().locale(this.locale);
    }

    private configure() {
        this.configureMoment(this.locale);
        this.configureTranslator(this.locale);
    }

    private configureTranslator(locale) {
        this.messageformat = new MessageFormat(locale);
    }

    private configureMoment(locale: string) {
        this._moment = moment;

        const momentLocale = locale.substr(0, 2);

        this._moment.updateLocale(momentLocale, {
            monthsShort: {
                format: this.config.monthNames.short,
                standalone: this.config.monthNames.short
            }
        });
    }
}
